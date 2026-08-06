import { Link, useRouterState } from "@tanstack/react-router";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { Badge } from "@/components/ui/badge";
import { NAV_GROUP_ORDER, NAV_ITEMS } from "@/lib/nav";
import { useAuth } from "@/lib/auth";
import { Home } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export function AppSidebar() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const { can, access } = useAuth();
  const pathname = useRouterState({ select: (r) => r.location.pathname });

  const isSuper = access?.profile?.is_super_admin ?? false;
  
  const enabledModules = access?.company?.enabled_modules ?? [];

  const visible = NAV_ITEMS.filter((item) => {
    if (item.soon && !isSuper) return false;
    
    // Check feature/module visibility
    if (item.module && !isSuper) {
      if (!enabledModules.includes(item.module)) return false;
    }

    if (item.superAdminOnly && !isSuper) return false;
    if (item.hideFromSuperAdmin && isSuper) return false;
    
    return can(item.permission);
  });

  return (
    <Sidebar className="print:hidden my-4 ml-4" variant="floating" collapsible="icon">
      <SidebarHeader className="border-b border-border/20 px-4 py-3">
        <div className="flex items-center gap-2.5 px-1.5 py-2">
          {access?.company?.logo_url ? (
            <img 
              src={access.company.logo_url} 
              alt={access.company.name || "Company Logo"} 
              className="flex size-8 shrink-0 items-center justify-center rounded-md object-contain"
            />
          ) : (
            <div className="flex size-8 shrink-0 items-center justify-center rounded-md bg-sidebar-primary text-sidebar-primary-foreground">
              <Home className="size-4" />
            </div>
          )}
          {!collapsed && (
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold tracking-tight">Neon Forge Properties</p>
              <p className="truncate text-xs text-muted-foreground">
                {access?.company?.name ?? "Property platform"}
              </p>
            </div>
          )}
        </div>
      </SidebarHeader>

      <SidebarContent>
        {NAV_GROUP_ORDER.map((group) => {
          const items = visible.filter((i) => i.group === group);
          if (!items.length) return null;
          return (
            <SidebarGroup key={group}>
              <SidebarGroupLabel>{group}</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {items.map((item) => (
                    <SidebarMenuItem key={`${item.label}--${item.to}`}>
                      {item.soon ? (
                        <SidebarMenuButton
                          className="cursor-not-allowed opacity-55"
                          tooltip={`${item.label} — coming soon`}
                        >
                          <item.icon className="size-4" />
                          {!collapsed && (
                            <span className="flex w-full items-center justify-between">
                              {item.label}
                              <Badge variant="outline" className="ml-2 text-[10px]">
                                Soon
                              </Badge>
                            </span>
                          )}
                        </SidebarMenuButton>
                      ) : (
                        <SidebarMenuButton
                          asChild
                          isActive={pathname === item.to}
                          tooltip={item.label}
                        >
                          <Link to={item.to}>
                            <item.icon className="size-4" />
                            <span>{item.label}</span>
                          </Link>
                        </SidebarMenuButton>
                      )}
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          );
        })}
      </SidebarContent>

      <SidebarFooter className="border-t border-sidebar-border">
        {!collapsed && (
          <p className="px-2 py-1 text-xs text-muted-foreground">
            {access?.roles.map((r) => r.name).join(", ") ||
              (access?.profile?.is_super_admin ? "Super Admin" : access?.profile?.position === "Landlord" ? "Landlord" : "No role assigned")}
          </p>
        )}
      </SidebarFooter>
    </Sidebar>
  );
}
