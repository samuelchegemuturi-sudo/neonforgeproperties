import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { format } from "date-fns";
import {
  Plus, FileText, Printer, CheckCircle2, AlertCircle, Clock,
  Ban, Zap, CreditCard, Search, ChevronDown, MoreHorizontal,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter,
  DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  useTenantInvoices, useCreateTenantInvoice, useFiscalizeInvoice,
  useLogInvoicePayment, useVoidInvoice, type InvoiceLineItem,
} from "@/hooks/use-invoices";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";

export const Route = createFileRoute("/_authenticated/invoices")({
  component: InvoicesPage,
});

// ── Status config ────────────────────────────────────────────────────────────
const STATUS_CONFIG = {
  unpaid: { label: "Unpaid", variant: "secondary" as const, icon: Clock },
  partial: { label: "Partial", variant: "outline" as const, icon: AlertCircle },
  paid: { label: "Paid", variant: "default" as const, icon: CheckCircle2 },
  void: { label: "Void", variant: "destructive" as const, icon: Ban },
};

const DIGITAX_CONFIG = {
  pending: { label: "Not Fiscalized", color: "text-muted-foreground" },
  submitted: { label: "Submitting…", color: "text-yellow-500" },
  fiscalized: { label: "eTIMS ✓", color: "text-green-500" },
  failed: { label: "Failed", color: "text-destructive" },
};

// ── Main Component ───────────────────────────────────────────────────────────
function InvoicesPage() {
  const { data: invoices = [], isLoading } = useTenantInvoices();
  const fiscalize = useFiscalizeInvoice();
  const logPayment = useLogInvoicePayment();
  const voidInvoice = useVoidInvoice();

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [paymentInvoiceId, setPaymentInvoiceId] = useState<string | null>(null);
  const [paymentRef, setPaymentRef] = useState("");
  const [createOpen, setCreateOpen] = useState(false);

  const filtered = invoices.filter((inv) => {
    const matchSearch =
      !search ||
      inv.invoice_number?.toLowerCase().includes(search.toLowerCase()) ||
      (inv.tenants as any)?.full_name?.toLowerCase().includes(search.toLowerCase()) ||
      inv.description.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === "all" || inv.status === statusFilter;
    return matchSearch && matchStatus;
  });

  // KPI calculations
  const totalOutstanding = invoices
    .filter((i) => i.status !== "paid" && i.status !== "void")
    .reduce((sum, i) => sum + Number(i.amount), 0);
  const totalCollected = invoices
    .filter((i) => i.status === "paid")
    .reduce((sum, i) => sum + Number(i.amount), 0);
  const totalFiscalized = invoices.filter((i) => i.digitax_status === "fiscalized").length;

  return (
    <div className="flex flex-col gap-6 p-6">
      {/* ── Header ── */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">eTIMS Rent Invoices</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Create KRA-compliant invoices and track payments.
          </p>
        </div>
        <Dialog open={createOpen} onOpenChange={setCreateOpen}>
          <DialogTrigger asChild>
            <Button id="create-invoice-btn" className="gap-2">
              <Plus className="size-4" /> Create Invoice
            </Button>
          </DialogTrigger>
          <CreateInvoiceDialog onClose={() => setCreateOpen(false)} />
        </Dialog>
      </div>

      {/* ── KPI Cards ── */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Outstanding</CardTitle>
            <AlertCircle className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">
              KSH {totalOutstanding.toLocaleString("en-KE", { minimumFractionDigits: 2 })}
            </div>
            <p className="text-xs text-muted-foreground">Unpaid + partial invoices</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Collected</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-500">
              KSH {totalCollected.toLocaleString("en-KE", { minimumFractionDigits: 2 })}
            </div>
            <p className="text-xs text-muted-foreground">Paid invoices</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">eTIMS Fiscalized</CardTitle>
            <Zap className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalFiscalized}</div>
            <p className="text-xs text-muted-foreground">
              of {invoices.length} invoices
            </p>
          </CardContent>
        </Card>
      </div>

      {/* ── Filters ── */}
      <Card>
        <CardHeader>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle>All Invoices</CardTitle>
              <CardDescription>Manage and fiscalize rent invoices.</CardDescription>
            </div>
            <div className="flex gap-2">
              <div className="relative max-w-xs flex-1">
                <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="invoice-search"
                  placeholder="Search invoices…"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-9 h-9"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger id="invoice-status-filter" className="w-[130px] h-9">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="unpaid">Unpaid</SelectItem>
                  <SelectItem value="partial">Partial</SelectItem>
                  <SelectItem value="paid">Paid</SelectItem>
                  <SelectItem value="void">Void</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="rounded-b-lg overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-muted/50">
                <tr>
                  <th className="p-3 text-left font-medium text-muted-foreground">Invoice #</th>
                  <th className="p-3 text-left font-medium text-muted-foreground">Tenant</th>
                  <th className="p-3 text-left font-medium text-muted-foreground">Description</th>
                  <th className="p-3 text-left font-medium text-muted-foreground">Due Date</th>
                  <th className="p-3 text-right font-medium text-muted-foreground">Amount</th>
                  <th className="p-3 text-center font-medium text-muted-foreground">Status</th>
                  <th className="p-3 text-center font-medium text-muted-foreground">eTIMS</th>
                  <th className="p-3 text-center font-medium text-muted-foreground">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {isLoading ? (
                  <tr>
                    <td colSpan={8} className="p-8 text-center text-muted-foreground">
                      Loading invoices…
                    </td>
                  </tr>
                ) : filtered.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="p-8 text-center text-muted-foreground">
                      <FileText className="size-8 mx-auto mb-2 opacity-30" />
                      No invoices found.
                    </td>
                  </tr>
                ) : (
                  filtered.map((inv) => {
                    const statusCfg = STATUS_CONFIG[inv.status] ?? STATUS_CONFIG.unpaid;
                    const dtCfg = DIGITAX_CONFIG[inv.digitax_status] ?? DIGITAX_CONFIG.pending;
                    const StatusIcon = statusCfg.icon;
                    return (
                      <tr key={inv.id} className="hover:bg-muted/30 transition-colors">
                        <td className="p-3 font-mono text-xs font-medium">
                          {inv.invoice_number ?? "—"}
                        </td>
                        <td className="p-3">
                          <div className="font-medium">
                            {(inv.tenants as any)?.full_name ?? "—"}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {(inv.properties as any)?.name}
                            {(inv.units as any)?.unit_number ? ` · Unit ${(inv.units as any).unit_number}` : ""}
                          </div>
                        </td>
                        <td className="p-3 text-muted-foreground max-w-[180px] truncate">
                          {inv.description}
                        </td>
                        <td className="p-3 whitespace-nowrap text-sm">
                          {format(new Date(inv.due_date), "dd MMM yyyy")}
                        </td>
                        <td className="p-3 text-right font-semibold">
                          KSH {Number(inv.amount).toLocaleString("en-KE", { minimumFractionDigits: 2 })}
                        </td>
                        <td className="p-3 text-center">
                          <Badge variant={statusCfg.variant} className="gap-1">
                            <StatusIcon className="size-3" />
                            {statusCfg.label}
                          </Badge>
                        </td>
                        <td className={`p-3 text-center text-xs font-medium ${dtCfg.color}`}>
                          {dtCfg.label}
                          {inv.digitax_control_number && (
                            <div className="font-mono text-[10px] mt-0.5 opacity-70">
                              {inv.digitax_control_number.slice(0, 12)}…
                            </div>
                          )}
                        </td>
                        <td className="p-3 text-center">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="size-8 rounded-full" id={`invoice-actions-${inv.id}`}>
                                <MoreHorizontal className="size-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-48">
                              <DropdownMenuItem asChild>
                                <Link to="/invoices/$invoiceId/print" params={{ invoiceId: inv.id }} target="_blank">
                                  <Printer className="size-4 mr-2" /> View / Print
                                </Link>
                              </DropdownMenuItem>
                              {inv.digitax_status !== "fiscalized" && inv.status !== "void" && (
                                <DropdownMenuItem
                                  onClick={() => fiscalize.mutate(inv.id)}
                                  disabled={fiscalize.isPending}
                                  id={`fiscalize-${inv.id}`}
                                >
                                  <Zap className="size-4 mr-2 text-primary" />
                                  Fiscalize (eTIMS)
                                </DropdownMenuItem>
                              )}
                              {inv.status !== "paid" && inv.status !== "void" && (
                                <DropdownMenuItem
                                  onClick={() => { setPaymentInvoiceId(inv.id); setPaymentRef(""); }}
                                  id={`log-payment-${inv.id}`}
                                >
                                  <CreditCard className="size-4 mr-2 text-green-500" /> Log Payment
                                </DropdownMenuItem>
                              )}
                              {inv.status !== "void" && (
                                <>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem
                                    className="text-destructive"
                                    onClick={() => voidInvoice.mutate(inv.id)}
                                    id={`void-${inv.id}`}
                                  >
                                    <Ban className="size-4 mr-2" /> Void Invoice
                                  </DropdownMenuItem>
                                </>
                              )}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* ── Log Payment Dialog ── */}
      <Dialog open={!!paymentInvoiceId} onOpenChange={(o) => !o && setPaymentInvoiceId(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Log Manual Payment</DialogTitle>
            <DialogDescription>
              Enter the M-Pesa transaction code or bank reference to mark this invoice as paid.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-2">
            <div className="grid gap-2">
              <Label htmlFor="payment-ref">M-Pesa Code / Bank Reference</Label>
              <Input
                id="payment-ref"
                placeholder="e.g. QHW4B8KZPQ or REF20240801"
                value={paymentRef}
                onChange={(e) => setPaymentRef(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setPaymentInvoiceId(null)}>
              Cancel
            </Button>
            <Button
              disabled={!paymentRef.trim() || logPayment.isPending}
              onClick={() => {
                if (paymentInvoiceId && paymentRef.trim()) {
                  logPayment.mutate(
                    { invoiceId: paymentInvoiceId, reference: paymentRef.trim() },
                    { onSuccess: () => { setPaymentInvoiceId(null); setPaymentRef(""); } }
                  );
                }
              }}
              id="confirm-log-payment"
            >
              {logPayment.isPending ? "Saving…" : "Confirm Payment"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ── Create Invoice Dialog ────────────────────────────────────────────────────
function CreateInvoiceDialog({ onClose }: { onClose: () => void }) {
  const createInvoice = useCreateTenantInvoice();
  const { access } = useAuth();
  const companyId = access?.company?.id;

  const { data: leases = [] } = useQuery({
    queryKey: ["leases-for-invoice", companyId],
    queryFn: async () => {
      if (!companyId) return [];
      const { data } = await supabase
        .from("leases")
        .select(`
          id, rent,
          profiles:tenant_id(full_name, email),
          units(unit_number, property_id, properties(id, name))
        `)
        .eq("status", "active")
        .limit(100);
      return (data ?? []) as any[];
    },
    enabled: !!companyId,
  });

  const [selectedLeaseId, setSelectedLeaseId] = useState<string>("");
  const [description, setDescription] = useState("Monthly Rent");
  const [dueDate, setDueDate] = useState(format(new Date(), "yyyy-MM-dd"));
  const [taxRate, setTaxRate] = useState(16);
  const [buyerPin, setBuyerPin] = useState("");
  const [notes, setNotes] = useState("");
  const [lineItems, setLineItems] = useState<InvoiceLineItem[]>([
    { description: "Monthly Rent", quantity: 1, unit_price: 0 },
  ]);

  const selectedLease = leases.find((l) => l.id === selectedLeaseId);

  // Auto-populate from lease
  const handleLeaseChange = (leaseId: string) => {
    setSelectedLeaseId(leaseId);
    const lease = leases.find((l) => l.id === leaseId);
    if (lease) {
      setLineItems([
        { description: "Monthly Rent", quantity: 1, unit_price: Number(lease.rent ?? 0) },
      ]);
    }
  };

  const updateLineItem = (index: number, field: keyof InvoiceLineItem, value: string | number) => {
    setLineItems((prev) => prev.map((item, i) => i === index ? { ...item, [field]: value } : item));
  };

  const addLineItem = () => {
    setLineItems((prev) => [...prev, { description: "", quantity: 1, unit_price: 0 }]);
  };

  const removeLineItem = (index: number) => {
    setLineItems((prev) => prev.filter((_, i) => i !== index));
  };

  const subtotal = lineItems.reduce((s, i) => s + i.quantity * i.unit_price, 0);
  const taxAmount = subtotal * (taxRate / 100);
  const total = subtotal + taxAmount;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!description || !dueDate || lineItems.length === 0) return;

    const lease = leases.find((l) => l.id === selectedLeaseId);

    createInvoice.mutate(
      {
        lease_id: selectedLeaseId || null,
        tenant_id: (lease?.profiles as any)?.id ?? null,
        unit_id: lease?.units?.id ?? null,
        property_id: lease?.units?.property_id ?? null,
        description,
        due_date: dueDate,
        tax_rate: taxRate,
        buyer_pin: buyerPin || undefined,
        notes: notes || undefined,
        line_items: lineItems,
      },
      { onSuccess: () => onClose() }
    );
  };

  return (
    <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
      <DialogHeader>
        <DialogTitle>Create eTIMS Rent Invoice</DialogTitle>
        <DialogDescription>
          Generate a KRA-compliant tax invoice. Fiscalize after creation to get the control number and QR code.
        </DialogDescription>
      </DialogHeader>
      <form onSubmit={handleSubmit} className="grid gap-5 py-2">
        {/* Lease selection */}
        <div className="grid gap-2">
          <Label htmlFor="inv-lease">Lease (optional — auto-fills rent)</Label>
          <Select value={selectedLeaseId} onValueChange={handleLeaseChange}>
            <SelectTrigger id="inv-lease">
              <SelectValue placeholder="Select a lease…" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">— None —</SelectItem>
              {leases.map((l) => (
                <SelectItem key={l.id} value={l.id}>
                  {(l.profiles as any)?.full_name ?? "Tenant"} —{" "}
                  {(l.units as any)?.properties?.name} · Unit {(l.units as any)?.unit_number}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="grid gap-2">
            <Label htmlFor="inv-desc">Invoice Description *</Label>
            <Input
              id="inv-desc"
              required
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g. Rent — August 2026"
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="inv-due">Due Date *</Label>
            <Input
              id="inv-due"
              type="date"
              required
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="grid gap-2">
            <Label htmlFor="inv-tax">VAT Rate (%)</Label>
            <Input
              id="inv-tax"
              type="number"
              min={0}
              max={100}
              step={0.1}
              value={taxRate}
              onChange={(e) => setTaxRate(Number(e.target.value))}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="inv-pin">Buyer KRA PIN (optional)</Label>
            <Input
              id="inv-pin"
              value={buyerPin}
              onChange={(e) => setBuyerPin(e.target.value.toUpperCase())}
              placeholder="e.g. A000123456X"
            />
          </div>
        </div>

        <Separator />

        {/* Line Items */}
        <div className="grid gap-3">
          <div className="flex items-center justify-between">
            <Label>Line Items *</Label>
            <Button type="button" variant="outline" size="sm" onClick={addLineItem} className="gap-1 text-xs">
              <Plus className="size-3" /> Add Row
            </Button>
          </div>
          <div className="rounded-md border overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-muted/50">
                <tr>
                  <th className="p-2 text-left font-medium text-muted-foreground">Description</th>
                  <th className="p-2 text-center font-medium text-muted-foreground w-20">Qty</th>
                  <th className="p-2 text-right font-medium text-muted-foreground w-32">Unit Price</th>
                  <th className="p-2 text-right font-medium text-muted-foreground w-32">Total</th>
                  <th className="p-2 w-10"></th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {lineItems.map((item, idx) => (
                  <tr key={idx}>
                    <td className="p-1">
                      <Input
                        required
                        value={item.description}
                        onChange={(e) => updateLineItem(idx, "description", e.target.value)}
                        className="border-0 bg-transparent focus-visible:ring-0 h-8 text-sm"
                        placeholder="Description…"
                      />
                    </td>
                    <td className="p-1">
                      <Input
                        type="number"
                        min={1}
                        value={item.quantity}
                        onChange={(e) => updateLineItem(idx, "quantity", Number(e.target.value))}
                        className="border-0 bg-transparent text-center focus-visible:ring-0 h-8 text-sm"
                      />
                    </td>
                    <td className="p-1">
                      <Input
                        type="number"
                        min={0}
                        value={item.unit_price}
                        onChange={(e) => updateLineItem(idx, "unit_price", Number(e.target.value))}
                        className="border-0 bg-transparent text-right focus-visible:ring-0 h-8 text-sm"
                      />
                    </td>
                    <td className="p-2 text-right font-medium text-sm">
                      {(item.quantity * item.unit_price).toLocaleString("en-KE")}
                    </td>
                    <td className="p-1 text-center">
                      {lineItems.length > 1 && (
                        <Button type="button" variant="ghost" size="icon" className="size-7"
                          onClick={() => removeLineItem(idx)}>
                          <Ban className="size-3" />
                        </Button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="bg-muted/30 border-t text-sm font-medium">
                <tr>
                  <td colSpan={3} className="p-2 text-right text-muted-foreground">Subtotal</td>
                  <td className="p-2 text-right">KSH {subtotal.toLocaleString("en-KE", { minimumFractionDigits: 2 })}</td>
                  <td />
                </tr>
                <tr>
                  <td colSpan={3} className="p-2 text-right text-muted-foreground">VAT ({taxRate}%)</td>
                  <td className="p-2 text-right">KSH {taxAmount.toLocaleString("en-KE", { minimumFractionDigits: 2 })}</td>
                  <td />
                </tr>
                <tr className="text-base">
                  <td colSpan={3} className="p-2 text-right font-bold">Total</td>
                  <td className="p-2 text-right font-bold text-primary">
                    KSH {total.toLocaleString("en-KE", { minimumFractionDigits: 2 })}
                  </td>
                  <td />
                </tr>
              </tfoot>
            </table>
          </div>
        </div>

        <div className="grid gap-2">
          <Label htmlFor="inv-notes">Internal Notes (optional)</Label>
          <Input id="inv-notes" value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Any notes for your records…" />
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
          <Button type="submit" disabled={createInvoice.isPending} id="submit-create-invoice">
            {createInvoice.isPending ? "Creating…" : "Create Invoice"}
          </Button>
        </DialogFooter>
      </form>
    </DialogContent>
  );
}
