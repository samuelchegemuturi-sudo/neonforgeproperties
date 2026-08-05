import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Building2,
  DoorOpen,
  Users,
  Wallet,
  Wrench,
  UserCog,
  TrendingUp,
  ShieldCheck,
  CircleAlert,
  Briefcase,
  KeyRound,
  BadgeCheck,
  CreditCard,
} from "lucide-react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { money, COMPANY_TYPES, companyTypeLabel } from "@/lib/platform";
import type { SubscriptionQuote } from "@/lib/platform";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useQueryClient, useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export const Route = createFileRoute("/_authenticated/dashboard")({
  head: () => ({
    meta: [
      { title: "Dashboard — Neon Forge Properties" },
      { name: "description", content: "Live portfolio, occupancy and finance insights in Neon Forge Properties." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: Dashboard,
});

type Metric = {
  label: string;
  value: string;
  hint: string;
  icon: typeof Building2;
  permission: string;
};

function Dashboard() {
  const { access, can } = useAuth();
  const isSuper = access?.profile?.is_super_admin ?? false;
  // If Super Admin has a company loaded, they are impersonating it, so show CompanyDashboard
  return isSuper && !access?.company ? <PlatformDashboard /> : <CompanyDashboard />;
}

function Header({ title, subtitle }: { title: string; subtitle: string }) {
  const { access } = useAuth();
  return (
    <div className="flex flex-wrap items-end justify-between gap-3">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
        <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>
      </div>
      <Badge variant="secondary" className="gap-1.5">
        <ShieldCheck className="size-3.5" />
        {access?.profile?.is_super_admin
          ? "All permissions"
          : `${access?.permissions.length ?? 0} permissions`}
      </Badge>
    </div>
  );
}

function MetricGrid({ metrics, loading }: { metrics: Metric[]; loading: boolean }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {metrics.map((m) => (
        <Card key={m.label} className="shadow-[var(--shadow-card)]">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">{m.label}</CardTitle>
            <m.icon className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-8 w-20" />
            ) : (
              <p className="text-2xl font-semibold tracking-tight">{m.value}</p>
            )}
            <p className="mt-1 text-xs text-muted-foreground">{m.hint}</p>
          </CardContent>
        </Card>
      ))}
      {!metrics.length && (
        <Card className="sm:col-span-2 xl:col-span-4">
          <CardContent className="py-10 text-center text-sm text-muted-foreground">
            Your role has no dashboard metrics assigned yet. Ask your company administrator to grant permissions.
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function PlatformDashboard() {
  const queryClient = useQueryClient();
  const { can } = useAuth();
  
  const updateCompany = useMutation({
    mutationFn: async ({ id, patch }: { id: string; patch: any }) => {
      const { error } = await supabase.from("companies").update(patch).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["platform-dashboard"] });
      void queryClient.invalidateQueries({ queryKey: ["companies"] });
      toast.success("Company updated");
    },
    onError: (error: Error) => toast.error(error.message),
  });

  const { data, isLoading } = useQuery({
    queryKey: ["platform-dashboard"],
    queryFn: async () => {
      const head = { count: "exact" as const, head: true };
      const [companies, active, pending, properties, units, occupied, licences, verifications, tickets, invoices, recent] =
        await Promise.all([
          supabase.from("companies").select("id", head),
          supabase.from("companies").select("id", head).eq("activation_status", "active"),
          supabase.from("companies").select("id", head).eq("verification_status", "pending"),
          supabase.from("properties").select("id", head),
          supabase.from("units").select("id", head),
          supabase.from("units").select("id", head).eq("status", "occupied"),
          supabase.from("licences").select("id", head),
          supabase.from("verification_requests").select("id", head).eq("status", "pending"),
          supabase.from("support_tickets").select("id", head).neq("status", "closed"),
          supabase.from("subscription_invoices").select("amount, status, period_start"),
          supabase
            .from("companies")
            .select("id, name, company_type, activation_status, created_at")
            .order("created_at", { ascending: false })
            .limit(6),
        ]);

      const rows = invoices.data ?? [];
      const mrr = rows.reduce((sum, r) => sum + Number(r.amount ?? 0), 0);
      const outstanding = rows
        .filter((r) => r.status !== "paid")
        .reduce((sum, r) => sum + Number(r.amount ?? 0), 0);

      return {
        companies: companies.count ?? 0,
        active: active.count ?? 0,
        pending: pending.count ?? 0,
        properties: properties.count ?? 0,
        units: units.count ?? 0,
        occupied: occupied.count ?? 0,
        licences: licences.count ?? 0,
        verifications: verifications.count ?? 0,
        tickets: tickets.count ?? 0,
        mrr,
        outstanding,
        recent: recent.data ?? [],
      };
    },
  });

  const occupancy = data?.units ? Math.round((data.occupied / data.units) * 100) : 0;

  const metrics: Metric[] = [
    {
      label: "Companies",
      value: String(data?.companies ?? 0),
      hint: `${data?.active ?? 0} activated`,
      icon: Briefcase,
      permission: "companies.view",
    },
    {
      label: "Licences issued",
      value: String(data?.licences ?? 0),
      hint: `${data?.pending ?? 0} awaiting verification`,
      icon: KeyRound,
      permission: "licence.view",
    },
    {
      label: "Properties",
      value: String(data?.properties ?? 0),
      hint: `${data?.units ?? 0} units on platform`,
      icon: Building2,
      permission: "property.view",
    },
    {
      label: "Occupancy",
      value: `${occupancy}%`,
      hint: `${data?.occupied ?? 0} occupied units`,
      icon: TrendingUp,
      permission: "unit.view",
    },
    {
      label: "Subscription billed",
      value: money(data?.mrr ?? 0),
      hint: "Across all invoices",
      icon: CreditCard,
      permission: "subscriptions.view",
    },
    {
      label: "Outstanding",
      value: money(data?.outstanding ?? 0),
      hint: "Unsettled invoices",
      icon: CircleAlert,
      permission: "subscriptions.view",
    },
    {
      label: "Verification queue",
      value: String(data?.verifications ?? 0),
      hint: "Pending site checks",
      icon: BadgeCheck,
      permission: "verification.view",
    },
    {
      label: "Open tickets",
      value: String(data?.tickets ?? 0),
      hint: "Support backlog",
      icon: Wrench,
      permission: "support.view",
    },
  ];

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <Header
        title="Platform dashboard"
        subtitle="Every company, licence and subscription across Neon Forge Properties."
      />
      <MetricGrid metrics={metrics} loading={isLoading} />

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0">
          <div>
            <CardTitle className="text-base">Newest companies</CardTitle>
            <CardDescription>Latest registrations on the platform</CardDescription>
          </div>
          <Button asChild size="sm" variant="outline">
            <Link to="/companies">All companies</Link>
          </Button>
        </CardHeader>
        <CardContent className="space-y-2">
          {isLoading && <Skeleton className="h-24 w-full" />}
          {!isLoading && !data?.recent.length && (
            <p className="py-6 text-center text-sm text-muted-foreground">
              No companies registered yet.
            </p>
          )}
          {data?.recent.map((c) => (
            <div
              key={c.id}
              className="flex items-center justify-between rounded-lg border px-3 py-2 text-sm"
            >
              <span className="font-medium">{c.name}</span>
              <div className="flex items-center gap-2">
                {can("companies.suspend") ? (
                  <Select
                    value={c.company_type}
                    onValueChange={(val) =>
                      updateCompany.mutate({ id: c.id, patch: { company_type: val } })
                    }
                    disabled={updateCompany.isPending}
                  >
                    <SelectTrigger className="h-7 w-[160px] text-[11px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {COMPANY_TYPES.map((t) => (
                        <SelectItem key={t.value} value={t.value} className="text-xs">
                          {t.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : (
                  <Badge variant="secondary" className="text-[11px]">
                    {companyTypeLabel(c.company_type)}
                  </Badge>
                )}
                <Badge variant="outline" className="text-[11px]">
                  {c.activation_status}
                </Badge>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}

function CompanyDashboard() {
  const { access, can } = useAuth();
  const companyId = access?.profile?.company_id ?? null;
  const currency = access?.company?.currency ?? "KES";
  const [selectedBranch, setSelectedBranch] = useState<string>("all");

  const { data: branches } = useQuery({
    queryKey: ["branches", companyId],
    enabled: Boolean(companyId),
    queryFn: async () => {
      const { data, error } = await supabase.from("branches").select("id, name").eq("company_id", companyId!);
      if (error) throw error;
      return data as { id: string; name: string }[];
    },
  });

  const { data, isLoading } = useQuery({
    queryKey: ["company-dashboard", companyId, selectedBranch],
    enabled: Boolean(companyId),
    queryFn: async () => {
      const head = { count: "exact" as const, head: true };
      const isClient = access?.roles?.some(r => r.slug === 'client_landlord');
      const ownerId = isClient ? access?.profile?.id : null;

      let propQuery = supabase.from("properties").select("id", head).eq("company_id", companyId!);
      let unitsQuery = supabase.from("units").select("id", head).eq("company_id", companyId!);
      let occQuery = supabase.from("units").select("id", head).eq("company_id", companyId!).eq("status", "occupied");
      let uRowsQuery = supabase.from("units").select("rent, status, property_id").eq("company_id", companyId!);

      if (isClient && ownerId) {
        propQuery = propQuery.eq("owner_id", ownerId);
        unitsQuery = supabase.from("units").select("id, properties!inner(owner_id, branch_id)", head).eq("company_id", companyId!).eq("properties.owner_id", ownerId) as any;
        occQuery = supabase.from("units").select("id, properties!inner(owner_id, branch_id)", head).eq("company_id", companyId!).eq("status", "occupied").eq("properties.owner_id", ownerId) as any;
        uRowsQuery = supabase.from("units").select("rent, status, properties!inner(owner_id, branch_id)").eq("company_id", companyId!).eq("properties.owner_id", ownerId) as any;
      } else {
        // Even if not client, we need branch_id for filtering
        unitsQuery = supabase.from("units").select("id, properties!inner(branch_id)", head).eq("company_id", companyId!) as any;
        occQuery = supabase.from("units").select("id, properties!inner(branch_id)", head).eq("company_id", companyId!).eq("status", "occupied") as any;
        uRowsQuery = supabase.from("units").select("rent, status, properties!inner(branch_id)").eq("company_id", companyId!) as any;
      }

      if (selectedBranch !== "all") {
        propQuery = propQuery.eq("branch_id", selectedBranch);
        unitsQuery = unitsQuery.eq("properties.branch_id", selectedBranch) as any;
        occQuery = occQuery.eq("properties.branch_id", selectedBranch) as any;
        uRowsQuery = uRowsQuery.eq("properties.branch_id", selectedBranch) as any;
      }

      const [staff, roles, properties, units, occupied, unitRows, licence, quote] = await Promise.all([
        supabase.from("profiles").select("id", head).eq("company_id", companyId!),
        supabase.from("roles").select("id", head).eq("company_id", companyId!),
        propQuery,
        unitsQuery,
        occQuery,
        uRowsQuery,
        supabase.from("licences").select("code").eq("company_id", companyId!).maybeSingle(),
        supabase.rpc("calculate_subscription", { _company_id: companyId!, _paid_only: false }),
      ]);

      const rows = unitRows.data ?? [];
      const potential = rows.reduce((s, u) => s + Number(u.rent ?? 0), 0);
      const billed = rows
        .filter((u) => u.status === "occupied")
        .reduce((s, u) => s + Number(u.rent ?? 0), 0);

      return {
        staff: staff.count ?? 0,
        roles: roles.count ?? 0,
        properties: properties.count ?? 0,
        units: units.count ?? 0,
        occupied: occupied.count ?? 0,
        potential,
        billed,
        licence: licence.data,
        quote: (quote.data as unknown as SubscriptionQuote | null) ?? null,
      };
    },
  });

  const occupancy = data?.units ? Math.round((data.occupied / data.units) * 100) : 0;

  const isBnb = access?.company?.company_type === 'airbnb_host';

  const metrics: Metric[] = [
    {
      label: isBnb ? "Listings" : "Properties",
      value: String(data?.properties ?? 0),
      hint: data?.properties ? "In your portfolio" : "Register your first property",
      icon: Building2,
      permission: "property.view",
    },
    {
      label: isBnb ? "Rooms" : "Units",
      value: String(data?.units ?? 0),
      hint: "Generated from unit types",
      icon: DoorOpen,
      permission: "unit.view",
    },
    {
      label: isBnb ? "Booked rooms" : "Occupied units",
      value: String(data?.occupied ?? 0),
      hint: `Occupancy ${occupancy}%`,
      icon: TrendingUp,
      permission: "unit.view",
    },
    {
      label: isBnb ? "Active guests" : "Active tenants",
      value: "0",
      hint: "Leases arrive next phase",
      icon: Users,
      permission: "tenant.view",
    },
    {
      label: isBnb ? "Expected payout" : "Expected rent",
      value: money(data?.billed ?? 0, currency),
      hint: `${money(data?.potential ?? 0, currency)} at full occupancy`,
      icon: Wallet,
      permission: "finance.view",
    },
    {
      label: "Subscription",
      value: money(data?.quote?.total ?? 0, currency),
      hint: `${data?.quote?.units ?? 0} properties / month${
        access?.subscription?.current_period_end 
          ? ` • Due ${new Date(access.subscription.current_period_end).toLocaleDateString()}` 
          : ''
      }`,
      icon: CreditCard,
      permission: "dashboard.view",
    },
    {
      label: "Maintenance requests",
      value: "0",
      hint: "0 open work orders",
      icon: Wrench,
      permission: "maintenance.view",
    },
    {
      label: "Team members",
      value: String(data?.staff ?? 0),
      hint: `${data?.roles ?? 0} roles configured`,
      icon: UserCog,
      permission: "employees.view",
    },
  ];

  const visibleMetrics = metrics.filter((m) => can(m.permission));
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep"];
  const emptySeries = months.map((m) => ({ month: m, collected: 0, invoiced: 0 }));
  const methodSeries = [
    { name: "M-Pesa", value: 0 },
    { name: "Paystack", value: 0 },
    { name: "Bank", value: 0 },
    { name: "Card", value: 0 },
  ];

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <Header
          title={`${access?.company?.name ?? "Executive"} dashboard`}
          subtitle={`Signed in as ${
            access?.roles.map((r) => r.name).join(", ") || "no role assigned"
          }. You see only what your permissions allow.`}
        />
        {branches && branches.length > 0 && (
          <Select value={selectedBranch} onValueChange={setSelectedBranch}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="All Branches" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Branches</SelectItem>
              {branches.map(b => (
                <SelectItem key={b.id} value={b.id}>{b.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      </div>

      {!isLoading && companyId && !data?.licence && (
        <Card className="border-primary/40 bg-primary/5">
          <CardContent className="flex flex-wrap items-center justify-between gap-3 py-4">
            <div>
              <p className="text-sm font-medium">Your company is not activated yet</p>
              <p className="text-xs text-muted-foreground">
                Complete KYC, add a property and settle the activation fee to receive your licence.
              </p>
            </div>
            <Button asChild size="sm">
              <Link to="/onboarding">Continue activation</Link>
            </Button>
          </CardContent>
        </Card>
      )}

      <MetricGrid metrics={visibleMetrics} loading={isLoading} />

      {can("finance.view") && (
        <div className="grid gap-4 lg:grid-cols-3">
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="text-base">Rent collection</CardTitle>
              <CardDescription>Invoiced vs collected per month</CardDescription>
            </CardHeader>
            <CardContent className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={emptySeries}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                  <XAxis dataKey="month" stroke="var(--muted-foreground)" fontSize={12} />
                  <YAxis stroke="var(--muted-foreground)" fontSize={12} />
                  <Tooltip
                    contentStyle={{
                      background: "var(--popover)",
                      border: "1px solid var(--border)",
                      borderRadius: "var(--radius)",
                      color: "var(--popover-foreground)",
                    }}
                  />
                  <Bar dataKey="invoiced" fill="var(--chart-2)" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="collected" fill="var(--chart-1)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Payment methods</CardTitle>
              <CardDescription>Share of collections</CardDescription>
            </CardHeader>
            <CardContent className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={methodSeries.map((m) => ({ ...m, value: m.value || 1 }))}
                    dataKey="value"
                    nameKey="name"
                    innerRadius={55}
                    outerRadius={85}
                    paddingAngle={3}
                  >
                    {methodSeries.map((_, i) => (
                      <Cell key={i} fill={`var(--chart-${i + 1})`} opacity={0.35} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              <p className="-mt-4 text-center text-xs text-muted-foreground">
                No payments recorded yet
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {can("reports.view") && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Revenue trend</CardTitle>
            <CardDescription>Rolling nine months</CardDescription>
          </CardHeader>
          <CardContent className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={emptySeries}>
                <defs>
                  <linearGradient id="rev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--chart-1)" stopOpacity={0.35} />
                    <stop offset="100%" stopColor="var(--chart-1)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                <XAxis dataKey="month" stroke="var(--muted-foreground)" fontSize={12} />
                <YAxis stroke="var(--muted-foreground)" fontSize={12} />
                <Area
                  type="monotone"
                  dataKey="collected"
                  stroke="var(--chart-1)"
                  fill="url(#rev)"
                  strokeWidth={2}
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
