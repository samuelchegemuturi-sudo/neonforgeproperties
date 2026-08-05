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
import { CompanyImpersonator } from "@/components/company-impersonator";

export const Route = createFileRoute("/_authenticated")({
  ssr: false,
  beforeLoad: async () => {
    const { data, error } = await supabase.auth.getUser();
    if (error || !data.user) throw redirect({ to: "/auth" });
    return { user: data.user };
  },
  component: RouteComponent,
});

import { useAppStore } from "@/lib/store";

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
  const { blurIntensity, glassOpacity } = useAppStore();

  useEffect(() => {
    if (!access) return; 
    
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
      <div className={`flex min-h-screen w-full items-center justify-center p-4 ${glassOpacity} ${blurIntensity}`}>
        <div className="max-w-md text-center space-y-4 rounded-3xl border border-border/40 bg-background/60 p-8 shadow-xl backdrop-blur-3xl saturate-200">
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
          <div className="sticky top-4 z-30 px-4 sm:px-6 mb-4 transition-all duration-300">
            <header className={`flex h-14 items-center gap-3 rounded-full border border-border/40 ${glassOpacity} px-4 shadow-[0_8px_30px_rgb(0,0,0,0.08)] ${blurIntensity} saturate-[1.8] print:hidden`}>
              <SidebarTrigger />
              <div className="relative hidden max-w-sm flex-1 sm:block">
                <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search properties, tenants, staff…"
                  className="h-9 pl-9 rounded-full bg-muted/50 border-transparent focus-visible:bg-background focus-visible:border-primary/50 transition-colors"
                  aria-label="Global search"
                />
              </div>
              <div className="ml-auto flex items-center gap-2">
                <CompanyImpersonator />
                <ThemeButton />
                <Button variant="ghost" size="icon" className="rounded-full" aria-label="Notifications">
                  <Bell className="size-4" />
                </Button>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="gap-2 px-2 rounded-full hover:bg-muted/60">
                      <Avatar className="size-7">
                        <AvatarFallback className="text-xs">{initials || "U"}</AvatarFallback>
                      </Avatar>
                      <span className="hidden text-sm sm:inline">{name}</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className={`w-56 rounded-xl border-border/40 ${glassOpacity} ${blurIntensity}`}>
                    <DropdownMenuLabel className="font-normal">
                      <p className="text-sm font-medium">{name}</p>
                      <p className="text-xs text-muted-foreground">
                        {access?.company?.name ?? "No company"}
                      </p>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild className="rounded-lg">
                      <Link to="/settings">
                        <SettingsIcon className="size-4 mr-2" /> Settings
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      className="rounded-lg text-destructive focus:bg-destructive/10 focus:text-destructive"
                      onClick={async () => {
                        await signOut();
                        void navigate({ to: "/auth", replace: true });
                      }}
                    >
                      <LogOut className="size-4 mr-2" /> Sign out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </header>
          </div>
          <div className="px-4 sm:px-6 pb-6 flex-1 flex flex-col">
            <main className={`flex-1 rounded-3xl border border-border/30 ${glassOpacity} ${blurIntensity} saturate-[1.8] shadow-2xl p-4 sm:p-6 overflow-hidden`}>
              <Outlet />
            </main>
          </div>
        </div>
      </div>
    </SidebarProvider>
  );
}
