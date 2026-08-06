import { createFileRoute } from "@tanstack/react-router";
import { useTenantInvoice } from "@/hooks/use-invoices";
import { Loader2, Printer, ArrowLeft, CheckCircle2, Zap, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { useAuth } from "@/lib/auth";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/_authenticated/invoices_/$invoiceId/print")({
  component: InvoicePrintPage,
});

function InvoicePrintPage() {
  const { invoiceId } = Route.useParams();
  const { data: invoice, isLoading } = useTenantInvoice(invoiceId);
  const { access } = useAuth();

  // Fetch seller KRA PIN from platform settings
  const { data: sellerPin } = useQuery({
    queryKey: ["platform-setting", "digitax_seller_pin"],
    queryFn: async () => {
      const { data } = await supabase
        .from("platform_settings" as any)
        .select("value")
        .eq("key", "digitax_seller_pin")
        .maybeSingle();
      return (data as any)?.value?.replace(/^"|"$/g, "") ?? "";
    },
  });

  if (isLoading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <Loader2 className="size-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!invoice) {
    return (
      <div className="p-8 text-center text-muted-foreground">Invoice not found.</div>
    );
  }

  const tenant = invoice.tenants as any;
  const company = (invoice as any).companies as any;
  const property = invoice.properties as any;
  const unit = invoice.units as any;
  const lineItems = Array.isArray(invoice.line_items) ? invoice.line_items : [];
  const isFiscalized = invoice.digitax_status === "fiscalized";
  const subtotal = lineItems.reduce(
    (s: number, i: any) => s + Number(i.quantity ?? 1) * Number(i.unit_price ?? 0),
    0
  );
  const taxAmount = invoice.tax_amount ?? subtotal * (Number(invoice.tax_rate) / 100);
  const total = Number(invoice.amount);

  return (
    <>
      {/* Screen-only controls */}
      <div className="print:hidden flex items-center justify-between p-4 border-b mb-6">
        <Button variant="ghost" onClick={() => history.back()} className="gap-2">
          <ArrowLeft className="size-4" /> Back to Invoices
        </Button>
        <div className="flex items-center gap-2">
          {isFiscalized ? (
            <span className="flex items-center gap-1 text-sm text-green-600 font-medium">
              <CheckCircle2 className="size-4" /> eTIMS Fiscalized
            </span>
          ) : (
            <span className="flex items-center gap-1 text-sm text-amber-500 font-medium">
              <AlertCircle className="size-4" /> Not yet fiscalized
            </span>
          )}
          <Button onClick={() => window.print()} className="gap-2" id="print-invoice-btn">
            <Printer className="size-4" /> Print / Save PDF
          </Button>
        </div>
      </div>

      {/* ── Printable Document ───────────────────────────────────────────────── */}
      <div
        id="invoice-print-area"
        className="mx-auto max-w-3xl bg-white text-gray-900 p-10 print:p-0 print:max-w-none print:m-0 print:shadow-none shadow-xl rounded-2xl print:rounded-none"
      >
        {/* ── Header ── */}
        <div className="flex items-start justify-between pb-6 border-b-2 border-gray-900">
          <div>
            {/* Platform branding */}
            <div className="flex items-center gap-2 mb-1">
              <div className="size-8 rounded-md bg-indigo-600 flex items-center justify-center">
                <span className="text-white font-black text-sm">M</span>
              </div>
              <span className="font-black text-xl tracking-tight text-indigo-700">MAKAO</span>
            </div>
            {/* Company (issuer) */}
            <h2 className="text-lg font-bold mt-2">{company?.name ?? access?.company?.name ?? "Property Management"}</h2>
            {company?.email && <p className="text-sm text-gray-500">{company.email}</p>}
            {company?.phone && <p className="text-sm text-gray-500">{company.phone}</p>}
            {sellerPin && (
              <p className="text-sm font-medium mt-1">KRA PIN: <span className="font-mono">{sellerPin}</span></p>
            )}
          </div>
          <div className="text-right">
            <div className="inline-block">
              {isFiscalized ? (
                <div className="border-2 border-green-600 rounded-lg px-4 py-2 text-center">
                  <p className="text-xs font-bold text-green-700 uppercase tracking-widest">FISCALIZED</p>
                  <p className="text-xs text-green-700">KRA eTIMS Tax Invoice</p>
                </div>
              ) : (
                <div className="border-2 border-amber-400 rounded-lg px-4 py-2 text-center">
                  <p className="text-xs font-bold text-amber-600 uppercase tracking-widest">DRAFT</p>
                  <p className="text-xs text-amber-600">Pending Fiscalization</p>
                </div>
              )}
            </div>
            <p className="text-2xl font-bold mt-3">TAX INVOICE</p>
            <p className="font-mono text-sm mt-1 text-gray-600">
              {invoice.invoice_number ?? `INV-${invoiceId.slice(0, 8).toUpperCase()}`}
            </p>
            <p className="text-sm text-gray-500 mt-1">
              Date: {format(new Date(invoice.created_at), "dd MMMM yyyy")}
            </p>
            <p className="text-sm text-gray-500">
              Due: {format(new Date(invoice.due_date), "dd MMMM yyyy")}
            </p>
          </div>
        </div>

        {/* ── Buyer / Property Info ── */}
        <div className="grid grid-cols-2 gap-8 py-6 border-b">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-2">Bill To</p>
            <p className="font-semibold text-base">{tenant?.full_name ?? "—"}</p>
            {tenant?.email && <p className="text-sm text-gray-600">{tenant.email}</p>}
            {tenant?.phone && <p className="text-sm text-gray-600">{tenant.phone}</p>}
            {invoice.buyer_pin && (
              <p className="text-sm font-medium mt-1">
                KRA PIN: <span className="font-mono">{invoice.buyer_pin}</span>
              </p>
            )}
          </div>
          <div className="text-right">
            <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-2">Property</p>
            <p className="font-semibold text-base">{property?.name ?? "—"}</p>
            {unit?.unit_number && (
              <p className="text-sm text-gray-600">Unit {unit.unit_number}</p>
            )}
          </div>
        </div>

        {/* ── Line Items ── */}
        <div className="py-6">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-300 text-gray-500">
                <th className="pb-2 text-left font-semibold">#</th>
                <th className="pb-2 text-left font-semibold">Description</th>
                <th className="pb-2 text-center font-semibold">Qty</th>
                <th className="pb-2 text-right font-semibold">Unit Price</th>
                <th className="pb-2 text-right font-semibold">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {lineItems.length > 0 ? (
                lineItems.map((item: any, idx: number) => (
                  <tr key={idx}>
                    <td className="py-2 text-gray-400">{idx + 1}</td>
                    <td className="py-2 font-medium">{item.description}</td>
                    <td className="py-2 text-center">{item.quantity}</td>
                    <td className="py-2 text-right">
                      KES {Number(item.unit_price).toLocaleString("en-KE", { minimumFractionDigits: 2 })}
                    </td>
                    <td className="py-2 text-right font-medium">
                      KES {(Number(item.quantity) * Number(item.unit_price)).toLocaleString("en-KE", { minimumFractionDigits: 2 })}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="py-3">
                    <p className="font-medium">{invoice.description}</p>
                  </td>
                </tr>
              )}
            </tbody>
            <tfoot className="border-t-2 border-gray-900">
              <tr>
                <td colSpan={4} className="pt-3 text-right text-gray-500">Subtotal</td>
                <td className="pt-3 text-right font-medium">
                  KES {subtotal.toLocaleString("en-KE", { minimumFractionDigits: 2 })}
                </td>
              </tr>
              <tr>
                <td colSpan={4} className="py-1 text-right text-gray-500">
                  VAT ({invoice.tax_rate ?? 16}%)
                </td>
                <td className="py-1 text-right font-medium">
                  KES {Number(taxAmount).toLocaleString("en-KE", { minimumFractionDigits: 2 })}
                </td>
              </tr>
              <tr className="text-base font-bold">
                <td colSpan={4} className="pb-3 text-right">Total Amount Due</td>
                <td className="pb-3 text-right text-indigo-700">
                  KES {total.toLocaleString("en-KE", { minimumFractionDigits: 2 })}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>

        {/* ── Payment Status ── */}
        {invoice.status === "paid" && (
          <div className="mb-6 rounded-lg border-2 border-green-500 bg-green-50 p-3 text-center">
            <p className="font-bold text-green-700 uppercase tracking-widest text-sm">PAID</p>
            {invoice.payment_reference && (
              <p className="text-xs text-green-600 mt-0.5">
                Ref: <span className="font-mono font-medium">{invoice.payment_reference}</span>
              </p>
            )}
            {invoice.paid_at && (
              <p className="text-xs text-green-600">
                {format(new Date(invoice.paid_at), "dd MMM yyyy HH:mm")}
              </p>
            )}
          </div>
        )}

        {/* ── eTIMS / DigiTax Compliance Block ── */}
        <div className="border-t-2 border-gray-900 pt-6 mt-2">
          {isFiscalized ? (
            <div className="flex items-start gap-6">
              {/* QR Code */}
              {invoice.digitax_qr_code_url ? (
                <div className="flex-shrink-0 text-center">
                  <img
                    src={invoice.digitax_qr_code_url}
                    alt="KRA eTIMS Verification QR Code"
                    className="size-28 border border-gray-300 rounded"
                    id="etims-qr-code"
                  />
                  <p className="text-[9px] text-gray-400 mt-1 max-w-[7rem] text-center leading-tight">
                    Scan to verify on KRA eTIMS portal
                  </p>
                </div>
              ) : (
                <div className="size-28 border-2 border-dashed border-gray-300 rounded flex items-center justify-center">
                  <p className="text-[9px] text-gray-400 text-center px-1">QR Code</p>
                </div>
              )}
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-3">
                  <div className="size-5 rounded bg-green-600 flex items-center justify-center">
                    <CheckCircle2 className="size-3 text-white" />
                  </div>
                  <span className="text-xs font-bold uppercase tracking-widest text-green-700">
                    KRA eTIMS Fiscalized Tax Invoice
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-x-6 gap-y-1 text-xs">
                  <div>
                    <p className="text-gray-400 font-semibold uppercase text-[10px]">Control Number</p>
                    <p className="font-mono font-bold text-gray-900" id="etims-control-number">
                      {invoice.digitax_control_number ?? "—"}
                    </p>
                  </div>
                  {invoice.digitax_invoice_number && (
                    <div>
                      <p className="text-gray-400 font-semibold uppercase text-[10px]">eTIMS Invoice No.</p>
                      <p className="font-mono font-bold text-gray-900">{invoice.digitax_invoice_number}</p>
                    </div>
                  )}
                  {invoice.digitax_fiscalized_at && (
                    <div>
                      <p className="text-gray-400 font-semibold uppercase text-[10px]">Fiscalized At</p>
                      <p className="font-mono text-gray-700">
                        {format(new Date(invoice.digitax_fiscalized_at), "dd MMM yyyy HH:mm")}
                      </p>
                    </div>
                  )}
                  {sellerPin && (
                    <div>
                      <p className="text-gray-400 font-semibold uppercase text-[10px]">Seller KRA PIN</p>
                      <p className="font-mono text-gray-700">{sellerPin}</p>
                    </div>
                  )}
                </div>
                <p className="text-[9px] text-gray-400 mt-3 leading-tight">
                  This is a fiscalized tax invoice generated in compliance with the Kenya Revenue Authority 
                  eTIMS requirements. Verify authenticity at itax.kra.go.ke using the control number above.
                </p>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-3 rounded-lg border border-amber-300 bg-amber-50 p-4">
              <AlertCircle className="size-5 text-amber-500 flex-shrink-0" />
              <div>
                <p className="text-sm font-semibold text-amber-700">Not Yet Fiscalized</p>
                <p className="text-xs text-amber-600 mt-0.5">
                  This invoice has not been submitted to KRA eTIMS. Click "Fiscalize" on the invoices 
                  page to generate the control number and QR code before printing the final version.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* ── Footer ── */}
        <div className="mt-6 pt-4 border-t text-center text-[10px] text-gray-400">
          <p>
            Generated by <strong className="text-indigo-600">MAKAO</strong> — Neon Forge Creation · 
            admin@neonforgecreation.co.ke
          </p>
          <p className="mt-0.5">
            This document was generated electronically and is valid without a signature.
          </p>
        </div>
      </div>

      {/* Print-only styles */}
      <style>{`
        @media print {
          body { margin: 0; }
          .print\\:hidden { display: none !important; }
          #invoice-print-area { 
            box-shadow: none; 
            border-radius: 0;
            margin: 0;
            padding: 20mm;
          }
        }
      `}</style>
    </>
  );
}
