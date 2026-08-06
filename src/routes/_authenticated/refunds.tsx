import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { Undo2, Plus, Clock, CheckCircle2, XCircle, AlertCircle } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { money } from "@/lib/platform";

export const Route = createFileRoute("/_authenticated/refunds")({
  head: () => ({ meta: [{ title: "Refunds — MAKAO" }] }),
  component: RefundsPage,
});

function RefundsPage() {
  const { access } = useAuth();
  const companyId = access?.profile?.company_id;
  const currency = access?.company?.currency ?? "KES";
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ tenant_id: "", amount: "", reason: "", payment_method: "mpesa" });

  const { data: refunds = [], isLoading } = useQuery({
    queryKey: ["refunds", companyId],
    queryFn: async () => {
      if (!companyId) return [];
      const { data } = await supabase
        .from("refunds" as any)
        .select("id, amount, reason, status, payment_method, created_at, processed_at, tenant_id, profiles:tenant_id(full_name, email)")
        .eq("company_id", companyId)
        .order("created_at", { ascending: false })
        .limit(100);
      return (data ?? []) as any[];
    },
    enabled: !!companyId,
  });

  const submitRefund = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from("refunds" as any).insert({
        company_id: companyId,
        tenant_id: form.tenant_id || null,
        amount: Number(form.amount),
        reason: form.reason,
        payment_method: form.payment_method,
        status: "pending",
      });
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Refund request submitted");
      setOpen(false);
      setForm({ tenant_id: "", amount: "", reason: "", payment_method: "mpesa" });
      void queryClient.invalidateQueries({ queryKey: ["refunds", companyId] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const total = refunds.reduce((s: number, r: any) => s + Number(r.amount ?? 0), 0);
  const pending = refunds.filter((r: any) => r.status === "pending").length;
  const processed = refunds.filter((r: any) => r.status === "processed" || r.status === "completed").length;

  const statusIcon = (status: string) => {
    if (status === "processed" || status === "completed") return <CheckCircle2 className="size-4 text-green-500" />;
    if (status === "rejected") return <XCircle className="size-4 text-red-500" />;
    return <Clock className="size-4 text-amber-500" />;
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <Undo2 className="size-5 text-primary" /> Refunds
          </h1>
          <p className="text-muted-foreground text-sm mt-1">Tenant refund requests and processing.</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button size="sm" id="new-refund-btn"><Plus className="size-4 mr-1.5" /> New Refund</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Submit Refund Request</DialogTitle></DialogHeader>
            <div className="grid gap-3 py-3">
              <div className="grid gap-1.5">
                <Label htmlFor="refund-amount">Amount ({currency})</Label>
                <Input id="refund-amount" type="number" min="1" placeholder="5000" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} />
              </div>
              <div className="grid gap-1.5">
                <Label htmlFor="refund-reason">Reason</Label>
                <Input id="refund-reason" placeholder="Deposit refund on lease termination…" value={form.reason} onChange={(e) => setForm({ ...form, reason: e.target.value })} />
              </div>
              <div className="grid gap-1.5">
                <Label>Payment Method</Label>
                <Select value={form.payment_method} onValueChange={(v) => setForm({ ...form, payment_method: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {["mpesa", "bank_transfer", "cash", "cheque"].map((m) => <SelectItem key={m} value={m}>{m}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button onClick={() => submitRefund.mutate()} disabled={submitRefund.isPending || !form.amount || !form.reason}>
                {submitRefund.isPending ? "Submitting…" : "Submit Refund"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        {[
          { label: "Total Refunded", value: money(total, currency), color: "text-primary" },
          { label: "Pending", value: String(pending), color: "text-amber-500" },
          { label: "Processed", value: String(processed), color: "text-green-500" },
        ].map((k) => (
          <Card key={k.label}>
            <CardHeader className="pb-2"><CardTitle className="text-sm font-medium">{k.label}</CardTitle></CardHeader>
            <CardContent><div className={`text-3xl font-bold ${k.color}`}>{k.value}</div></CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-8 text-center text-sm text-muted-foreground">Loading refunds…</div>
          ) : refunds.length === 0 ? (
            <div className="p-12 text-center text-muted-foreground">
              <AlertCircle className="size-8 mx-auto mb-2 opacity-30" />
              <p className="text-sm">No refund requests yet.</p>
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead className="bg-muted/40">
                <tr>
                  <th className="p-3 text-left font-medium text-muted-foreground">Reason</th>
                  <th className="p-3 text-left font-medium text-muted-foreground">Tenant</th>
                  <th className="p-3 text-right font-medium text-muted-foreground">Amount</th>
                  <th className="p-3 text-center font-medium text-muted-foreground">Method</th>
                  <th className="p-3 text-center font-medium text-muted-foreground">Status</th>
                  <th className="p-3 text-left font-medium text-muted-foreground">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {refunds.map((r: any) => (
                  <tr key={r.id} className="hover:bg-muted/20">
                    <td className="p-3 font-medium max-w-[180px] truncate">{r.reason ?? "—"}</td>
                    <td className="p-3 text-xs text-muted-foreground">{(r.profiles as any)?.full_name ?? "—"}</td>
                    <td className="p-3 text-right font-semibold">{money(Number(r.amount ?? 0), currency)}</td>
                    <td className="p-3 text-center text-xs"><Badge variant="outline">{r.payment_method ?? "—"}</Badge></td>
                    <td className="p-3 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        {statusIcon(r.status)}
                        <span className="text-xs">{r.status}</span>
                      </div>
                    </td>
                    <td className="p-3 text-xs text-muted-foreground">
                      {r.created_at ? format(new Date(r.created_at), "dd MMM yyyy") : "—"}
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
