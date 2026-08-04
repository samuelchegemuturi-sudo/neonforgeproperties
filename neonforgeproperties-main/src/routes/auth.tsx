import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { z } from "zod";
import { toast } from "sonner";
import { Home, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/lib/auth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const searchSchema = z.object({
  mode: z.enum(["signin", "signup"]).optional(),
});

const ROLE_TEMPLATES = {
  landlord: {
    name: "Landlord",
    slug: "landlord",
    description: "Company owner with full access.",
    prefixes: [
      "dashboard",
      "property",
      "unit",
      "tenant",
      "finance",
      "maintenance",
      "employees",
      "roles",
      "listing",
      "reports",
      "settings",
      "audit",
    ],
  },
  property_manager: {
    name: "Property Manager",
    slug: "property_manager",
    description: "Day-to-day property operations.",
    prefixes: ["dashboard", "property", "unit", "tenant", "maintenance", "listing", "reports"],
  },
  accountant: {
    name: "Accountant",
    slug: "accountant",
    description: "Finance and reporting access.",
    prefixes: ["dashboard", "finance", "reports", "tenant"],
  },
  tenant: {
    name: "Tenant",
    slug: "tenant",
    description: "Tenant-only workspace access.",
    prefixes: ["dashboard", "tenant"],
  },
  employee: {
    name: "Employee",
    slug: "employee",
    description: "Team member access for day-to-day operations.",
    prefixes: ["dashboard", "tenant", "property", "unit", "maintenance", "verification"],
  },
} as const;

export const Route = createFileRoute("/auth")({
  validateSearch: searchSchema,
  head: () => ({
    meta: [
      { title: "Sign in — Neon Forge Properties" },
      { name: "description", content: "Sign in to your Neon Forge Properties property management workspace." },
      { property: "og:title", content: "Sign in — Neon Forge Properties" },
      { property: "og:description", content: "Access your Neon Forge Properties property management workspace." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const { session, access, accessLoading } = useAuth();
  const navigate = useNavigate();
  const [busy, setBusy] = useState(false);
  const [pendingRole, setPendingRole] = useState<string | null>(null);

  const needsRoleSelection = Boolean(
    session && !accessLoading && !access?.profile?.is_super_admin && !access?.roles.length,
  );

  useEffect(() => {
    if (session && !accessLoading && access?.roles.length) {
      void navigate({ to: "/dashboard", replace: true });
    }
  }, [session, accessLoading, access?.roles.length, navigate]);

  async function assignRole(roleSlug: keyof typeof ROLE_TEMPLATES) {
    if (!session?.user.id) return;
    const template = ROLE_TEMPLATES[roleSlug];
    setBusy(true);
    setPendingRole(roleSlug);

    try {
      const { data: existingRole, error: existingRoleError } = await supabase
        .from("roles")
        .select("id")
        .eq("company_id", null)
        .eq("slug", template.slug)
        .maybeSingle();

      if (existingRoleError) throw existingRoleError;

      let roleId = existingRole?.id;
      if (!roleId) {
        const { data: insertedRole, error: insertRoleError } = await supabase
          .from("roles")
          .insert({
            company_id: null,
            name: template.name,
            slug: template.slug,
            description: template.description,
            is_system: true,
          })
          .select("id")
          .single();

        if (insertRoleError) throw insertRoleError;
        roleId = insertedRole.id;

        const { data: permissions, error: permissionsError } = await supabase
          .from("permissions")
          .select("key");

        if (permissionsError) throw permissionsError;

        const keys = (permissions ?? [])
          .filter((row: { key: string }) => template.prefixes.includes(row.key.split(".")[0]))
          .map((row: { key: string }) => ({ role_id: roleId, permission_key: row.key }));

        if (keys.length) {
          const { error: rolePermError } = await supabase.from("role_permissions").insert(keys);
          if (rolePermError) throw rolePermError;
        }
      }

      const { error: roleAssignError } = await supabase.from("user_roles").upsert(
        {
          user_id: session.user.id,
          role_id: roleId,
          company_id: null,
        },
        { onConflict: "user_id,role_id,company_id" },
      );

      if (roleAssignError) throw roleAssignError;

      toast.success(`${template.name} role assigned. Redirecting to your dashboard...`);
      void navigate({ to: "/dashboard", replace: true });
    } catch (error) {
      console.error(error);
      toast.error("We couldn’t assign your role. Please try again.");
    } finally {
      setBusy(false);
      setPendingRole(null);
    }
  }

  async function handleSignIn(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    setBusy(true);
    const { error } = await supabase.auth.signInWithPassword({
      email: String(form.get("email")).trim(),
      password: String(form.get("password")),
    });
    setBusy(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Welcome back");
    void navigate({ to: "/dashboard" });
  }

  async function handleReset() {
    const email = window.prompt("Enter the email address on your Neon Forge Properties account");
    if (!email) return;
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Password reset link sent.");
  }

  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <div className="surface-grid hidden flex-col justify-between border-r border-border p-12 lg:flex">
        <Link to="/" className="flex items-center gap-2.5">
          <div className="flex size-8 items-center justify-center rounded-md bg-primary text-primary-foreground">
            <Home className="size-4" />
          </div>
          <span className="text-lg font-semibold tracking-tight">Neon Forge Properties</span>
        </Link>
        <div className="max-w-md">
          <h2 className="text-3xl font-semibold tracking-tight">
            Every role sees exactly what it should.
          </h2>
          <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
            Sign in and Neon Forge Properties loads your company, your role and your permissions, then builds your
            dashboard around them.
          </p>
        </div>
        <p className="text-xs text-muted-foreground">Multi-tenant · Role-based · Audit ready</p>
      </div>

      <div className="flex items-center justify-center px-5 py-12">
        <div className="w-full max-w-sm">
          <h1 className="text-2xl font-semibold tracking-tight">Welcome to Neon Forge Properties</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Manage your portfolio and your team in one place.
          </p>

          {needsRoleSelection && (
            <Card className="mt-6 border-primary/30 bg-primary/5">
              <CardHeader>
                <CardTitle className="text-base">Choose your role</CardTitle>
                <CardDescription>
                  Your Google account is signed in. Pick the role you want to apply for before you
                  continue to the dashboard.
                </CardDescription>
              </CardHeader>
              <CardContent className="grid gap-2">
                {(
                  Object.entries(ROLE_TEMPLATES) as [
                    keyof typeof ROLE_TEMPLATES,
                    (typeof ROLE_TEMPLATES)[keyof typeof ROLE_TEMPLATES],
                  ][]
                ).map(([key, role]) => (
                  <Button
                    key={key}
                    variant="outline"
                    className="justify-start"
                    onClick={() => void assignRole(key)}
                    disabled={busy}
                  >
                    {busy && pendingRole === key && (
                      <Loader2 className="mr-2 size-4 animate-spin" />
                    )}
                    {role.name}
                  </Button>
                ))}
              </CardContent>
            </Card>
          )}

          <form onSubmit={handleSignIn} className="space-y-4 mt-7">
            <div className="space-y-1.5">
              <Label htmlFor="si-email">Email</Label>
              <Input id="si-email" name="email" type="email" required autoComplete="email" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="si-password">Password</Label>
              <Input
                id="si-password"
                name="password"
                type="password"
                required
                autoComplete="current-password"
              />
            </div>
            <Button type="submit" className="w-full" disabled={busy}>
              {busy && <Loader2 className="mr-2 size-4 animate-spin" />} Sign in
            </Button>
            <button
              type="button"
              onClick={handleReset}
              className="w-full text-xs text-muted-foreground underline-offset-4 hover:underline mt-2"
            >
              Forgot your password?
            </button>
          </form>

          <p className="mt-8 text-center text-xs text-muted-foreground">
            <Link to="/" className="underline-offset-4 hover:underline">
              Back to home
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
