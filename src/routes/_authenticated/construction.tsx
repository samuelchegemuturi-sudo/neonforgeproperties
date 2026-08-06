import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import {
  HardDrive, Building2, TrendingUp, CheckSquare, AlertCircle,
  ClipboardList, Hammer, Package, ChevronRight, Users, BarChart3,
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter,
  DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { format } from "date-fns";
import { toast } from "sonner";
import {
  Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis, CartesianGrid,
} from "recharts";

export const Route = createFileRoute("/_authenticated/construction")({
  component: ConstructionPage,
});

// ── Handover Checklist items ─────────────────────────────────────────────────
const HANDOVER_CHECKLIST = [
  { id: "keys", label: "Keys / Access Cards Handed Over" },
  { id: "docs", label: "Title Deed / Sale Agreement Signed" },
  { id: "snag", label: "Snagging Inspection Completed" },
  { id: "utilities", label: "Water & Electricity Connected" },
  { id: "clearance", label: "Council Clearance Certificate" },
  { id: "insurance", label: "Building Insurance in Place" },
  { id: "warranty", label: "Defects Liability Period (DLP) Agreed" },
];

function ConstructionPage() {
  const { access } = useAuth();
  const companyId = access?.company?.id;
  const [handoverItems, setHandoverItems] = useState<Record<string, boolean>>({});
  const [selectedUnit, setSelectedUnit] = useState<string | null>(null);

  // Fetch properties as "projects"
  const { data: projects = [], isLoading: projectsLoading } = useQuery({
    queryKey: ["construction-projects", companyId],
    queryFn: async () => {
      if (!companyId) return [];
      const { data } = await supabase
        .from("properties" as any)
        .select(`
          id, name, status, created_at,
          units:units(count)
        `)
        .eq("company_id", companyId)
        .order("created_at", { ascending: false });
      return (data ?? []) as any[];
    },
    enabled: !!companyId,
  });

  const { data: units = [] } = useQuery({
    queryKey: ["construction-units", companyId],
    queryFn: async () => {
      if (!companyId) return [];
      const { data } = await supabase
        .from("units" as any)
        .select(`
          id, unit_number, status, floor, bedrooms,
          properties(id, name)
        `)
        .limit(100);
      return (data ?? []) as any[];
    },
    enabled: !!companyId,
  });

  const { data: maintenance = [] } = useQuery({
    queryKey: ["snagging-tickets", companyId],
    queryFn: async () => {
      if (!companyId) return [];
      const { data } = await supabase
        .from("maintenance_requests" as any)
        .select(`
          id, title, description, status, priority, created_at,
          units(unit_number, properties(name))
        `)
        .eq("company_id", companyId)
        .order("created_at", { ascending: false })
        .limit(20);
      return (data ?? []) as any[];
    },
    enabled: !!companyId,
  });

  // KPIs
  const totalUnits = units.length;
  const soldUnits = units.filter((u: any) => u.status === "occupied" || u.status === "sold").length;
  const availableUnits = units.filter((u: any) => u.status === "vacant").length;
  const salesVelocityPct = totalUnits > 0 ? Math.round((soldUnits / totalUnits) * 100) : 0;

  // Mock sales velocity chart data
  const salesChart = [
    { month: "Mar", units: 2 }, { month: "Apr", units: 5 }, { month: "May", units: 3 },
    { month: "Jun", units: 8 }, { month: "Jul", units: 6 }, { month: "Aug", units: 4 },
  ];

  const openSnagging = maintenance.filter((m: any) => m.status === "open" || m.status === "in_progress").length;

  const toggleHandover = (id: string) => {
    setHandoverItems((prev) => ({ ...prev, [id]: !prev[id] }));
  };
  const handoverProgress = Math.round(
    (Object.values(handoverItems).filter(Boolean).length / HANDOVER_CHECKLIST.length) * 100
  );

  return (
    <div className="flex flex-col gap-6 p-6">
      {/* ── Header ── */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Developer Dashboard</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Manage off-plan projects, track sales velocity, and manage unit handovers.
        </p>
      </div>

      {/* ── KPI Cards ── */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Projects</CardTitle>
            <HardDrive className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{projects.length}</div>
            <p className="text-xs text-muted-foreground">Active developments</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Units Sold / Let</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-500">{soldUnits}</div>
            <div className="mt-1 h-1.5 w-full rounded-full bg-muted overflow-hidden">
              <div className="h-full rounded-full bg-green-500" style={{ width: `${salesVelocityPct}%` }} />
            </div>
            <p className="text-xs text-muted-foreground mt-1">{salesVelocityPct}% of {totalUnits} units</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Available Units</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{availableUnits}</div>
            <p className="text-xs text-muted-foreground">Ready for sale / leasing</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Snagging Tickets</CardTitle>
            <Hammer className="h-4 w-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className={`text-3xl font-bold ${openSnagging > 0 ? "text-amber-500" : "text-green-500"}`}>
              {openSnagging}
            </div>
            <p className="text-xs text-muted-foreground">Open DLP tickets</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* ── Sales Velocity Chart ── */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Sales Velocity</CardTitle>
            <CardDescription>Units sold / let per month.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[220px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={salesChart} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                  <defs>
                    <linearGradient id="salesGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="var(--primary)" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" opacity={0.5} />
                  <XAxis dataKey="month" stroke="var(--muted-foreground)" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="var(--muted-foreground)" fontSize={12} tickLine={false} axisLine={false} allowDecimals={false} />
                  <Tooltip
                    contentStyle={{ backgroundColor: "var(--card)", borderColor: "var(--border)", borderRadius: "8px" }}
                    formatter={(v: number) => [`${v} units`, "Sales"]}
                  />
                  <Area type="monotone" dataKey="units" stroke="var(--primary)" fillOpacity={1} fill="url(#salesGrad)" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* ── Handover Tool ── */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="size-4 text-primary" /> Handover Tool
            </CardTitle>
            <CardDescription>
              Unit handover checklist — {handoverProgress}% complete
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Progress value={handoverProgress} className="h-2" />
            <div className="space-y-2 mt-2">
              {HANDOVER_CHECKLIST.map((item) => (
                <label
                  key={item.id}
                  className="flex items-start gap-2.5 cursor-pointer group"
                  id={`handover-${item.id}`}
                >
                  <input
                    type="checkbox"
                    checked={!!handoverItems[item.id]}
                    onChange={() => toggleHandover(item.id)}
                    className="mt-0.5 size-4 rounded border-border accent-primary"
                  />
                  <span
                    className={`text-sm leading-snug transition-colors ${
                      handoverItems[item.id]
                        ? "line-through text-muted-foreground"
                        : "text-foreground"
                    }`}
                  >
                    {item.label}
                  </span>
                </label>
              ))}
            </div>
            {handoverProgress === 100 && (
              <div className="rounded-lg border border-green-500/30 bg-green-500/10 p-2 text-center mt-2">
                <p className="text-xs font-semibold text-green-600">✓ Unit Ready for Handover</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* ── Projects List ── */}
      <Card>
        <CardHeader>
          <CardTitle>Projects / Developments</CardTitle>
          <CardDescription>All registered properties as development projects.</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <table className="w-full text-sm">
            <thead className="bg-muted/40">
              <tr>
                <th className="p-3 text-left font-medium text-muted-foreground">Project Name</th>
                <th className="p-3 text-center font-medium text-muted-foreground">Units</th>
                <th className="p-3 text-center font-medium text-muted-foreground">Status</th>
                <th className="p-3 text-left font-medium text-muted-foreground">Created</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {projectsLoading ? (
                <tr><td colSpan={4} className="p-8 text-center text-muted-foreground">Loading projects…</td></tr>
              ) : projects.length === 0 ? (
                <tr>
                  <td colSpan={4} className="p-8 text-center text-muted-foreground">
                    <HardDrive className="size-8 mx-auto mb-2 opacity-30" />
                    No projects found. Add a property to get started.
                  </td>
                </tr>
              ) : (
                projects.map((p: any) => (
                  <tr key={p.id} className="hover:bg-muted/20">
                    <td className="p-3 font-medium">{p.name}</td>
                    <td className="p-3 text-center">{(p.units as any)?.[0]?.count ?? 0}</td>
                    <td className="p-3 text-center">
                      <Badge variant={p.status === "active" ? "default" : "secondary"}>
                        {p.status ?? "Active"}
                      </Badge>
                    </td>
                    <td className="p-3 text-muted-foreground text-xs">
                      {p.created_at ? format(new Date(p.created_at), "dd MMM yyyy") : "—"}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </CardContent>
      </Card>

      {/* ── Snagging / DLP Tickets ── */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Hammer className="size-4 text-amber-500" /> Snagging / DLP Maintenance Tickets
          </CardTitle>
          <CardDescription>
            Open defects liability and post-handover snag items.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <table className="w-full text-sm">
            <thead className="bg-muted/40">
              <tr>
                <th className="p-3 text-left font-medium text-muted-foreground">Title</th>
                <th className="p-3 text-left font-medium text-muted-foreground">Unit</th>
                <th className="p-3 text-center font-medium text-muted-foreground">Priority</th>
                <th className="p-3 text-center font-medium text-muted-foreground">Status</th>
                <th className="p-3 text-left font-medium text-muted-foreground">Raised</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {maintenance.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-muted-foreground">
                    <CheckSquare className="size-8 mx-auto mb-2 opacity-30 text-green-500" />
                    No open snagging tickets. All clear!
                  </td>
                </tr>
              ) : (
                maintenance.map((m: any) => (
                  <tr key={m.id} className="hover:bg-muted/20">
                    <td className="p-3 font-medium max-w-[200px] truncate">{m.title}</td>
                    <td className="p-3 text-muted-foreground text-xs">
                      {(m.units as any)?.unit_number ? `Unit ${(m.units as any).unit_number}` : "—"}
                      {(m.units as any)?.properties?.name ? ` · ${(m.units as any).properties.name}` : ""}
                    </td>
                    <td className="p-3 text-center">
                      <Badge
                        variant={
                          m.priority === "urgent" || m.priority === "high"
                            ? "destructive"
                            : m.priority === "medium"
                            ? "outline"
                            : "secondary"
                        }
                      >
                        {m.priority ?? "normal"}
                      </Badge>
                    </td>
                    <td className="p-3 text-center">
                      <Badge variant={m.status === "resolved" ? "default" : "secondary"}>
                        {m.status}
                      </Badge>
                    </td>
                    <td className="p-3 text-muted-foreground text-xs">
                      {m.created_at ? format(new Date(m.created_at), "dd MMM yyyy") : "—"}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
}
