import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { Megaphone, Building2, BedDouble, DollarSign, Eye, ExternalLink } from "lucide-react";
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { money } from "@/lib/platform";

export const Route = createFileRoute("/_authenticated/listings")({
  head: () => ({ meta: [{ title: "Listings — MAKAO" }] }),
  component: ListingsPage,
});

function ListingsPage() {
  const { access } = useAuth();
  const companyId = access?.profile?.company_id;
  const currency = access?.company?.currency ?? "KES";
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const { data: units = [], isLoading } = useQuery({
    queryKey: ["listings", companyId],
    queryFn: async () => {
      if (!companyId) return [];
      const { data } = await supabase
        .from("units" as any)
        .select(`
          id, unit_number, status, rent, bedrooms, bathrooms, floor, description,
          properties(id, name, address, latitude, longitude)
        `)
        .eq("company_id", companyId)
        .order("unit_number")
        .limit(200);
      return (data ?? []) as any[];
    },
    enabled: !!companyId,
  });

  const filtered = units.filter((u: any) => {
    if (statusFilter !== "all" && u.status !== statusFilter) return false;
    if (search) {
      const hay = `${u.unit_number} ${(u.properties as any)?.name ?? ""} ${(u.properties as any)?.address ?? ""}`.toLowerCase();
      if (!hay.includes(search.toLowerCase())) return false;
    }
    return true;
  });

  const vacant = units.filter((u: any) => u.status === "vacant").length;
  const occupied = units.filter((u: any) => u.status === "occupied").length;

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
          <Megaphone className="size-5 text-primary" /> Listings
        </h1>
        <p className="text-muted-foreground text-sm mt-1">All units available for listing — vacancy board.</p>
      </div>

      {/* KPIs */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Units</CardTitle>
            <Building2 className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent><div className="text-3xl font-bold">{units.length}</div></CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Vacant (Available)</CardTitle>
            <Eye className="size-4 text-green-500" />
          </CardHeader>
          <CardContent><div className="text-3xl font-bold text-green-500">{vacant}</div></CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Occupied</CardTitle>
            <BedDouble className="size-4 text-primary" />
          </CardHeader>
          <CardContent><div className="text-3xl font-bold text-primary">{occupied}</div></CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <Input
          id="listings-search"
          placeholder="Search unit, property or address…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="h-9 max-w-xs"
        />
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="h-9 w-44" id="listings-status-filter">
            <SelectValue placeholder="All statuses" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            <SelectItem value="vacant">Vacant</SelectItem>
            <SelectItem value="occupied">Occupied</SelectItem>
            <SelectItem value="reserved">Reserved</SelectItem>
          </SelectContent>
        </Select>
        <span className="ml-auto text-xs text-muted-foreground self-center">{filtered.length} units</span>
      </div>

      {/* Grid */}
      {isLoading ? (
        <div className="text-center text-sm text-muted-foreground py-12">Loading listings…</div>
      ) : filtered.length === 0 ? (
        <div className="text-center text-muted-foreground py-16">
          <Megaphone className="size-10 mx-auto mb-3 opacity-20" />
          <p className="text-sm">No units match your filters.</p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filtered.map((u: any) => (
            <Card key={u.id} className="overflow-hidden hover:shadow-lg transition-shadow group">
              <div className={`h-2 ${u.status === "vacant" ? "bg-green-500" : u.status === "occupied" ? "bg-primary" : "bg-amber-500"}`} />
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-base">Unit {u.unit_number}</CardTitle>
                    <CardDescription className="text-xs truncate">{(u.properties as any)?.name ?? "Unknown property"}</CardDescription>
                  </div>
                  <Badge
                    variant={u.status === "vacant" ? "default" : "secondary"}
                    className="text-[10px] shrink-0"
                  >
                    {u.status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex items-center gap-3 text-xs text-muted-foreground">
                  {u.bedrooms != null && (
                    <span className="flex items-center gap-1"><BedDouble className="size-3" />{u.bedrooms} bed</span>
                  )}
                  {u.floor != null && (
                    <span>Floor {u.floor}</span>
                  )}
                </div>
                {(u.properties as any)?.address && (
                  <p className="text-xs text-muted-foreground truncate">{(u.properties as any).address}</p>
                )}
                <div className="flex items-center justify-between pt-1">
                  <p className="text-sm font-bold text-foreground">
                    {money(Number(u.rent ?? 0), currency)}<span className="text-xs font-normal text-muted-foreground">/mo</span>
                  </p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
