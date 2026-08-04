import { createFileRoute, Outlet, redirect, Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { ThemeButton } from "@/components/theme-panel";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Bell, LogOut, Search, Settings as SettingsIcon, AlertCircle } from "lucide-react";
import { useAuth } from "@/lib/auth";

export const Route = createFileRoute("/_authenticated")({
  ssr: false,
  beforeLoad: async () => {
    const { data, error } = await supabase.auth.getUser();
    if (error || !data.user) throw redirect({ to: "/auth" });
    return { user: data.user };
  },
  component: RouteComponent,
});

export function RouteComponent() {
  const { access, user, signOut } = useAuth();
  const navigate = useNavigate();
  const name = access?.profile?.full_name ?? access?.profile?.email ?? "User";
  const initials = name
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
    
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  // Activation enforcement
  useEffect(() => {
    if (!access) return; // Wait for access to load
    
    const isSuper = access.profile?.is_super_admin;
    const isEmployee = access.profile?.company_id && !access.company;
    const isActive = access.company?.activation_status === "active";
    const isAllowedRoute = ["/onboarding", "/settings", "/auth", "/support"].includes(pathname);
    
    if (!isSuper && !isEmployee && !isActive && !isAllowedRoute) {
      navigate({ to: "/onboarding", replace: true });
    }

    if (user?.user_metadata?.['requires_password_change'] && pathname !== "/force-password-change") {
      navigate({ to: "/force-password-change", replace: true });
    }
  }, [access, user, pathname, navigate]);

  const isSuspended = access?.profile?.status === "suspended" || access?.company?.status === "suspended";
  const isPastDue = access?.subscription?.current_period_end 
    ? new Date(access.subscription.current_period_end) < new Date()
    : false;
  
  const isSuperAdminRoute = ["/licences", "/companies", "/subscriptions", "/pricing", "/verification", "/leads"].includes(pathname);
  const isLockedOut = (isPastDue || isSuspended) && !(access?.profile?.is_super_admin && isSuperAdminRoute) && !["/support", "/onboarding", "/properties"].includes(pathname);

  if (isLockedOut) {
    return (
      <div className="flex min-h-screen w-full items-center justify-center bg-background p-4">
        <div className="max-w-md text-center space-y-4">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10">
            <AlertCircle className="h-6 w-6 text-destructive" />
          </div>
          <h2 className="text-xl font-semibold">
            {isSuspended ? "Account Suspended" : "Subscription Past Due"}
          </h2>
          <p className="text-sm text-muted-foreground">
            {isSuspended
              ? "Your account or company has been suspended by an administrator. Please contact support."
              : "Your subscription has past its due date. Please renew your subscription to restore access to the platform."}
          </p>
          <div className="flex gap-2 justify-center">
            {isPastDue && !isSuspended && (
              <Button onClick={() => navigate({ to: "/onboarding" })}>Renew Subscription</Button>
            )}
            <Button onClick={signOut} variant="outline">Sign out</Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-transparent">
        <AppSidebar />
        <div className="flex min-w-0 flex-1 flex-col">
          <header className="sticky top-0 z-20 flex h-14 items-center gap-3 border-b border-white/20 dark:border-white/10 bg-background/40 px-3 backdrop-blur-xl print:hidden">
            <SidebarTrigger />
            <div className="relative hidden max-w-sm flex-1 sm:block">
              <Search className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search properties, tenants, staff…"
                className="h-9 pl-8"
                aria-label="Global search"
              />
            </div>
            <div className="ml-auto flex items-center gap-1">
              <ThemeButton />
              <Button variant="ghost" size="icon" aria-label="Notifications">
                <Bell className="size-4" />
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="gap-2 px-2">
                    <Avatar className="size-7">
                      <AvatarFallback className="text-xs">{initials || "U"}</AvatarFallback>
                    </Avatar>
                    <span className="hidden text-sm sm:inline">{name}</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel className="font-normal">
                    <p className="text-sm font-medium">{name}</p>
                    <p className="text-xs text-muted-foreground">
                      {access?.company?.name ?? "No company"}
                    </p>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link to="/settings">
                      <SettingsIcon className="size-4" /> Settings
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={async () => {
                      await signOut();
                      void navigate({ to: "/auth", replace: true });
                    }}
                  >
                    <LogOut className="size-4" /> Sign out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </header>
          <main className="flex-1 p-4 sm:p-6">
            <Outlet />
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
