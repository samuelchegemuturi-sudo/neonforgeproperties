import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { BarChart3, TrendingUp, DollarSign, Users, Building2, DoorOpen } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { money } from "@/lib/platform";
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from "recharts";

export const Route = createFileRoute("/_authenticated/analytics")({
  head: () => ({ meta: [{ title: "Analytics — MAKAO" }] }),
  component: AnalyticsPage,
});

function AnalyticsPage() {
  const { access } = useAuth();
  const isSuper = access?.profile?.is_super_admin ?? false;

  const { data: platform } = useQuery({
    queryKey: ["analytics-platform"],
    enabled: isSuper,
    queryFn: async () => {
      const head = { count: "exact" as const, head: true };
      const [companies, active, properties, units, occupied, revenue] = await Promise.all([
        supabase.from("companies").select("id", head),
        supabase.from("companies").select("id", head).eq("activation_status", "active"),
        supabase.from("properties").select("id", head),
        supabase.from("units").select("id", head),
        supabase.from("units").select("id", head).eq("status", "occupied"),
        supabase.from("subscription_invoices").select("amount, status, period_start"),
      ]);
      const revData = (revenue.data ?? []);
      const monthlyRevenue = revData.reduce((acc: Record<string, number>, inv: any) => {
        const key = inv.period_start ? inv.period_start.slice(0, 7) : "Unknown";
        acc[key] = (acc[key] ?? 0) + Number(inv.amount ?? 0);
        return acc;
      }, {});
      const revenueChart = Object.entries(monthlyRevenue)
        .sort(([a], [b]) => a.localeCompare(b))
        .slice(-9)
        .map(([month, total]) => ({ month: month.slice(0, 7), total }));

      const companyTypeData = await supabase.from("companies").select("company_type");
      const typeCounts: Record<string, number> = {};
      (companyTypeData.data ?? []).forEach((c: any) => {
        typeCounts[c.company_type] = (typeCounts[c.company_type] ?? 0) + 1;
      });
      const typePie = Object.entries(typeCounts).map(([name, value]) => ({ name, value }));

      return {
        companies: companies.count ?? 0,
        active: active.count ?? 0,
        properties: properties.count ?? 0,
        units: units.count ?? 0,
        occupied: occupied.count ?? 0,
        revenueChart,
        typePie,
        totalRevenue: revData.reduce((s: number, i: any) => s + Number(i.amount ?? 0), 0),
      };
    },
  });

  const CHART_COLORS = [
    "var(--chart-1)", "var(--chart-2)", "var(--chart-3)", "var(--chart-4)", "var(--chart-5)"
  ];

  const occupancyRate = platform
    ? Math.round(((platform.occupied) / Math.max(platform.units, 1)) * 100)
    : 0;

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
          <BarChart3 className="size-5 text-primary" /> Platform Analytics
        </h1>
        <p className="text-muted-foreground text-sm mt-1">
          High-level platform performance — companies, properties, and revenue.
        </p>
      </div>

      {/* KPI Summary */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[
          { label: "Total Companies", value: platform?.companies ?? "—", icon: Building2, sub: `${platform?.active ?? 0} active`, color: "text-primary" },
          { label: "Properties", value: platform?.properties ?? "—", icon: Building2, sub: "Across all companies", color: "text-blue-500" },
          { label: "Occupancy Rate", value: `${occupancyRate}%`, icon: DoorOpen, sub: `${platform?.occupied ?? 0} of ${platform?.units ?? 0} units`, color: occupancyRate >= 70 ? "text-green-500" : "text-amber-500" },
          { label: "Total Revenue", value: platform ? money(platform.totalRevenue, "KES") : "—", icon: DollarSign, sub: "All subscription invoices", color: "text-green-500" },
        ].map((k) => (
          <Card key={k.label}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{k.label}</CardTitle>
              <k.icon className={`size-4 ${k.color}`} />
            </CardHeader>
            <CardContent>
              <div className={`text-3xl font-bold ${k.color}`}>{k.value}</div>
              <p className="text-xs text-muted-foreground mt-1">{k.sub}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Revenue Chart */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base">Monthly Subscription Revenue</CardTitle>
            <CardDescription>Total SaaS revenue collected per month.</CardDescription>
          </CardHeader>
          <CardContent className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={platform?.revenueChart ?? []}>
                <defs>
                  <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="var(--primary)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" opacity={0.5} />
                <XAxis dataKey="month" stroke="var(--muted-foreground)" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis stroke="var(--muted-foreground)" fontSize={11} tickLine={false} axisLine={false} />
                <Tooltip
                  contentStyle={{ background: "var(--card)", borderColor: "var(--border)", borderRadius: "8px" }}
                  formatter={(v: number) => [`KES ${v.toLocaleString()}`, "Revenue"]}
                />
                <Area type="monotone" dataKey="total" stroke="var(--primary)" fill="url(#revGrad)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Company type pie */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Company Types</CardTitle>
            <CardDescription>Distribution of company categories.</CardDescription>
          </CardHeader>
          <CardContent className="h-64 flex flex-col items-center justify-center">
            {platform?.typePie && platform.typePie.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={platform.typePie}
                    dataKey="value"
                    nameKey="name"
                    innerRadius={55}
                    outerRadius={85}
                    paddingAngle={3}
                  >
                    {platform.typePie.map((_: any, i: number) => (
                      <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ background: "var(--card)", borderColor: "var(--border)", borderRadius: "8px" }}
                  />
                  <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: "11px" }} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-xs text-muted-foreground">No company data yet.</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
