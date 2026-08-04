import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useServerFn } from "@tanstack/react-start";
import { sendEmailFn } from "@/lib/platform.functions";
import { Loader2, Plus, Users, Download, Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { shortDate, statusTone, titleCase } from "@/lib/platform";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
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

export const Route = createFileRoute("/_authenticated/tenants")({
  head: () => ({
    meta: [
      { title: "Tenants — Neon Forge Properties" },
      {
        name: "description",
        content: "Tenant register with contacts, KYC status and active leases.",
      },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: TenantsPage,
});

type TenantRow = {
  id: string;
  full_name: string;
  email: string | null;
  phone: string;
  national_id: string | null;
  kyc_status: string;
  status: string;
  created_at: string;
  leases: { id: string; status: string; units: { unit_number: string } | null }[];
};

const emptyForm = {
  full_name: "",
  phone: "",
  email: "",
  national_id: "",
  emergency_name: "",
  emergency_phone: "",
  notes: "",
};

function TenantsPage() {
  const { access, can } = useAuth();
  const companyId = access?.profile?.company_id ?? null;
  const sendEmail = useServerFn(sendEmailFn);
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(emptyForm);

  const { data: tenants, isLoading } = useQuery({
    queryKey: ["tenants"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("tenants")
        .select(
          "id, full_name, email, phone, national_id, kyc_status, status, created_at, leases(id, status, units(unit_number))",
        )
        .order("full_name");
      if (error) throw error;
      return data as unknown as TenantRow[];
    },
  });

  const create = useMutation({
    mutationFn: async () => {
      if (!companyId) throw new Error("Your account is not attached to a company");
      const { error } = await supabase.from("tenants").insert({
        company_id: companyId,
        full_name: form.full_name,
        phone: form.phone,
        email: form.email || null,
        national_id: form.national_id || null,
        emergency_name: form.emergency_name || null,
        emergency_phone: form.emergency_phone || null,
        notes: form.notes || null,
      });
      if (error) throw error;
    },
    onSuccess: async () => {
      toast.success("Tenant added");
      
      if (form.email) {
        await sendEmail({
          data: {
            to: form.email,
            subject: 'Welcome to Neon Forge Properties',
            htmlContent: `
              <h1>Welcome to Neon Forge Properties!</h1>
              <p>Hello ${form.full_name},</p>
              <p>You have been successfully registered as a tenant. We will send your lease documents and payment details here.</p>
              <p>Thank you!</p>
            `
          }
        });
      }

      setForm(emptyForm);
      setOpen(false);
      void queryClient.invalidateQueries({ queryKey: ["tenants"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const deleteTenant = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("tenants").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Tenant deleted");
      void queryClient.invalidateQueries({ queryKey: ["tenants"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const rows = (tenants ?? []).filter((t) =>
    search
      ? `${t.full_name} ${t.phone} ${t.email ?? ""}`.toLowerCase().includes(search.toLowerCase())
      : true,
  );

  const activeLeases = (tenants ?? []).filter((t) =>
    t.leases?.some((l) => l.status === "active"),
  ).length;

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3 print:hidden">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Tenants</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            View contacts, KYC status and active leases for all tenants.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => window.print()}>
            <Download className="mr-1.5 size-4" /> Export
          </Button>
          <Button asChild variant="outline" size="sm">
            <Link to="/leases">Leases</Link>
          </Button>
          {can("tenant.create") && (
            <Dialog open={open} onOpenChange={setOpen}>
              <DialogTrigger asChild>
                <Button size="sm">
                  <Plus className="mr-1.5 size-4" />
                  Add tenant
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-lg">
                <DialogHeader>
                  <DialogTitle>New tenant</DialogTitle>
                  <DialogDescription>
                    Capture the tenant record first, then create a lease to move them into a unit.
                  </DialogDescription>
                </DialogHeader>
                <form
                  className="grid gap-3 sm:grid-cols-2"
                  onSubmit={(e) => {
                    e.preventDefault();
                    create.mutate();
                  }}
                >
                  <div className="space-y-1.5 sm:col-span-2">
                    <Label htmlFor="full_name">Full name</Label>
                    <Input
                      id="full_name"
                      value={form.full_name}
                      onChange={(e) => setForm({ ...form, full_name: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="phone">Phone</Label>
                    <Input
                      id="phone"
                      value={form.phone}
                      onChange={(e) => setForm({ ...form, phone: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={form.email}
                      onChange={(e) => setForm({ ...form, email: e.target.value })}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="national_id">National ID</Label>
                    <Input
                      id="national_id"
                      value={form.national_id}
                      onChange={(e) => setForm({ ...form, national_id: e.target.value })}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="emergency_name">Emergency contact</Label>
                    <Input
                      id="emergency_name"
                      value={form.emergency_name}
                      onChange={(e) => setForm({ ...form, emergency_name: e.target.value })}
                    />
                  </div>
                  <div className="space-y-1.5 sm:col-span-2">
                    <Label htmlFor="emergency_phone">Emergency phone</Label>
                    <Input
                      id="emergency_phone"
                      value={form.emergency_phone}
                      onChange={(e) => setForm({ ...form, emergency_phone: e.target.value })}
                    />
                  </div>
                  <div className="space-y-1.5 sm:col-span-2">
                    <Label htmlFor="notes">Notes</Label>
                    <Textarea
                      id="notes"
                      value={form.notes}
                      onChange={(e) => setForm({ ...form, notes: e.target.value })}
                    />
                  </div>
                  <DialogFooter className="sm:col-span-2">
                    <Button type="submit" disabled={create.isPending}>
                      {create.isPending && <Loader2 className="mr-2 size-4 animate-spin" />}
                      Save tenant
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
          <Input
            placeholder="Search name, phone or email…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-9 max-w-xs"
          />
          <CardTitle className="sr-only">Tenant list</CardTitle>
        </CardHeader>
        <CardContent className="px-0">
          {isLoading ? (
            <div className="space-y-2 px-6">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
          ) : !rows.length ? (
            <p className="px-6 py-12 text-center text-sm text-muted-foreground">
              <Users className="mx-auto mb-3 size-6" />
              No tenants yet.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Tenant</TableHead>
                    <TableHead>Contact</TableHead>
                    <TableHead>Unit</TableHead>
                    <TableHead>KYC</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Added</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {rows.map((t) => {
                    const lease = t.leases?.find((l) => l.status === "active");
                    return (
                      <TableRow key={t.id}>
                        <TableCell className="font-medium">{t.full_name}</TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {t.phone}
                          {t.email ? ` · ${t.email}` : ""}
                        </TableCell>
                        <TableCell>{lease?.units?.unit_number ?? "—"}</TableCell>
                        <TableCell>
                          <Badge variant={statusTone(t.kyc_status)}>
                            {titleCase(t.kyc_status)}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant={statusTone(t.status)}>{titleCase(t.status)}</Badge>
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {shortDate(t.created_at)}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            size="sm"
                            variant="ghost"
                            className="text-destructive hover:bg-destructive/10"
                            onClick={() => {
                              if (confirm("Are you sure you want to completely delete this tenant? This will also delete their history.")) {
                                deleteTenant.mutate(t.id);
                              }
                            }}
                            disabled={deleteTenant.isPending}
                            title="Delete Tenant"
                          >
                            <Trash2 className="size-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
