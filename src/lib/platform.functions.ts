import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

type CreateCompanyInput = {
  name: string;
  company_type: string;
  email: string;
  phone?: string;
  owner_name: string;
};

async function assertSuperAdmin(supabase: {
  from: (t: string) => {
    select: (c: string) => {
      eq: (k: string, v: string) => { maybeSingle: () => Promise<{ data: unknown }> };
    };
  };
}, userId: string) {
  const { data } = await supabase
    .from("profiles")
    .select("is_super_admin")
    .eq("id", userId)
    .maybeSingle();
  const ok = (data as { is_super_admin?: boolean } | null)?.is_super_admin;
  if (!ok) throw new Error("Forbidden — platform owner only");
}

function tempPassword() {
  return Array(12)
    .fill("0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz!@#$%^&*")
    .map((x) => x[Math.floor(Math.random() * x.length)])
    .join("");
}

const tmpl = [
  {slug:'landlord',prefix:['dashboard','property','unit','tenant','finance','maintenance','employees','roles','verification','listing','reports','settings','audit']},
  {slug:'property_manager',prefix:['dashboard','property','unit','tenant','maintenance','listing','reports']},
  {slug:'accountant',prefix:['dashboard','finance','reports','tenant']},
  {slug:'caretaker',prefix:['dashboard','maintenance','unit']},
  {slug:'receptionist',prefix:['dashboard','tenant','listing']},
  {slug:'maintenance_technician',prefix:['dashboard','maintenance']}
];

async function fixCompanyRolePermissions(companyId: string, supabaseAdmin: any) {
  const { data: perms } = await supabaseAdmin.from('permissions').select('key');
  const { data: roles } = await supabaseAdmin.from('roles').select('id, slug').eq('company_id', companyId);
  
  if (!perms || !roles) return;

  let toInsert: any[] = [];
  for (const role of roles) {
    const t = tmpl.find(x => x.slug === role.slug);
    if (!t) continue;
    
    for (const p of perms) {
      if (t.prefix.includes(p.key.split('.')[0])) {
        toInsert.push({ role_id: role.id, permission_key: p.key });
      }
    }
  }
  
  for (let i = 0; i < toInsert.length; i += 1000) {
    const batch = toInsert.slice(i, i + 1000);
    await supabaseAdmin.from('role_permissions').upsert(batch, { onConflict: 'role_id,permission_key' });
  }
}

/** Super Admin: register a company offline and create its owner login. */
export const adminCreateCompany = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: CreateCompanyInput) => {
    if (!input.name?.trim()) throw new Error("Company name is required");
    if (!input.email?.trim()) throw new Error("Owner email is required");
    return input;
  })
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    await assertSuperAdmin(supabase as never, userId);

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const { data: company, error: companyError } = await supabaseAdmin
      .from("companies")
      .insert({
        name: data.name.trim(),
        email: data.email.trim(),
        phone: data.phone ?? null,
        company_type: data.company_type,
        activation_status: "pending_activation",
      })
      .select("id, name")
      .single();
    if (companyError) throw new Error(companyError.message);

    const password = tempPassword();
    const { data: created, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email: data.email.trim(),
      password,
      email_confirm: true,
      user_metadata: { full_name: data.owner_name || data.name, requires_password_change: true },
    });
    if (authError) {
      await supabaseAdmin.from("companies").delete().eq("id", company.id);
      throw new Error(authError.message);
    }

    const newUserId = created.user!.id;

    await supabaseAdmin
      .from("profiles")
      .update({ company_id: company.id, full_name: data.owner_name, position: "Landlord" })
      .eq("id", created.user!.id);

    const { data: landlordRole } = await supabaseAdmin.rpc("seed_company_roles", {
      _company_id: company.id,
    });
    await fixCompanyRolePermissions(company.id, supabaseAdmin);
    if (landlordRole) {
      await supabaseAdmin
        .from("user_roles")
        .insert({ user_id: newUserId, role_id: landlordRole as string, company_id: company.id });
    }

    await supabaseAdmin.from("audit_logs").insert({
      company_id: company.id,
      actor_id: userId,
      action: "company.created_by_admin",
      entity: "companies",
      entity_id: company.id,
      metadata: { email: data.email },
    });

    return { companyId: company.id, email: data.email.trim(), temporaryPassword: password };
  });

/** Super Admin / Support: send a password reset link to a user. */
export const adminResetPassword = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { email: string }) => {
    if (!input.email?.trim()) throw new Error("Email is required");
    return input;
  })
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const { data: allowed } = await supabase.rpc("has_permission", {
      _user_id: userId,
      _key: "support.reset_password",
    });
    if (!allowed) throw new Error("Forbidden");

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin.auth.admin.generateLink({
      type: "recovery",
      email: data.email.trim(),
    });
    if (error) throw new Error(error.message);

    await supabaseAdmin.from("audit_logs").insert({
      actor_id: userId,
      action: "user.password_reset_requested",
      entity: "auth.users",
      metadata: { email: data.email },
    });

    return { ok: true };
  });

/** Super Admin: create a platform-level officer (verification or support). */
export const adminCreateOfficer = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { email: string; full_name: string; roleSlug: string }) => {
    if (!input.email?.trim()) throw new Error("Email is required");
    if (!["platform_verification_officer", "platform_support_officer"].includes(input.roleSlug)) {
      throw new Error("Unknown platform role");
    }
    return input;
  })
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    await assertSuperAdmin(supabase as never, userId);

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const password = tempPassword();

    const { data: created, error } = await supabaseAdmin.auth.admin.createUser({
      email: data.email.trim(),
      password,
      email_confirm: true,
      user_metadata: { full_name: data.full_name },
    });
    if (error) throw new Error(error.message);

    const { data: role } = await supabaseAdmin
      .from("roles")
      .select("id")
      .is("company_id", null)
      .eq("slug", data.roleSlug)
      .maybeSingle();

    if (role) {
      await supabaseAdmin
        .from("user_roles")
        .insert({ user_id: created.user!.id, role_id: role.id, company_id: null });
    }

    await supabaseAdmin
      .from("profiles")
      .update({ full_name: data.full_name, position: data.roleSlug })
      .eq("id", created.user!.id);

    return { email: data.email.trim(), temporaryPassword: password };
  });

/** Company Admin: create an employee for their own company. */
export const companyCreateEmployee = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(
    (input: { email: string; full_name: string; position: string; role_id: string }) => {
      if (!input.email?.trim()) throw new Error("Email is required");
      if (!input.full_name?.trim()) throw new Error("Full name is required");
      if (!input.role_id) throw new Error("Role is required");
      return input;
    },
  )
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;

    // Check permissions
    const { data: allowed } = await supabase.rpc("has_permission", {
      _user_id: userId,
      _key: "employees.create",
    });
    
    // Also fetch the current user's company_id
    const { data: profile } = await supabase
      .from("profiles")
      .select("company_id, is_super_admin")
      .eq("id", userId)
      .single();
      
    if (!profile?.is_super_admin && !allowed) {
      throw new Error("Forbidden — missing employees.create permission");
    }

    if (!profile?.company_id && !profile?.is_super_admin) {
      throw new Error("You must belong to a company to create employees");
    }

    const targetCompanyId = profile?.company_id ?? null;

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const password = tempPassword();

    const { data: created, error } = await supabaseAdmin.auth.admin.createUser({
      email: data.email.trim(),
      password,
      email_confirm: true,
      user_metadata: { full_name: data.full_name, requires_password_change: true },
    });
    
    if (error) throw new Error(error.message);
    const newUserId = created.user!.id;

    // The user's profile is created by a database trigger on auth.users insert.
    // We update it with the company and position.
    await supabaseAdmin
      .from("profiles")
      .update({
        company_id: targetCompanyId,
        full_name: data.full_name,
        position: data.position,
      })
      .eq("id", newUserId);

    // Assign the selected role
    await supabaseAdmin
      .from("user_roles")
      .insert({
        user_id: newUserId,
        role_id: data.role_id,
        company_id: targetCompanyId,
      });

    await supabaseAdmin.from("audit_logs").insert({
      company_id: targetCompanyId,
      actor_id: userId,
      action: "employee.created",
      entity: "profiles",
      entity_id: newUserId,
      metadata: { email: data.email, role_id: data.role_id },
    });

    return { email: data.email.trim(), temporaryPassword: password };
  });

/** Super Admin: reset a user's password and return a new temporary password */
export const adminResetTemporaryPassword = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { email: string }) => {
    if (!input.email) throw new Error("Email is required");
    return input;
  })
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    // We can restrict this to super admins only for now
    await assertSuperAdmin(supabase as never, userId);

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    
    // Find the user id by email
    const { data: profiles, error: profileFindError } = await supabaseAdmin
      .from("profiles")
      .select("id")
      .eq("email", data.email)
      .order("created_at", { ascending: false })
      .limit(1);
      
    if (profileFindError || !profiles || profiles.length === 0) {
      const { data: companies } = await supabaseAdmin.from("companies").select("id, name, email").eq("email", data.email).limit(1);
      const company = companies?.[0];
      if (company) {
        const password = tempPassword();
        const { data: created, error: authError } = await supabaseAdmin.auth.admin.createUser({
          email: data.email.trim(),
          password,
          email_confirm: true,
          user_metadata: { full_name: company.name, requires_password_change: true },
        });
        if (authError) throw new Error(authError.message);

        const newUserId = created.user!.id;

        await supabaseAdmin.from("profiles").update({ company_id: company.id }).eq("id", newUserId);

        const { data: landlordRole } = await supabaseAdmin.rpc("seed_company_roles", {
          _company_id: company.id,
        });
        await fixCompanyRolePermissions(company.id, supabaseAdmin);
        if (landlordRole) {
          await supabaseAdmin
            .from("user_roles")
            .insert({ user_id: newUserId, role_id: landlordRole as string, company_id: company.id });
        }

        await supabaseAdmin.from("audit_logs").insert({
          actor_id: userId,
          action: "user.created_from_demo",
          entity: "auth.users",
          entity_id: newUserId,
          metadata: { email: data.email },
        });

        return { temporaryPassword: password };
      }
      throw new Error("User not found for that email");
    }
    
    const targetUserId = profiles[0]!.id;
    const password = tempPassword();

    const { error: authError } = await supabaseAdmin.auth.admin.updateUserById(targetUserId, {
      password: password,
      user_metadata: { requires_password_change: true },
    });
    if (authError) throw new Error(authError.message);

    await supabaseAdmin.from("audit_logs").insert({
      actor_id: userId,
      action: "user.temporary_password_reset",
      entity: "auth.users",
      entity_id: targetUserId,
      metadata: { email: data.email },
    });

    return { temporaryPassword: password };
  });

export const sendEmailFn = createServerFn({ method: "POST" })
  .inputValidator((input: { to: string; subject: string; htmlContent: string }) => {
    if (!input.to || !input.subject || !input.htmlContent) throw new Error("Missing fields");
    return input;
  })
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    // Get Brevo API Key
    const { data: settings, error: settingsError } = await supabaseAdmin
      .from("platform_settings")
      .select("value")
      .eq("key", "brevo_api_key")
      .single();

    if (settingsError || !settings || !settings.value) {
      throw new Error("Brevo API key not configured");
    }

    const brevoApiKey = String(settings.value);

    // Call Brevo API
    const brevoResponse = await fetch("https://api.brevo.com/v3/smtp/email", {
      method: "POST",
      headers: {
        "accept": "application/json",
        "api-key": brevoApiKey,
        "content-type": "application/json",
      },
      body: JSON.stringify({
        sender: { name: "Makao Admin", email: "noreply@makao.com" },
        to: [{ email: data.to }],
        subject: data.subject,
        htmlContent: data.htmlContent,
      }),
    });

    if (!brevoResponse.ok) {
      const errData = await brevoResponse.json();
      console.error("Brevo API Error:", errData);
      throw new Error("Failed to send email via Brevo");
    }

    return { success: true };
  });


export const adminDeleteUser = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { targetUserId: string }) => input)
  .handler(async ({ data: { targetUserId }, context }) => {
    const { supabase, userId } = context;
    // Ensure caller is Super Admin OR they belong to the same company and have employees.delete permission
    const { data: caller } = await supabase
      .from("profiles")
      .select("is_super_admin, company_id")
      .eq("id", userId)
      .maybeSingle();

    if (!caller?.is_super_admin) {
      // Check if they are in the same company
      const { data: target } = await supabase
        .from("profiles")
        .select("company_id")
        .eq("id", targetUserId)
        .maybeSingle();
      
      if (!target || target.company_id !== caller?.company_id) {
        throw new Error("Forbidden");
      }

      // Check permission
      const { data: hasPerm } = await supabase.rpc("has_permission", {
        _user_id: userId,
        _key: "employees.delete" as any
      } as any);
      if (!hasPerm) {
        throw new Error("Forbidden - Missing employees.delete permission");
      }
    }

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    
    // Admin delete user deletes from auth.users and cascades to profiles
    const { error } = await supabaseAdmin.auth.admin.deleteUser(targetUserId);
    if (error) throw new Error(error.message);
    return true;
  });

export const adminDeleteCompany = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { targetCompanyId: string }) => input)
  .handler(async ({ data: { targetCompanyId }, context }) => {
    const { supabase, userId } = context;
    // Only Super Admins can delete companies
    const { data: caller } = await supabase
      .from("profiles")
      .select("is_super_admin")
      .eq("id", userId)
      .maybeSingle();

    if (!caller?.is_super_admin) {
      throw new Error("Forbidden - Only super admins can delete companies");
    }

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    // Get all users in the company to delete their auth accounts
    const { data: profiles } = await supabaseAdmin
      .from("profiles")
      .select("id")
      .eq("company_id", targetCompanyId);

    if (profiles && profiles.length > 0) {
      for (const profile of profiles) {
        await supabaseAdmin.auth.admin.deleteUser(profile.id);
      }
    }
    
    // The profiles are cascaded/deleted by auth.users deletion.
    // Now delete the company (bypasses RLS)
    const { error } = await supabaseAdmin.from("companies").delete().eq("id", targetCompanyId);
    if (error) throw new Error(error.message);

    return true;
  });

export const registerCompanyFn = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { company_name: string; phone?: string; }) => {
    if (!input.company_name?.trim()) throw new Error("Company name is required");
    return input;
  })
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const { data: profile } = await supabaseAdmin.from("profiles").select("company_id, email").eq("id", userId).single();
    if (profile?.company_id) {
      throw new Error("You are already associated with a company");
    }

    const { data: company, error: companyError } = await supabaseAdmin
      .from("companies")
      .insert({
        name: data.company_name.trim(),
        email: profile?.email || "",
        phone: data.phone ?? null,
        company_type: "Property Management",
        activation_status: "pending_activation",
      })
      .select("id, name")
      .single();
    if (companyError) throw new Error(companyError.message);

    await supabaseAdmin
      .from("profiles")
      .update({ company_id: company.id, position: "Landlord" })
      .eq("id", userId);

    const { data: landlordRole } = await supabaseAdmin.rpc("seed_company_roles", {
      _company_id: company.id,
    });
    
    await fixCompanyRolePermissions(company.id, supabaseAdmin);
    
    if (landlordRole) {
      await supabaseAdmin.from("user_roles").delete().eq("user_id", userId);
      await supabaseAdmin
        .from("user_roles")
        .insert({ user_id: userId, role_id: landlordRole as string, company_id: company.id });
    }

    return { companyId: company.id };
  });

export const activateTrialSubscriptionFn = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { company_id: string }) => input)
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    // Verify user belongs to company and has permission
    const { data: roleData } = await supabase
      .from("user_roles")
      .select("id")
      .eq("user_id", userId)
      .eq("company_id", data.company_id)
      .limit(1);
    
    if (!roleData || roleData.length === 0) {
      throw new Error("Forbidden - Not a member of this company");
    }

    // Check if subscription already exists
    const { data: existingSub } = await supabaseAdmin
      .from("platform_subscriptions")
      .select("id")
      .eq("company_id", data.company_id)
      .limit(1);

    if (existingSub && existingSub.length > 0) {
      throw new Error("Company already has a subscription");
    }

    const next30 = new Date();
    next30.setDate(next30.getDate() + 30);

    // Update company activation status
    const { error: companyError } = await supabaseAdmin
      .from("companies")
      .update({ activation_status: "active" })
      .eq("id", data.company_id);
    
    if (companyError) throw new Error(companyError.message);

    // Insert trial
    const { error: subError } = await supabaseAdmin
      .from("platform_subscriptions")
      .insert({
        company_id: data.company_id,
        status: "trialing",
        billing_cycle: "monthly",
        current_period_start: new Date().toISOString(),
        current_period_end: next30.toISOString(),
      } as any);

    if (subError) throw new Error(subError.message);

    return { success: true };
  });

export const renewSubscriptionFn = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { company_id: string }) => input)
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    // Verify user belongs to company and has permission
    const { data: roleData } = await supabase
      .from("user_roles")
      .select("id")
      .eq("user_id", userId)
      .eq("company_id", data.company_id)
      .limit(1);
    
    if (!roleData || roleData.length === 0) {
      throw new Error("Forbidden - Not a member of this company");
    }

    const { data: existingSub } = await supabaseAdmin
      .from("platform_subscriptions")
      .select("id, current_period_end")
      .eq("company_id", data.company_id)
      .single();

    if (!existingSub) {
      throw new Error("Company has no subscription to renew");
    }

    // Extend from today if expired, otherwise extend from current end date
    const currentEnd = new Date(existingSub.current_period_end);
    const now = new Date();
    const baseDate = currentEnd < now ? now : currentEnd;
    
    const next30 = new Date(baseDate);
    next30.setDate(next30.getDate() + 30);

    const { error: subError } = await supabaseAdmin
      .from("platform_subscriptions")
      .update({
        status: "active",
        current_period_end: next30.toISOString(),
      })
      .eq("company_id", data.company_id);

    if (subError) throw new Error(subError.message);

    return { success: true };
  });

export const registerUserFn = createServerFn({ method: "POST" })
  .inputValidator((input: { email: string; password?: string; full_name: string }) => input)
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    // create the user as admin so that email_confirm can be set to true
    const { data: created, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email: data.email.trim(),
      password: data.password || tempPassword(),
      email_confirm: true,
      user_metadata: { full_name: data.full_name },
    });
    
    if (authError) {
      throw new Error(authError.message);
    }

    return { success: true, userId: created.user.id };
  });
