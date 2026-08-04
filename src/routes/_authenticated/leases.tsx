import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Check, Eye, FileText, Key, Loader2, Plus, Search, Download, Trash2, Printer } from "lucide-react";
import { useServerFn } from "@tanstack/react-start";
import { sendEmailFn } from "@/lib/platform.functions";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { money, shortDate, statusTone, titleCase } from "@/lib/platform";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export const Route = createFileRoute("/_authenticated/leases")({
  head: () => ({
    meta: [
      { title: "Leases — Neon Forge Properties" },
      {
        name: "description",
        content: "Active and past leases, move-ins and move-outs across your portfolio.",
      },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: LeasesPage,
});

type LeaseRow = {
  id: string;
  start_date: string;
  end_date: string | null;
  rent: number;
  deposit: number;
  status: string;
  tenants: { full_name: string } | null;
  units: { unit_number: string } | null;
  properties: { name: string } | null;
};

type VacantUnit = {
  id: string;
  unit_number: string;
  rent: number;
  property_id: string;
  properties: { name: string } | null;
  unit_types: { deposit: number; service_charge: number } | null;
};

function LeasesPage() {
  const { access, user, can } = useAuth();
  const companyId = access?.profile?.company_id ?? null;
  const sendEmail = useServerFn(sendEmailFn);
  const currency = access?.company?.currency ?? "KES";
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [status, setStatus] = useState("all");
  const [form, setForm] = useState({
    tenant_id: "",
    unit_id: "",
    start_date: new Date().toISOString().slice(0, 10),
    months: "12",
  });

  const { data: leases, isLoading } = useQuery({
    queryKey: ["leases"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("leases")
        .select(
          "id, start_date, end_date, rent, deposit, status, tenants(full_name), units(unit_number), properties(name)",
        )
        .order("start_date", { ascending: false });
      if (error) throw error;
      return data as unknown as LeaseRow[];
    },
  });

  const { data: tenants } = useQuery({
    queryKey: ["tenants", "picker"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("tenants")
        .select("id, full_name, email")
        .eq("status", "active")
        .order("full_name");
      if (error) throw error;
      return data;
    },
  });

  const { data: vacantUnits } = useQuery({
    queryKey: ["units", "vacant"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("units")
        .select(
          "id, unit_number, rent, property_id, properties(name), unit_types(deposit, service_charge)",
        )
        .eq("status", "vacant")
        .order("unit_number");
      if (error) throw error;
      return data as unknown as VacantUnit[];
    },
  });

  const create = useMutation({
    mutationFn: async () => {
      if (!companyId) throw new Error("Your account is not attached to a company");
      const unit = vacantUnits?.find((u) => u.id === form.unit_id);
      if (!unit) throw new Error("Select a vacant unit");
      const { error } = await supabase.from("leases").insert({
        company_id: companyId,
        tenant_id: form.tenant_id,
        unit_id: unit.id,
        property_id: unit.property_id,
        start_date: form.start_date,
        rent: unit.rent,
        service_charge: unit.unit_types?.service_charge ?? 0,
        deposit: unit.unit_types?.deposit ?? 0,
        billing_day: 1,
        end_date: (() => {
          const d = new Date(form.start_date);
          d.setMonth(d.getMonth() + Number(form.months || 12));
          return d.toISOString().slice(0, 10);
        })(),
      });
      if (error) throw error;
    },
    onSuccess: async () => {
      toast.success("Lease created — unit marked occupied");
      
      const tenant = tenants?.find((t) => t.id === form.tenant_id);
      const unit = vacantUnits?.find((u) => u.id === form.unit_id);
      
      if (tenant?.email && unit) {
        await sendEmail({
          data: {
            to: tenant.email,
            subject: 'Your New Lease - Neon Forge Properties',
            htmlContent: `
              <h1>Lease Confirmation</h1>
              <p>Hello ${tenant.full_name},</p>
              <p>Your lease for <strong>Unit ${unit.unit_number}</strong> at <strong>${unit.properties?.name ?? "Property"}</strong> has been successfully created.</p>
              <ul>
                <li><strong>Start Date:</strong> ${form.start_date}</li>
                <li><strong>End Date:</strong> ${(() => {
                  const d = new Date(form.start_date);
                  d.setMonth(d.getMonth() + Number(form.months || 12));
                  return d.toISOString().slice(0, 10);
                })()}</li>
                <li><strong>Rent:</strong> ${currency} ${unit.rent}</li>
                <li><strong>Deposit:</strong> ${currency} ${unit.unit_types?.deposit ?? 0}</li>
              </ul>
              <p>Welcome to your new home!</p>
            `
          }
        });
      }

      setForm({ ...form, tenant_id: "", unit_id: "" });
      setOpen(false);
      void queryClient.invalidateQueries();
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const terminate = useMutation({
    mutationFn: async (lease: LeaseRow) => {
      const { error } = await supabase
        .from("leases")
        .update({
          status: "terminated",
          terminated_at: new Date().toISOString(),
          end_date: new Date().toISOString().slice(0, 10),
        })
        .eq("id", lease.id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Lease terminated — unit released");
      void queryClient.invalidateQueries();
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const deleteLease = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("leases").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Lease deleted");
      void queryClient.invalidateQueries();
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const rows = (leases ?? []).filter((l) => status === "all" || l.status === status);
  const active = (leases ?? []).filter((l) => l.status === "active").length;

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3 print:hidden">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Leases</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {leases?.length ?? 0} leases · {active} active
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => window.print()}>
            <Download className="mr-1.5 size-4" />
            Export
          </Button>
          <Button asChild variant="outline" size="sm">
            <Link to="/tenants">Tenants</Link>
          </Button>
          {can("tenant.create") && (
            <Dialog open={open} onOpenChange={setOpen}>
              <DialogTrigger asChild>
                <Button size="sm">
                  <Plus className="mr-1.5 size-4" />
                  New lease
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Move a tenant in</DialogTitle>
                  <DialogDescription>
                    Rent, service charge and deposit are pulled from the unit configuration.
                  </DialogDescription>
                </DialogHeader>
                <form
                  className="grid gap-3"
                  onSubmit={(e) => {
                    e.preventDefault();
                    create.mutate();
                  }}
                >
                  <div className="space-y-1.5">
                    <Label>Tenant</Label>
                    <Select
                      value={form.tenant_id}
                      onValueChange={(v) => setForm({ ...form, tenant_id: v })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select tenant" />
                      </SelectTrigger>
                      <SelectContent>
                        {(tenants ?? []).map((t) => (
                          <SelectItem key={t.id} value={t.id}>
                            {t.full_name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1.5">
                    <Label>Vacant unit</Label>
                    <Select
                      value={form.unit_id}
                      onValueChange={(v) => setForm({ ...form, unit_id: v })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select unit" />
                      </SelectTrigger>
                      <SelectContent>
                        {(vacantUnits ?? []).map((u) => (
                          <SelectItem key={u.id} value={u.id}>
                            {u.properties?.name ?? "Property"} · {u.unit_number} ·{" "}
                            {money(u.rent, currency)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <div className="space-y-1.5">
                      <Label htmlFor="start_date">Start date</Label>
                      <Input
                        id="start_date"
                        type="date"
                        value={form.start_date}
                        onChange={(e) => setForm({ ...form, start_date: e.target.value })}
                        required
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="months">No. of months</Label>
                      <Input
                        id="months"
                        type="number"
                        min={1}
                        max={120}
                        value={form.months}
                        onChange={(e) => setForm({ ...form, months: e.target.value })}
                        required
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button
                      type="submit"
                      disabled={create.isPending || !form.tenant_id || !form.unit_id}
                    >
                      {create.isPending && <Loader2 className="mr-2 size-4 animate-spin" />}
                      Create lease
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          )}
        </div>
      </div>

      <Card>
        <CardHeader className="flex flex-row flex-wrap items-center gap-2 space-y-0">
          <Select value={status} onValueChange={setStatus}>
            <SelectTrigger className="h-9 w-44">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All leases</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="terminated">Terminated</SelectItem>
            </SelectContent>
          </Select>
          <CardTitle className="sr-only">Lease list</CardTitle>
        </CardHeader>
        <CardContent className="px-0">
          {isLoading ? (
            <div className="space-y-2 px-6">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
          ) : !rows.length ? (
            <p className="px-6 py-12 text-center text-sm text-muted-foreground">
              <FileText className="mx-auto mb-3 size-6" />
              No leases yet — add a tenant, then move them into a vacant unit.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Tenant</TableHead>
                    <TableHead>Unit</TableHead>
                    <TableHead>Rent</TableHead>
                    <TableHead>Deposit</TableHead>
                    <TableHead>Period</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {rows.map((l) => (
                    <TableRow key={l.id}>
                      <TableCell className="font-medium">{l.tenants?.full_name ?? "—"}</TableCell>
                      <TableCell>
                        {l.properties?.name ?? "—"} · {l.units?.unit_number ?? "—"}
                      </TableCell>
                      <TableCell>{money(l.rent, currency)}</TableCell>
                      <TableCell>{money(l.deposit, currency)}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {shortDate(l.start_date)} → {l.end_date ? shortDate(l.end_date) : "open"}
                      </TableCell>
                      <TableCell>
                        <Badge variant={statusTone(l.status)}>{titleCase(l.status)}</Badge>
                      </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-1">
                              <Link
                                to="/leases/$leaseId/statement"
                                params={{ leaseId: l.id }}
                                className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 hover:bg-accent hover:text-accent-foreground h-8 w-8 text-muted-foreground"
                                title="Print Statement"
                              >
                                <Printer className="size-4" />
                              </Link>
                            {l.status === "active" ? (
                              can("tenant.edit") && (
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => terminate.mutate(l)}
                                  disabled={terminate.isPending}
                                >
                                  Move out
                                </Button>
                              )
                            ) : (
                              <Button
                                size="sm"
                                variant="ghost"
                                className="text-destructive hover:bg-destructive/10"
                                onClick={() => {
                                  if (confirm("Are you sure you want to delete this lease?")) {
                                    deleteLease.mutate(l.id);
                                  }
                                }}
                                disabled={deleteLease.isPending}
                                title="Delete Lease"
                              >
                                <Trash2 className="size-4" />
                              </Button>
                            )}
                          </div>
                        </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
