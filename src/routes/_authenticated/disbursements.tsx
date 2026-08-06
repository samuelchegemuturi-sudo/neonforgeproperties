import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { Send, CheckCircle, Clock, XCircle, Plus, AlertCircle } from "lucide-react";
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { money } from "@/lib/platform";

export const Route = createFileRoute("/_authenticated/disbursements")({
  head: () => ({ meta: [{ title: "Disbursements — MAKAO" }] }),
  component: DisbursementsPage,
});

function DisbursementsPage() {
  const { access } = useAuth();
  const companyId = access?.profile?.company_id;
  const currency = access?.company?.currency ?? "KES";

  const { data: disbursements = [], isLoading } = useQuery({
    queryKey: ["disbursements", companyId],
    queryFn: async () => {
      if (!companyId) return [];
      const { data } = await supabase
        .from("disbursements" as any)
        .select("id, amount, description, status, processed_at, created_at, property_id, properties(name)")
        .eq("company_id", companyId)
        .order("created_at", { ascending: false })
        .limit(100);
      return (data ?? []) as any[];
    },
    enabled: !!companyId,
  });

  const total = disbursements.reduce((s: number, d: any) => s + Number(d.amount ?? 0), 0);
  const completed = disbursements.filter((d: any) => d.status === "completed").reduce((s: number, d: any) => s + Number(d.amount ?? 0), 0);
  const pending = disbursements.filter((d: any) => d.status === "pending" || d.status === "processing").reduce((s: number, d: any) => s + Number(d.amount ?? 0), 0);

  const statusIcon = (status: string) => {
    if (status === "completed") return <CheckCircle className="size-4 text-green-500" />;
    if (status === "failed") return <XCircle className="size-4 text-red-500" />;
    if (status === "processing") return <Clock className="size-4 text-amber-500 animate-spin" />;
    return <Clock className="size-4 text-muted-foreground" />;
  };

  const statusVariant = (status: string): "default" | "secondary" | "destructive" | "outline" => {
    if (status === "completed") return "default";
    if (status === "failed") return "destructive";
    return "secondary";
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Disbursements</h1>
          <p className="text-muted-foreground text-sm mt-1">Owner payouts and landlord disbursements.</p>
        </div>
        <Button id="new-disbursement-btn" size="sm">
          <Plus className="size-4 mr-1.5" /> New Disbursement
        </Button>
      </div>

      {/* KPI */}
      <div className="grid gap-4 sm:grid-cols-3">
        {[
          { label: "Total Disbursed", value: money(total, currency), icon: Send, color: "text-primary" },
          { label: "Completed", value: money(completed, currency), icon: CheckCircle, color: "text-green-500" },
          { label: "Pending / Processing", value: money(pending, currency), icon: Clock, color: "text-amber-500" },
        ].map((k) => (
          <Card key={k.label}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{k.label}</CardTitle>
              <k.icon className={`size-4 ${k.color}`} />
            </CardHeader>
            <CardContent>
              <div className={`text-3xl font-bold ${k.color}`}>{k.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Disbursement History</CardTitle>
          <CardDescription>All owner payouts and landlord disbursements.</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-8 text-center text-sm text-muted-foreground">Loading disbursements…</div>
          ) : disbursements.length === 0 ? (
            <div className="p-12 text-center text-muted-foreground">
              <AlertCircle className="size-8 mx-auto mb-2 opacity-30" />
              <p className="text-sm">No disbursements recorded yet.</p>
              <p className="text-xs mt-1">Create your first disbursement when rent is collected.</p>
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead className="bg-muted/40">
                <tr>
                  <th className="p-3 text-left font-medium text-muted-foreground">Description</th>
                  <th className="p-3 text-left font-medium text-muted-foreground">Property</th>
                  <th className="p-3 text-right font-medium text-muted-foreground">Amount</th>
                  <th className="p-3 text-center font-medium text-muted-foreground">Status</th>
                  <th className="p-3 text-left font-medium text-muted-foreground">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {disbursements.map((d: any) => (
                  <tr key={d.id} className="hover:bg-muted/20">
                    <td className="p-3 font-medium">{d.description ?? "Disbursement"}</td>
                    <td className="p-3 text-muted-foreground text-xs">{(d.properties as any)?.name ?? "—"}</td>
                    <td className="p-3 text-right font-semibold">{money(Number(d.amount ?? 0), currency)}</td>
                    <td className="p-3 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        {statusIcon(d.status)}
                        <Badge variant={statusVariant(d.status)} className="text-xs">{d.status}</Badge>
                      </div>
                    </td>
                    <td className="p-3 text-muted-foreground text-xs">
                      {(d.processed_at ?? d.created_at) ? format(new Date(d.processed_at ?? d.created_at), "dd MMM yyyy") : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
