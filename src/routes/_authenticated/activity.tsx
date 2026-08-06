import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { Activity, Clock } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";

export const Route = createFileRoute("/_authenticated/activity")({
  head: () => ({ meta: [{ title: "Live Activity — MAKAO" }] }),
  component: ActivityPage,
});

const ACTION_COLOR: Record<string, string> = {
  created: "bg-green-500/20 text-green-400",
  updated: "bg-blue-500/20 text-blue-400",
  deleted: "bg-red-500/20 text-red-400",
  activated: "bg-emerald-500/20 text-emerald-400",
  suspended: "bg-amber-500/20 text-amber-400",
};

function getColor(action: string) {
  for (const [k, v] of Object.entries(ACTION_COLOR)) {
    if (action.includes(k)) return v;
  }
  return "bg-muted/40 text-muted-foreground";
}

function ActivityPage() {
  const { access } = useAuth();
  const isSuper = access?.profile?.is_super_admin ?? false;
  const companyId = access?.profile?.company_id;

  const { data: events = [], isLoading } = useQuery({
    queryKey: ["live-activity", companyId],
    queryFn: async () => {
      let q = supabase
        .from("audit_logs" as any)
        .select("id, action, entity, entity_id, created_at, profiles:actor_id(full_name, email)")
        .order("created_at", { ascending: false })
        .limit(50);
      if (!isSuper && companyId) q = q.eq("company_id", companyId);
      const { data } = await q;
      return (data ?? []) as any[];
    },
    refetchInterval: 15_000, // live-poll every 15s
  });

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <Activity className="size-5 text-primary animate-pulse" /> Live Activity
          </h1>
          <p className="text-muted-foreground text-sm mt-1">Real-time event feed, refreshes every 15 seconds.</p>
        </div>
        <Badge variant="outline" className="gap-1.5">
          <span className="size-2 rounded-full bg-green-500 animate-pulse inline-block" />
          Live
        </Badge>
      </div>

      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-8 text-center text-sm text-muted-foreground">Loading feed…</div>
          ) : events.length === 0 ? (
            <div className="p-12 text-center text-muted-foreground">
              <Clock className="size-8 mx-auto mb-2 opacity-30" />
              <p className="text-sm">No recent activity on your account.</p>
            </div>
          ) : (
            <div className="relative">
              {/* Timeline line */}
              <div className="absolute left-[2.25rem] top-0 bottom-0 w-px bg-border/40" />
              <div className="space-y-0">
                {events.map((ev: any, i: number) => (
                  <div key={ev.id} className="flex items-start gap-4 px-4 py-3 hover:bg-muted/10">
                    <div className={`relative z-10 mt-1 flex size-7 shrink-0 items-center justify-center rounded-full text-[10px] font-bold ${getColor(ev.action)}`}>
                      {ev.entity?.[0]?.toUpperCase() ?? "?"}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground">{ev.action}</p>
                      <p className="text-xs text-muted-foreground truncate">
                        {(ev.profiles as any)?.full_name ?? (ev.profiles as any)?.email ?? "System"}
                        {ev.entity ? ` · ${ev.entity}` : ""}
                      </p>
                    </div>
                    <span className="shrink-0 text-xs text-muted-foreground whitespace-nowrap">
                      {ev.created_at ? format(new Date(ev.created_at), "HH:mm:ss") : "—"}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
