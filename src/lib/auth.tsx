import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import type { Session, User } from "@supabase/supabase-js";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAppStore } from "@/lib/store";

export type Profile = {
  id: string;
  company_id: string | null;
  full_name: string | null;
  email: string | null;
  phone: string | null;
  position: string | null;
  avatar_url: string | null;
  is_super_admin: boolean;
  status: string;
  requires_password_change: boolean;
};

export type Company = {
  id: string;
  name: string;
  currency: string;
  country: string | null;
  status: string;
  activation_status: string;
  verification_status: string;
  is_demo: boolean;
  created_at: string;
};

export type AccessProfile = {
  profile: Profile | null;
  company: Company | null;
  roles: { id: string; name: string; slug: string }[];
  permissions: string[];
  subscription: { status: string; current_period_end: string | null } | null;
};

type AuthContextValue = {
  session: Session | null;
  user: User | null;
  loading: boolean;
  access: AccessProfile | null;
  accessLoading: boolean;
  can: (key: string) => boolean;
  canAny: (keys: string[]) => boolean;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

async function loadAccess(userId: string, impersonatedCompanyId: string | null): Promise<AccessProfile> {
  const { data: profile } = await supabase
    .from("profiles")
    .select("id, company_id, full_name, email, phone, position, avatar_url, is_super_admin, status")
    .eq("id", userId)
    .maybeSingle();

  let company: Company | null = null;
  let subscription: { status: string; current_period_end: string | null } | null = null;

  let targetCompanyId = profile?.company_id;
  if (profile?.is_super_admin && impersonatedCompanyId) {
    targetCompanyId = impersonatedCompanyId;
  }

  if (targetCompanyId) {
    const { data } = await supabase
      .from("companies")
      .select("id, name, currency, country, status, activation_status, verification_status, is_demo, created_at, logo_url")
      .eq("id", targetCompanyId)
      .maybeSingle();
    company = data as Company | null;

    const { data: subData } = await supabase
      .from("platform_subscriptions" as any)
      .select("status, current_period_end")
      .eq("company_id", targetCompanyId)
      .maybeSingle();
    subscription = subData as any;
  }

  const { data: roleRows } = await supabase
    .from("user_roles")
    .select("role_id, roles(id, name, slug)")
    .eq("user_id", userId);

  const roles = (roleRows ?? [])
    .map((row) => (row as unknown as { roles: { id: string; name: string; slug: string } | null }).roles)
    .filter((r): r is { id: string; name: string; slug: string } => Boolean(r));

  let permissions: string[] = [];
  if (roles.length) {
    const { data: perms } = await supabase
      .from("role_permissions")
      .select("permission_key")
      .in(
        "role_id",
        roles.map((r) => r.id),
      );
    permissions = Array.from(new Set((perms ?? []).map((p) => p.permission_key)));
  }

  // If the user is the Landlord (primary owner), grant them all permissions implicitly
  if ((profile as Profile)?.position === "Landlord") {
    // Alternatively, instead of fetching every permission, we can inject a special wildcard
    // or just fetch all available permissions from system. But here we can just update the `can` check.
  }

  return { profile: (profile as Profile) ?? null, company, roles, permissions, subscription };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const queryClient = useQueryClient();
  const { impersonatedCompanyId } = useAppStore();

  useEffect(() => {
    const { data: sub } = supabase.auth.onAuthStateChange((event, nextSession) => {
      setSession(nextSession);
      setLoading(false);
      if (event === "SIGNED_IN" || event === "SIGNED_OUT" || event === "USER_UPDATED") {
        if (event !== "SIGNED_OUT") void queryClient.invalidateQueries();
      }
    });
    void supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setLoading(false);
    });
    return () => sub.subscription.unsubscribe();
  }, [queryClient]);

  const userId = session?.user.id ?? null;

  const { data: access, isLoading: accessLoading } = useQuery({
    queryKey: ["access", userId, impersonatedCompanyId],
    enabled: Boolean(userId),
    queryFn: () => loadAccess(userId!, impersonatedCompanyId),
    staleTime: 60_000,
  });

  const value = useMemo<AuthContextValue>(() => {
    const permissions = access?.permissions ?? [];
    const isSuper = access?.profile?.is_super_admin ?? false;
    const isLandlord = access?.profile?.position === "Landlord";
    const can = (key: string) => isSuper || isLandlord || permissions.includes(key);
    return {
      session,
      user: session?.user ?? null,
      loading,
      access: access ?? null,
      accessLoading: Boolean(userId) && accessLoading,
      can,
      canAny: (keys: string[]) => keys.some(can),
      signOut: async () => {
        await queryClient.cancelQueries();
        queryClient.clear();
        await supabase.auth.signOut();
      },
    };
  }, [session, loading, access, accessLoading, userId, queryClient]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}
