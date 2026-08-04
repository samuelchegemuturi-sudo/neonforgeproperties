import { c as createServerFn, i as TSS_SERVER_FUNCTION } from "./createServerFn-BFFE07zL.mjs";
import { t as requireSupabaseAuth } from "./auth-middleware-UH_Jp6hR.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/platform.functions-CkkuEhUo.js
var createServerRpc = (serverFnMeta, splitImportFn) => {
	const url = "/_serverFn/" + serverFnMeta.id;
	return Object.assign(splitImportFn, {
		url,
		serverFnMeta,
		[TSS_SERVER_FUNCTION]: true
	});
};
async function assertSuperAdmin(supabase, userId) {
	const { data } = await supabase.from("profiles").select("is_super_admin").eq("id", userId).maybeSingle();
	if (!data?.is_super_admin) throw new Error("Forbidden — platform owner only");
}
function tempPassword() {
	return Array(12).fill("0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz!@#$%^&*").map((x) => x[Math.floor(Math.random() * x.length)]).join("");
}
var tmpl = [
	{
		slug: "landlord",
		prefix: [
			"dashboard",
			"property",
			"unit",
			"tenant",
			"finance",
			"maintenance",
			"employees",
			"roles",
			"verification",
			"listing",
			"reports",
			"settings",
			"audit"
		]
	},
	{
		slug: "property_manager",
		prefix: [
			"dashboard",
			"property",
			"unit",
			"tenant",
			"maintenance",
			"listing",
			"reports"
		]
	},
	{
		slug: "accountant",
		prefix: [
			"dashboard",
			"finance",
			"reports",
			"tenant"
		]
	},
	{
		slug: "caretaker",
		prefix: [
			"dashboard",
			"maintenance",
			"unit"
		]
	},
	{
		slug: "receptionist",
		prefix: [
			"dashboard",
			"tenant",
			"listing"
		]
	},
	{
		slug: "maintenance_technician",
		prefix: ["dashboard", "maintenance"]
	}
];
async function fixCompanyRolePermissions(companyId, supabaseAdmin) {
	const { data: perms } = await supabaseAdmin.from("permissions").select("key");
	const { data: roles } = await supabaseAdmin.from("roles").select("id, slug").eq("company_id", companyId);
	if (!perms || !roles) return;
	let toInsert = [];
	for (const role of roles) {
		const t = tmpl.find((x) => x.slug === role.slug);
		if (!t) continue;
		for (const p of perms) if (t.prefix.includes(p.key.split(".")[0])) toInsert.push({
			role_id: role.id,
			permission_key: p.key
		});
	}
	for (let i = 0; i < toInsert.length; i += 1e3) {
		const batch = toInsert.slice(i, i + 1e3);
		await supabaseAdmin.from("role_permissions").upsert(batch, { onConflict: "role_id,permission_key" });
	}
}
/** Super Admin: register a company offline and create its owner login. */
var adminCreateCompany_createServerFn_handler = createServerRpc({
	id: "6d36bc45ca407f78c14d76e16b9cf58743414f2ec9d560a98d339ce5b4ac945e",
	name: "adminCreateCompany",
	filename: "src/lib/platform.functions.ts"
}, (opts) => adminCreateCompany.__executeServer(opts));
var adminCreateCompany = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth]).inputValidator((input) => {
	if (!input.name?.trim()) throw new Error("Company name is required");
	if (!input.email?.trim()) throw new Error("Owner email is required");
	return input;
}).handler(adminCreateCompany_createServerFn_handler, async ({ data, context }) => {
	const { supabase, userId } = context;
	await assertSuperAdmin(supabase, userId);
	const { supabaseAdmin } = await import("./client.server-KzwUIAkW.mjs");
	const { data: company, error: companyError } = await supabaseAdmin.from("companies").insert({
		name: data.name.trim(),
		email: data.email.trim(),
		phone: data.phone ?? null,
		company_type: data.company_type,
		activation_status: "pending_activation"
	}).select("id, name").single();
	if (companyError) throw new Error(companyError.message);
	const password = tempPassword();
	const { data: created, error: authError } = await supabaseAdmin.auth.admin.createUser({
		email: data.email.trim(),
		password,
		email_confirm: true,
		user_metadata: {
			full_name: data.owner_name || data.name,
			requires_password_change: true
		}
	});
	if (authError) {
		await supabaseAdmin.from("companies").delete().eq("id", company.id);
		throw new Error(authError.message);
	}
	const newUserId = created.user.id;
	await supabaseAdmin.from("profiles").update({
		company_id: company.id,
		full_name: data.owner_name,
		position: "Landlord"
	}).eq("id", created.user.id);
	const { data: landlordRole } = await supabaseAdmin.rpc("seed_company_roles", { _company_id: company.id });
	await fixCompanyRolePermissions(company.id, supabaseAdmin);
	if (landlordRole) await supabaseAdmin.from("user_roles").insert({
		user_id: newUserId,
		role_id: landlordRole,
		company_id: company.id
	});
	await supabaseAdmin.from("audit_logs").insert({
		company_id: company.id,
		actor_id: userId,
		action: "company.created_by_admin",
		entity: "companies",
		entity_id: company.id,
		metadata: { email: data.email }
	});
	return {
		companyId: company.id,
		email: data.email.trim(),
		temporaryPassword: password
	};
});
var adminResetPassword_createServerFn_handler = createServerRpc({
	id: "668533e1fc5928b020a8cd3a20d946dda0be2544498131efc892b853e45d23df",
	name: "adminResetPassword",
	filename: "src/lib/platform.functions.ts"
}, (opts) => adminResetPassword.__executeServer(opts));
var adminResetPassword = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth]).inputValidator((input) => {
	if (!input.email?.trim()) throw new Error("Email is required");
	return input;
}).handler(adminResetPassword_createServerFn_handler, async ({ data, context }) => {
	const { supabase, userId } = context;
	const { data: allowed } = await supabase.rpc("has_permission", {
		_user_id: userId,
		_key: "support.reset_password"
	});
	if (!allowed) throw new Error("Forbidden");
	const { supabaseAdmin } = await import("./client.server-KzwUIAkW.mjs");
	const { error } = await supabaseAdmin.auth.admin.generateLink({
		type: "recovery",
		email: data.email.trim()
	});
	if (error) throw new Error(error.message);
	await supabaseAdmin.from("audit_logs").insert({
		actor_id: userId,
		action: "user.password_reset_requested",
		entity: "auth.users",
		metadata: { email: data.email }
	});
	return { ok: true };
});
var adminCreateOfficer_createServerFn_handler = createServerRpc({
	id: "9b0c4adc2384253b9e83ed96d4be02c2d6b3245c5d2ab4c46ca69ff60c43face",
	name: "adminCreateOfficer",
	filename: "src/lib/platform.functions.ts"
}, (opts) => adminCreateOfficer.__executeServer(opts));
var adminCreateOfficer = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth]).inputValidator((input) => {
	if (!input.email?.trim()) throw new Error("Email is required");
	if (!["platform_verification_officer", "platform_support_officer"].includes(input.roleSlug)) throw new Error("Unknown platform role");
	return input;
}).handler(adminCreateOfficer_createServerFn_handler, async ({ data, context }) => {
	const { supabase, userId } = context;
	await assertSuperAdmin(supabase, userId);
	const { supabaseAdmin } = await import("./client.server-KzwUIAkW.mjs");
	const password = tempPassword();
	const { data: created, error } = await supabaseAdmin.auth.admin.createUser({
		email: data.email.trim(),
		password,
		email_confirm: true,
		user_metadata: { full_name: data.full_name }
	});
	if (error) throw new Error(error.message);
	const { data: role } = await supabaseAdmin.from("roles").select("id").is("company_id", null).eq("slug", data.roleSlug).maybeSingle();
	if (role) await supabaseAdmin.from("user_roles").insert({
		user_id: created.user.id,
		role_id: role.id,
		company_id: null
	});
	await supabaseAdmin.from("profiles").update({
		full_name: data.full_name,
		position: data.roleSlug
	}).eq("id", created.user.id);
	return {
		email: data.email.trim(),
		temporaryPassword: password
	};
});
var companyCreateEmployee_createServerFn_handler = createServerRpc({
	id: "ebe4d4bfe39cdb19e0c23c40e4b45fc60159cec8d4d2377495d0775dd064a997",
	name: "companyCreateEmployee",
	filename: "src/lib/platform.functions.ts"
}, (opts) => companyCreateEmployee.__executeServer(opts));
var companyCreateEmployee = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth]).inputValidator((input) => {
	if (!input.email?.trim()) throw new Error("Email is required");
	if (!input.full_name?.trim()) throw new Error("Full name is required");
	if (!input.role_id) throw new Error("Role is required");
	return input;
}).handler(companyCreateEmployee_createServerFn_handler, async ({ data, context }) => {
	const { supabase, userId } = context;
	const { data: allowed } = await supabase.rpc("has_permission", {
		_user_id: userId,
		_key: "employees.create"
	});
	const { data: profile } = await supabase.from("profiles").select("company_id, is_super_admin").eq("id", userId).single();
	if (!profile?.is_super_admin && !allowed) throw new Error("Forbidden — missing employees.create permission");
	if (!profile?.company_id && !profile?.is_super_admin) throw new Error("You must belong to a company to create employees");
	const targetCompanyId = profile?.company_id ?? null;
	const { supabaseAdmin } = await import("./client.server-KzwUIAkW.mjs");
	const password = tempPassword();
	const { data: created, error } = await supabaseAdmin.auth.admin.createUser({
		email: data.email.trim(),
		password,
		email_confirm: true,
		user_metadata: {
			full_name: data.full_name,
			requires_password_change: true
		}
	});
	if (error) throw new Error(error.message);
	const newUserId = created.user.id;
	await supabaseAdmin.from("profiles").update({
		company_id: targetCompanyId,
		full_name: data.full_name,
		position: data.position
	}).eq("id", newUserId);
	await supabaseAdmin.from("user_roles").insert({
		user_id: newUserId,
		role_id: data.role_id,
		company_id: targetCompanyId
	});
	await supabaseAdmin.from("audit_logs").insert({
		company_id: targetCompanyId,
		actor_id: userId,
		action: "employee.created",
		entity: "profiles",
		entity_id: newUserId,
		metadata: {
			email: data.email,
			role_id: data.role_id
		}
	});
	return {
		email: data.email.trim(),
		temporaryPassword: password
	};
});
var adminResetTemporaryPassword_createServerFn_handler = createServerRpc({
	id: "fc287c4a9242a94cfa3ad4ba4076640c10102748ee436751fcfd239d9fc3fd5a",
	name: "adminResetTemporaryPassword",
	filename: "src/lib/platform.functions.ts"
}, (opts) => adminResetTemporaryPassword.__executeServer(opts));
var adminResetTemporaryPassword = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth]).inputValidator((input) => {
	if (!input.email) throw new Error("Email is required");
	return input;
}).handler(adminResetTemporaryPassword_createServerFn_handler, async ({ data, context }) => {
	const { supabase, userId } = context;
	await assertSuperAdmin(supabase, userId);
	const { supabaseAdmin } = await import("./client.server-KzwUIAkW.mjs");
	const { data: profiles, error: profileFindError } = await supabaseAdmin.from("profiles").select("id").eq("email", data.email).order("created_at", { ascending: false }).limit(1);
	if (profileFindError || !profiles || profiles.length === 0) {
		const { data: companies } = await supabaseAdmin.from("companies").select("id, name, email").eq("email", data.email).limit(1);
		const company = companies?.[0];
		if (company) {
			const password = tempPassword();
			const { data: created, error: authError } = await supabaseAdmin.auth.admin.createUser({
				email: data.email.trim(),
				password,
				email_confirm: true,
				user_metadata: {
					full_name: company.name,
					requires_password_change: true
				}
			});
			if (authError) throw new Error(authError.message);
			const newUserId = created.user.id;
			await supabaseAdmin.from("profiles").update({ company_id: company.id }).eq("id", newUserId);
			const { data: landlordRole } = await supabaseAdmin.rpc("seed_company_roles", { _company_id: company.id });
			await fixCompanyRolePermissions(company.id, supabaseAdmin);
			if (landlordRole) await supabaseAdmin.from("user_roles").insert({
				user_id: newUserId,
				role_id: landlordRole,
				company_id: company.id
			});
			await supabaseAdmin.from("audit_logs").insert({
				actor_id: userId,
				action: "user.created_from_demo",
				entity: "auth.users",
				entity_id: newUserId,
				metadata: { email: data.email }
			});
			return { temporaryPassword: password };
		}
		throw new Error("User not found for that email");
	}
	const targetUserId = profiles[0].id;
	const password = tempPassword();
	const { error: authError } = await supabaseAdmin.auth.admin.updateUserById(targetUserId, {
		password,
		user_metadata: { requires_password_change: true }
	});
	if (authError) throw new Error(authError.message);
	await supabaseAdmin.from("audit_logs").insert({
		actor_id: userId,
		action: "user.temporary_password_reset",
		entity: "auth.users",
		entity_id: targetUserId,
		metadata: { email: data.email }
	});
	return { temporaryPassword: password };
});
var sendEmailFn_createServerFn_handler = createServerRpc({
	id: "6f3d2b4d8ddaa9601a0ba48e76ee6b1269535c5b5ce44ed2f0b4dc8decb6e59c",
	name: "sendEmailFn",
	filename: "src/lib/platform.functions.ts"
}, (opts) => sendEmailFn.__executeServer(opts));
var sendEmailFn = createServerFn({ method: "POST" }).inputValidator((input) => {
	if (!input.to || !input.subject || !input.htmlContent) throw new Error("Missing fields");
	return input;
}).handler(sendEmailFn_createServerFn_handler, async ({ data }) => {
	const { supabaseAdmin } = await import("./client.server-KzwUIAkW.mjs");
	const { data: settings, error: settingsError } = await supabaseAdmin.from("platform_settings").select("value").eq("key", "brevo_api_key").single();
	if (settingsError || !settings || !settings.value) throw new Error("Brevo API key not configured");
	const brevoApiKey = String(settings.value);
	const brevoResponse = await fetch("https://api.brevo.com/v3/smtp/email", {
		method: "POST",
		headers: {
			"accept": "application/json",
			"api-key": brevoApiKey,
			"content-type": "application/json"
		},
		body: JSON.stringify({
			sender: {
				name: "Makao Admin",
				email: "noreply@makao.com"
			},
			to: [{ email: data.to }],
			subject: data.subject,
			htmlContent: data.htmlContent
		})
	});
	if (!brevoResponse.ok) {
		const errData = await brevoResponse.json();
		console.error("Brevo API Error:", errData);
		throw new Error("Failed to send email via Brevo");
	}
	return { success: true };
});
var adminDeleteUser_createServerFn_handler = createServerRpc({
	id: "343f9ad093c2ba9f18d395f9d96176ac40bea7240ae1cfec38dc6919a4cddf6d",
	name: "adminDeleteUser",
	filename: "src/lib/platform.functions.ts"
}, (opts) => adminDeleteUser.__executeServer(opts));
var adminDeleteUser = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth]).inputValidator((input) => input).handler(adminDeleteUser_createServerFn_handler, async ({ data: { targetUserId }, context }) => {
	const { supabase, userId } = context;
	const { data: caller } = await supabase.from("profiles").select("is_super_admin, company_id").eq("id", userId).maybeSingle();
	if (!caller?.is_super_admin) {
		const { data: target } = await supabase.from("profiles").select("company_id").eq("id", targetUserId).maybeSingle();
		if (!target || target.company_id !== caller?.company_id) throw new Error("Forbidden");
		const { data: hasPerm } = await supabase.rpc("has_permission", {
			_user_id: userId,
			_key: "employees.delete"
		});
		if (!hasPerm) throw new Error("Forbidden - Missing employees.delete permission");
	}
	const { supabaseAdmin } = await import("./client.server-KzwUIAkW.mjs");
	const { error } = await supabaseAdmin.auth.admin.deleteUser(targetUserId);
	if (error) throw new Error(error.message);
	return true;
});
var adminDeleteCompany_createServerFn_handler = createServerRpc({
	id: "f10fcc983a0bad621955a5cda37283380d73fc439c6abb7a2546aa48c4ff3b71",
	name: "adminDeleteCompany",
	filename: "src/lib/platform.functions.ts"
}, (opts) => adminDeleteCompany.__executeServer(opts));
var adminDeleteCompany = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth]).inputValidator((input) => input).handler(adminDeleteCompany_createServerFn_handler, async ({ data: { targetCompanyId }, context }) => {
	const { supabase, userId } = context;
	const { data: caller } = await supabase.from("profiles").select("is_super_admin").eq("id", userId).maybeSingle();
	if (!caller?.is_super_admin) throw new Error("Forbidden - Only super admins can delete companies");
	const { supabaseAdmin } = await import("./client.server-KzwUIAkW.mjs");
	const { data: profiles } = await supabaseAdmin.from("profiles").select("id").eq("company_id", targetCompanyId);
	if (profiles && profiles.length > 0) for (const profile of profiles) await supabaseAdmin.auth.admin.deleteUser(profile.id);
	const { error } = await supabaseAdmin.from("companies").delete().eq("id", targetCompanyId);
	if (error) throw new Error(error.message);
	return true;
});
var registerCompanyFn_createServerFn_handler = createServerRpc({
	id: "8873cfceadb96d6d8057cedaad8a931df1a4685bcb709788439267c45ca85d9b",
	name: "registerCompanyFn",
	filename: "src/lib/platform.functions.ts"
}, (opts) => registerCompanyFn.__executeServer(opts));
var registerCompanyFn = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth]).inputValidator((input) => {
	if (!input.company_name?.trim()) throw new Error("Company name is required");
	return input;
}).handler(registerCompanyFn_createServerFn_handler, async ({ data, context }) => {
	const { supabase, userId } = context;
	const { supabaseAdmin } = await import("./client.server-KzwUIAkW.mjs");
	const { data: profile } = await supabaseAdmin.from("profiles").select("company_id, email").eq("id", userId).single();
	if (profile?.company_id) throw new Error("You are already associated with a company");
	const { data: company, error: companyError } = await supabaseAdmin.from("companies").insert({
		name: data.company_name.trim(),
		email: profile?.email || "",
		phone: data.phone ?? null,
		company_type: "Property Management",
		activation_status: "pending_activation"
	}).select("id, name").single();
	if (companyError) throw new Error(companyError.message);
	await supabaseAdmin.from("profiles").update({
		company_id: company.id,
		position: "Landlord"
	}).eq("id", userId);
	const { data: landlordRole } = await supabaseAdmin.rpc("seed_company_roles", { _company_id: company.id });
	await fixCompanyRolePermissions(company.id, supabaseAdmin);
	if (landlordRole) {
		await supabaseAdmin.from("user_roles").delete().eq("user_id", userId);
		await supabaseAdmin.from("user_roles").insert({
			user_id: userId,
			role_id: landlordRole,
			company_id: company.id
		});
	}
	return { companyId: company.id };
});
var activateTrialSubscriptionFn_createServerFn_handler = createServerRpc({
	id: "a8977811895c47b2ce256a56362f34236e50a10a970e0403d73598fad490d0b1",
	name: "activateTrialSubscriptionFn",
	filename: "src/lib/platform.functions.ts"
}, (opts) => activateTrialSubscriptionFn.__executeServer(opts));
var activateTrialSubscriptionFn = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth]).inputValidator((input) => input).handler(activateTrialSubscriptionFn_createServerFn_handler, async ({ data, context }) => {
	const { supabase, userId } = context;
	const { supabaseAdmin } = await import("./client.server-KzwUIAkW.mjs");
	const { data: roleData } = await supabase.from("user_roles").select("id").eq("user_id", userId).eq("company_id", data.company_id).limit(1);
	if (!roleData || roleData.length === 0) throw new Error("Forbidden - Not a member of this company");
	const { data: existingSub } = await supabaseAdmin.from("platform_subscriptions").select("id").eq("company_id", data.company_id).limit(1);
	if (existingSub && existingSub.length > 0) throw new Error("Company already has a subscription");
	const next30 = /* @__PURE__ */ new Date();
	next30.setDate(next30.getDate() + 30);
	const { error: companyError } = await supabaseAdmin.from("companies").update({ activation_status: "active" }).eq("id", data.company_id);
	if (companyError) throw new Error(companyError.message);
	const { error: subError } = await supabaseAdmin.from("platform_subscriptions").insert({
		company_id: data.company_id,
		status: "trialing",
		billing_cycle: "monthly",
		current_period_start: (/* @__PURE__ */ new Date()).toISOString(),
		current_period_end: next30.toISOString()
	});
	if (subError) throw new Error(subError.message);
	return { success: true };
});
var renewSubscriptionFn_createServerFn_handler = createServerRpc({
	id: "7ba3a186d0e26b31a3624cdfaf215d1f588c96730fdd119fd8a123e18e219e26",
	name: "renewSubscriptionFn",
	filename: "src/lib/platform.functions.ts"
}, (opts) => renewSubscriptionFn.__executeServer(opts));
var renewSubscriptionFn = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth]).inputValidator((input) => input).handler(renewSubscriptionFn_createServerFn_handler, async ({ data, context }) => {
	const { supabase, userId } = context;
	const { supabaseAdmin } = await import("./client.server-KzwUIAkW.mjs");
	const { data: roleData } = await supabase.from("user_roles").select("id").eq("user_id", userId).eq("company_id", data.company_id).limit(1);
	if (!roleData || roleData.length === 0) throw new Error("Forbidden - Not a member of this company");
	const { data: existingSub } = await supabaseAdmin.from("platform_subscriptions").select("id, current_period_end").eq("company_id", data.company_id).single();
	if (!existingSub) throw new Error("Company has no subscription to renew");
	const currentEnd = new Date(existingSub.current_period_end);
	const now = /* @__PURE__ */ new Date();
	const next30 = new Date(currentEnd < now ? now : currentEnd);
	next30.setDate(next30.getDate() + 30);
	const { error: subError } = await supabaseAdmin.from("platform_subscriptions").update({
		status: "active",
		current_period_end: next30.toISOString()
	}).eq("company_id", data.company_id);
	if (subError) throw new Error(subError.message);
	return { success: true };
});
var registerUserFn_createServerFn_handler = createServerRpc({
	id: "49dce7dc18003eda92e4bdf6fcd0143d37890bf1d504c4d673b7827496bcaf0a",
	name: "registerUserFn",
	filename: "src/lib/platform.functions.ts"
}, (opts) => registerUserFn.__executeServer(opts));
var registerUserFn = createServerFn({ method: "POST" }).inputValidator((input) => input).handler(registerUserFn_createServerFn_handler, async ({ data }) => {
	const { supabaseAdmin } = await import("./client.server-KzwUIAkW.mjs");
	const { data: created, error: authError } = await supabaseAdmin.auth.admin.createUser({
		email: data.email.trim(),
		password: data.password || tempPassword(),
		email_confirm: true,
		user_metadata: { full_name: data.full_name }
	});
	if (authError) throw new Error(authError.message);
	return {
		success: true,
		userId: created.user.id
	};
});
//#endregion
export { activateTrialSubscriptionFn_createServerFn_handler, adminCreateCompany_createServerFn_handler, adminCreateOfficer_createServerFn_handler, adminDeleteCompany_createServerFn_handler, adminDeleteUser_createServerFn_handler, adminResetPassword_createServerFn_handler, adminResetTemporaryPassword_createServerFn_handler, companyCreateEmployee_createServerFn_handler, registerCompanyFn_createServerFn_handler, registerUserFn_createServerFn_handler, renewSubscriptionFn_createServerFn_handler, sendEmailFn_createServerFn_handler };
