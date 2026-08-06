import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { Tags, TrendingUp, DollarSign, Users, Building2, Plus, AlertCircle, Phone } from "lucide-react";
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { money } from "@/lib/platform";

export const Route = createFileRoute("/_authenticated/sales")({
  head: () => ({ meta: [{ title: "Sales Pipeline — MAKAO" }] }),
  component: SalesPage,
});

const SALE_STAGES = ["Prospect", "Interested", "Offer Made", "Under Contract", "Sold", "Withdrawn"] as const;
type SaleStage = typeof SALE_STAGES[number];

const STAGE_COLORS: Record<SaleStage, string> = {
  "Prospect": "bg-slate-500/20 text-slate-400",
  "Interested": "bg-blue-500/20 text-blue-400",
  "Offer Made": "bg-amber-500/20 text-amber-400",
  "Under Contract": "bg-violet-500/20 text-violet-400",
  "Sold": "bg-green-500/20 text-green-400",
  "Withdrawn": "bg-red-500/20 text-red-400",
};

function SalesPage() {
  const { access } = useAuth();
  const companyId = access?.profile?.company_id;
  const currency = access?.company?.currency ?? "KES";
  const [stageFilter, setStageFilter] = useState("all");
  const [search, setSearch] = useState("");

  // Use units as the "for sale" inventory
  const { data: units = [], isLoading } = useQuery({
    queryKey: ["sales-units", companyId],
    queryFn: async () => {
      if (!companyId) return [];
      const { data } = await supabase
        .from("units" as any)
        .select(`
          id, unit_number, status, rent, bedrooms, floor, sale_price, sale_stage,
          properties(id, name, address)
        `)
        .eq("company_id", companyId)
        .order("unit_number")
        .limit(200);
      return (data ?? []) as any[];
    },
    enabled: !!companyId,
  });

  const totalSaleValue = units
    .filter((u: any) => u.sale_stage === "Sold" || u.status === "sold")
    .reduce((s: number, u: any) => s + Number(u.sale_price ?? u.rent ?? 0), 0);

  const inPipeline = units.filter((u: any) =>
    u.sale_stage && u.sale_stage !== "Sold" && u.sale_stage !== "Withdrawn"
  ).length;

  const soldCount = units.filter((u: any) => u.sale_stage === "Sold" || u.status === "sold").length;

  const filtered = units.filter((u: any) => {
    if (stageFilter !== "all" && (u.sale_stage ?? "Prospect") !== stageFilter) return false;
    if (search) {
      const hay = `Unit ${u.unit_number} ${(u.properties as any)?.name ?? ""}`.toLowerCase();
      if (!hay.includes(search.toLowerCase())) return false;
    }
    return true;
  });

  // Board grouped by stage
  const boardData = SALE_STAGES.map((stage) => ({
    stage,
    items: units.filter((u: any) => (u.sale_stage ?? "Prospect") === stage),
  }));

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <Tags className="size-5 text-primary" /> Sales Pipeline
          </h1>
          <p className="text-muted-foreground text-sm mt-1">Off-plan and secondary market unit sales tracker.</p>
        </div>
        <Button size="sm" id="new-sale-btn"><Plus className="size-4 mr-1.5" /> Record Sale</Button>
      </div>

      {/* KPIs */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Sales Value</CardTitle>
            <DollarSign className="size-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-500">{money(totalSaleValue, currency)}</div>
            <p className="text-xs text-muted-foreground mt-1">{soldCount} units sold</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">In Pipeline</CardTitle>
            <TrendingUp className="size-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-primary">{inPipeline}</div>
            <p className="text-xs text-muted-foreground mt-1">Active deals</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Units</CardTitle>
            <Building2 className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{units.length}</div>
          </CardContent>
        </Card>
      </div>

      {/* Kanban-style board */}
      <div className="overflow-x-auto pb-2">
        <div className="flex gap-4 min-w-max">
          {boardData.map(({ stage, items }) => (
            <div key={stage} className="w-64 shrink-0">
              <div className="flex items-center justify-between mb-2 px-1">
                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">{stage}</span>
                <Badge variant="outline" className="text-[10px] h-5">{items.length}</Badge>
              </div>
              <div className="space-y-2">
                {items.length === 0 ? (
                  <div className="rounded-xl border border-dashed border-border/40 p-4 text-center text-xs text-muted-foreground">
                    No units
                  </div>
                ) : (
                  items.map((u: any) => (
                    <div key={u.id} className="rounded-xl border border-border/30 bg-card p-3 hover:shadow-md transition-shadow">
                      <div className="flex items-start justify-between gap-2">
                        <p className="text-sm font-semibold">Unit {u.unit_number}</p>
                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${STAGE_COLORS[stage as SaleStage]}`}>
                          {stage}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1 truncate">{(u.properties as any)?.name ?? "—"}</p>
                      {u.bedrooms != null && <p className="text-xs text-muted-foreground">{u.bedrooms} bed</p>}
                      {(u.sale_price ?? u.rent) && (
                        <p className="text-sm font-bold mt-1.5">{money(Number(u.sale_price ?? u.rent ?? 0), currency)}</p>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
