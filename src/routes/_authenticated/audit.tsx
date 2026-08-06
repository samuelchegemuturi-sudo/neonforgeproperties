import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { ScrollText, Activity, Filter } from "lucide-react";
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";

export const Route = createFileRoute("/_authenticated/audit")({
  head: () => ({ meta: [{ title: "Audit Logs — MAKAO" }] }),
  component: AuditPage,
});

const ACTION_COLORS: Record<string, string> = {
  "company.created_by_admin": "bg-blue-500/15 text-blue-400 border-blue-500/30",
  "company.activated_via_paystack": "bg-green-500/15 text-green-400 border-green-500/30",
  "company.force_activated_by_admin": "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
  "company.suspended": "bg-red-500/15 text-red-400 border-red-500/30",
  "company.verified": "bg-indigo-500/15 text-indigo-400 border-indigo-500/30",
};

function AuditPage() {
  const { access } = useAuth();
  const isSuper = access?.profile?.is_super_admin ?? false;
  const companyId = access?.profile?.company_id;
  const [search, setSearch] = useState("");
  const [actionFilter, setActionFilter] = useState("all");

  const { data: logs = [], isLoading } = useQuery({
    queryKey: ["audit-logs", companyId, isSuper],
    queryFn: async () => {
      let q = supabase
        .from("audit_logs" as any)
        .select("id, action, entity, entity_id, metadata, created_at, actor_id, company_id, profiles:actor_id(full_name, email)")
        .order("created_at", { ascending: false })
        .limit(200);
      if (!isSuper && companyId) {
        q = q.eq("company_id", companyId);
      }
      const { data } = await q;
      return (data ?? []) as any[];
    },
  });

  const actions = [...new Set(logs.map((l: any) => l.action))];

  const filtered = logs.filter((l: any) => {
    if (actionFilter !== "all" && l.action !== actionFilter) return false;
    if (search) {
      const hay = `${l.action} ${l.entity} ${l.entity_id} ${(l.profiles as any)?.email ?? ""}`.toLowerCase();
      if (!hay.includes(search.toLowerCase())) return false;
    }
    return true;
  });

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
          <ScrollText className="size-5 text-primary" /> Audit Logs
        </h1>
        <p className="text-muted-foreground text-sm mt-1">
          Full immutable event trail — every action on the platform.
        </p>
      </div>

      <div className="flex flex-wrap gap-3">
        <Input
          placeholder="Search action, entity or actor…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="h-9 max-w-xs"
          id="audit-search"
        />
        <Select value={actionFilter} onValueChange={setActionFilter}>
          <SelectTrigger className="h-9 w-56" id="audit-action-filter">
            <Filter className="size-3.5 mr-1 text-muted-foreground" />
            <SelectValue placeholder="All actions" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All actions</SelectItem>
            {actions.map((a) => (
              <SelectItem key={a} value={a}>{a}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <span className="ml-auto text-xs text-muted-foreground self-center">{filtered.length} events</span>
      </div>

      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-8 text-center text-muted-foreground text-sm">Loading audit trail…</div>
          ) : filtered.length === 0 ? (
            <div className="p-12 text-center text-muted-foreground">
              <Activity className="size-8 mx-auto mb-2 opacity-30" />
              <p className="text-sm">No audit events match your filters.</p>
            </div>
          ) : (
            <div className="divide-y">
              {filtered.map((log: any) => (
                <div key={log.id} className="flex items-start gap-4 px-5 py-3.5 hover:bg-muted/20">
                  <span
                    className={`mt-0.5 shrink-0 rounded-full border px-2 py-0.5 text-[10px] font-semibold tracking-wide ${
                      ACTION_COLORS[log.action] ?? "bg-muted/40 text-muted-foreground border-border/30"
                    }`}
                  >
                    {log.action}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs text-muted-foreground truncate">
                      <span className="font-medium text-foreground">{(log.profiles as any)?.full_name ?? (log.profiles as any)?.email ?? "System"}</span>
                      {" · "}
                      {log.entity}{log.entity_id ? ` #${String(log.entity_id).slice(0, 8)}` : ""}
                    </p>
                    {log.metadata && Object.keys(log.metadata).length > 0 && (
                      <p className="text-[10px] text-muted-foreground mt-0.5 truncate">
                        {JSON.stringify(log.metadata)}
                      </p>
                    )}
                  </div>
                  <span className="shrink-0 text-xs text-muted-foreground whitespace-nowrap">
                    {log.created_at ? format(new Date(log.created_at), "dd MMM, HH:mm") : "—"}
                  </span>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
