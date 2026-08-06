import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { Contact, Plus, Phone, Mail, User, Tag, TrendingUp, AlertCircle } from "lucide-react";
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

export const Route = createFileRoute("/_authenticated/crm")({
  head: () => ({ meta: [{ title: "CRM / Leads — MAKAO" }] }),
  component: CRMPage,
});

const LEAD_STAGES = ["New", "Contacted", "Viewing", "Offer", "Won", "Lost"] as const;
type LeadStage = typeof LEAD_STAGES[number];

const STAGE_COLORS: Record<LeadStage, string> = {
  New: "bg-blue-500/15 text-blue-400",
  Contacted: "bg-indigo-500/15 text-indigo-400",
  Viewing: "bg-violet-500/15 text-violet-400",
  Offer: "bg-amber-500/15 text-amber-400",
  Won: "bg-green-500/15 text-green-400",
  Lost: "bg-red-500/15 text-red-400",
};

function CRMPage() {
  const { access } = useAuth();
  const companyId = access?.profile?.company_id;
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [stageFilter, setStageFilter] = useState<string>("all");
  const [search, setSearch] = useState("");
  const [form, setForm] = useState({ full_name: "", email: "", phone: "", stage: "New", notes: "" });

  const { data: leads = [], isLoading } = useQuery({
    queryKey: ["crm-leads", companyId],
    queryFn: async () => {
      if (!companyId) return [];
      const { data } = await supabase
        .from("crm_leads" as any)
        .select("id, full_name, email, phone, stage, notes, created_at, assigned_to, profiles:assigned_to(full_name)")
        .eq("company_id", companyId)
        .order("created_at", { ascending: false });
      return (data ?? []) as any[];
    },
    enabled: !!companyId,
  });

  const addLead = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from("crm_leads" as any).insert({
        company_id: companyId,
        ...form,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Lead added");
      setOpen(false);
      setForm({ full_name: "", email: "", phone: "", stage: "New", notes: "" });
      void queryClient.invalidateQueries({ queryKey: ["crm-leads", companyId] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const updateStage = useMutation({
    mutationFn: async ({ id, stage }: { id: string; stage: string }) => {
      const { error } = await supabase.from("crm_leads" as any).update({ stage }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => void queryClient.invalidateQueries({ queryKey: ["crm-leads", companyId] }),
    onError: (e: Error) => toast.error(e.message),
  });

  const filtered = leads.filter((l: any) => {
    if (stageFilter !== "all" && l.stage !== stageFilter) return false;
    if (search && !`${l.full_name} ${l.email ?? ""} ${l.phone ?? ""}`.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const stageCounts = LEAD_STAGES.reduce((acc, s) => {
    acc[s] = leads.filter((l: any) => l.stage === s).length;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <Contact className="size-5 text-primary" /> CRM / Leads
          </h1>
          <p className="text-muted-foreground text-sm mt-1">Track prospective tenants, buyers, and investors.</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button size="sm" id="add-lead-btn"><Plus className="size-4 mr-1.5" /> Add Lead</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Add New Lead</DialogTitle></DialogHeader>
            <div className="grid gap-3 py-3">
              {[
                { field: "full_name", label: "Full Name", placeholder: "Jane Kamau" },
                { field: "email", label: "Email", placeholder: "jane@example.com" },
                { field: "phone", label: "Phone", placeholder: "+254 7xx xxx xxx" },
              ].map(({ field, label, placeholder }) => (
                <div key={field} className="grid gap-1.5">
                  <Label htmlFor={`lead-${field}`}>{label}</Label>
                  <Input
                    id={`lead-${field}`}
                    placeholder={placeholder}
                    value={(form as any)[field]}
                    onChange={(e) => setForm({ ...form, [field]: e.target.value })}
                  />
                </div>
              ))}
              <div className="grid gap-1.5">
                <Label>Stage</Label>
                <Select value={form.stage} onValueChange={(v) => setForm({ ...form, stage: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {LEAD_STAGES.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-1.5">
                <Label htmlFor="lead-notes">Notes</Label>
                <Input id="lead-notes" placeholder="Interested in 2-bed units…" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
              </div>
            </div>
            <DialogFooter>
              <Button onClick={() => addLead.mutate()} disabled={addLead.isPending || !form.full_name}>
                {addLead.isPending ? "Adding…" : "Add Lead"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Pipeline overview */}
      <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-6">
        {LEAD_STAGES.map((s) => (
          <button
            key={s}
            id={`stage-filter-${s.toLowerCase()}`}
            onClick={() => setStageFilter(stageFilter === s ? "all" : s)}
            className={`rounded-xl border p-3 text-left transition-all ${
              stageFilter === s
                ? "border-primary bg-primary/10"
                : "border-border/30 hover:border-border/60"
            }`}
          >
            <p className="text-xs text-muted-foreground">{s}</p>
            <p className="text-2xl font-bold">{stageCounts[s]}</p>
          </button>
        ))}
      </div>

      {/* Search */}
      <Input
        placeholder="Search leads…"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="max-w-sm"
        id="crm-search"
      />

      {/* Leads table */}
      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-8 text-center text-sm text-muted-foreground">Loading leads…</div>
          ) : filtered.length === 0 ? (
            <div className="p-12 text-center text-muted-foreground">
              <TrendingUp className="size-8 mx-auto mb-2 opacity-30" />
              <p className="text-sm">No leads yet. Add your first prospect.</p>
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead className="bg-muted/40">
                <tr>
                  <th className="p-3 text-left font-medium text-muted-foreground">Lead</th>
                  <th className="p-3 text-left font-medium text-muted-foreground">Contact</th>
                  <th className="p-3 text-center font-medium text-muted-foreground">Stage</th>
                  <th className="p-3 text-left font-medium text-muted-foreground">Notes</th>
                  <th className="p-3 text-left font-medium text-muted-foreground">Added</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {filtered.map((l: any) => (
                  <tr key={l.id} className="hover:bg-muted/20">
                    <td className="p-3 font-medium">{l.full_name}</td>
                    <td className="p-3 text-xs text-muted-foreground">
                      <div className="space-y-0.5">
                        {l.email && <p className="flex items-center gap-1"><Mail className="size-3" />{l.email}</p>}
                        {l.phone && <p className="flex items-center gap-1"><Phone className="size-3" />{l.phone}</p>}
                      </div>
                    </td>
                    <td className="p-3 text-center">
                      <Select value={l.stage ?? "New"} onValueChange={(v) => updateStage.mutate({ id: l.id, stage: v })}>
                        <SelectTrigger className="h-7 w-[110px] text-xs mx-auto">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${STAGE_COLORS[l.stage as LeadStage] ?? ""}`}>
                            {l.stage ?? "New"}
                          </span>
                        </SelectTrigger>
                        <SelectContent>
                          {LEAD_STAGES.map((s) => <SelectItem key={s} value={s} className="text-xs">{s}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </td>
                    <td className="p-3 text-xs text-muted-foreground max-w-[200px] truncate">{l.notes ?? "—"}</td>
                    <td className="p-3 text-xs text-muted-foreground">
                      {l.created_at ? format(new Date(l.created_at), "dd MMM yyyy") : "—"}
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
