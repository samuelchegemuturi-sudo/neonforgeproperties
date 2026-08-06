import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

/**
 * MAKAO — DigiTax / KRA eTIMS Invoice Fiscalization Edge Function
 *
 * Flow:
 *  1. Receives { invoice_id } in POST body (authenticated via service-role or user JWT)
 *  2. Fetches invoice + related data from tenant_invoices
 *  3. Reads DigiTax config (API URL, API Key, Seller PIN) from platform_settings
 *  4. Builds the eTIMS-compatible payload and POSTs to DigiTax API
 *  5. On success: saves control_number, qr_code_url, fiscalized_at back to Supabase
 *  6. Returns the updated invoice record
 *
 * NOTE: Replace the DigiTax payload shape in buildDigiTaxPayload() with the
 * exact schema provided by your DigiTax / eTIMS integration partner once you
 * have their API documentation.
 */

console.log("DigiTax Invoice Fiscalization Function starting...");

export default {
  async fetch(req: Request): Promise<Response> {
    if (req.method !== "POST") {
      return json({ error: "Method not allowed" }, 405);
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    try {
      // ── 1. Parse request ──────────────────────────────────────────────────
      const body = await req.json();
      const { invoice_id } = body as { invoice_id?: string };
      if (!invoice_id) {
        return json({ error: "invoice_id is required" }, 400);
      }

      // ── 2. Fetch invoice from Supabase ────────────────────────────────────
      const { data: invoice, error: invError } = await supabase
        .from("tenant_invoices")
        .select(
          `*,
           tenants(full_name, email, phone),
           properties(name),
           units(unit_number),
           companies(name, email)`
        )
        .eq("id", invoice_id)
        .single();

      if (invError || !invoice) {
        return json({ error: "Invoice not found", detail: invError?.message }, 404);
      }

      if (invoice.digitax_status === "fiscalized") {
        return json({ error: "Invoice already fiscalized", invoice }, 409);
      }

      // ── 3. Fetch DigiTax config from platform_settings ───────────────────
      const { data: settings } = await supabase
        .from("platform_settings")
        .select("key, value")
        .in("key", ["digitax_api_url", "digitax_api_key", "digitax_seller_pin"]);

      const cfg = Object.fromEntries(
        (settings ?? []).map((s: { key: string; value: string }) => [
          s.key,
          // Values are stored as JSON strings e.g. `"sk_live_abc"` → strip outer quotes
          s.value?.replace(/^"|"$/g, "").trim(),
        ])
      );

      if (!cfg.digitax_api_url || cfg.digitax_api_url === "") {
        return json(
          { error: "DigiTax API URL not configured. Please set it in Platform Settings → Integrations." },
          503
        );
      }
      if (!cfg.digitax_api_key || cfg.digitax_api_key === "") {
        return json({ error: "DigiTax API Key not configured." }, 503);
      }

      // ── 4. Build eTIMS payload ────────────────────────────────────────────
      const payload = buildDigiTaxPayload(invoice, cfg);

      // Mark as submitted before the network call
      await supabase
        .from("tenant_invoices")
        .update({ digitax_status: "submitted" })
        .eq("id", invoice_id);

      // ── 5. Call DigiTax / eTIMS API ───────────────────────────────────────
      let fiscalData: DigiTaxResponse;
      try {
        const response = await fetch(`${cfg.digitax_api_url}/invoices/fiscalize`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "X-Api-Key": cfg.digitax_api_key,
            Accept: "application/json",
          },
          body: JSON.stringify(payload),
        });

        if (!response.ok) {
          const errText = await response.text();
          console.error("DigiTax API error:", response.status, errText);

          // Mark as failed
          await supabase
            .from("tenant_invoices")
            .update({ digitax_status: "failed" })
            .eq("id", invoice_id);

          return json(
            { error: "DigiTax API returned an error", detail: errText, status: response.status },
            502
          );
        }

        fiscalData = await response.json();
      } catch (networkError) {
        console.error("Network error calling DigiTax:", networkError);
        await supabase
          .from("tenant_invoices")
          .update({ digitax_status: "failed" })
          .eq("id", invoice_id);
        return json({ error: "Failed to reach DigiTax API", detail: String(networkError) }, 502);
      }

      // ── 6. Persist fiscalization result ───────────────────────────────────
      const { data: updated, error: updateError } = await supabase
        .from("tenant_invoices")
        .update({
          digitax_status: "fiscalized",
          digitax_control_number: fiscalData.control_number ?? fiscalData.cu_serial_number ?? null,
          digitax_qr_code_url: fiscalData.qr_code_url ?? fiscalData.verification_url ?? null,
          digitax_invoice_number: fiscalData.invoice_number ?? fiscalData.etims_invoice_no ?? null,
          digitax_fiscalized_at: new Date().toISOString(),
        })
        .eq("id", invoice_id)
        .select()
        .single();

      if (updateError) {
        console.error("Failed to save DigiTax result:", updateError);
        return json({ error: "Fiscalized but failed to save result", detail: updateError.message }, 500);
      }

      // ── 7. Audit log ──────────────────────────────────────────────────────
      await supabase.from("audit_logs").insert({
        company_id: invoice.company_id,
        action: "invoice.fiscalized",
        entity: "tenant_invoices",
        entity_id: invoice_id,
        metadata: {
          invoice_number: updated.invoice_number,
          control_number: updated.digitax_control_number,
        },
      });

      return json({ success: true, invoice: updated });
    } catch (err) {
      console.error("Unexpected error in digitax_invoice:", err);
      return json({ error: "Internal server error", detail: String(err) }, 500);
    }
  },
};

// ── Helpers ─────────────────────────────────────────────────────────────────

function json(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

/**
 * Build the fiscalization payload for DigiTax / KRA eTIMS.
 * Adapt field names to match the actual DigiTax API schema.
 *
 * Common eTIMS payload fields (TIMS / OSCU format):
 *  - invcNo     : Invoice number
 *  - trdInvcNo  : Trader invoice number
 *  - orgInvcNo  : Original invoice number (for credit notes)
 *  - regTyCd    : Registration type code (A = Automated)
 *  - invcTypCd  : Invoice type code (S = Sale)
 *  - taxblAmtA  : Taxable amount (VAT A class — standard 16%)
 *  - taxAmtA    : Tax amount
 *  - totAmt     : Total amount including tax
 *  - itemList   : Array of line items
 */
function buildDigiTaxPayload(invoice: Record<string, unknown>, cfg: Record<string, string>) {
  const lineItems = Array.isArray(invoice.line_items)
    ? invoice.line_items
    : [];

  const taxableAmount = Number(invoice.amount) / (1 + Number(invoice.tax_rate) / 100);
  const taxAmount = Number(invoice.amount) - taxableAmount;

  return {
    // ── Seller info (your company — from platform_settings) ──
    sellerPin: cfg.digitax_seller_pin ?? "",
    sellerName: (invoice.companies as Record<string, unknown>)?.name ?? "MAKAO Property",

    // ── Buyer info ──
    buyerPin: invoice.buyer_pin ?? "",
    buyerName: (invoice.tenants as Record<string, unknown>)?.full_name ?? "CASH SALE",
    buyerEmail: (invoice.tenants as Record<string, unknown>)?.email ?? "",

    // ── Invoice metadata ──
    invoiceNumber: invoice.invoice_number,
    invoiceDate: new Date().toISOString().split("T")[0],
    invoiceType: "SALE", // SALE | CREDIT_NOTE | DEBIT_NOTE
    currency: "KES",

    // ── Amounts ──
    taxRate: Number(invoice.tax_rate),
    taxableAmount: Number(taxableAmount.toFixed(2)),
    taxAmount: Number(taxAmount.toFixed(2)),
    totalAmount: Number(invoice.amount),

    // ── Line items ──
    items: lineItems.map((item: Record<string, unknown>, index: number) => ({
      lineNo: index + 1,
      description: item.description ?? "",
      quantity: Number(item.quantity ?? 1),
      unitPrice: Number(item.unit_price ?? 0),
      taxRate: Number(invoice.tax_rate),
      taxAmount: Number(((Number(item.unit_price ?? 0) * Number(item.quantity ?? 1) * Number(invoice.tax_rate)) / 100).toFixed(2)),
      totalAmount: Number((Number(item.unit_price ?? 0) * Number(item.quantity ?? 1)).toFixed(2)),
    })),

    // ── Property / reference ──
    description: String(invoice.description ?? "Rent Invoice"),
    referenceId: invoice.id,
  };
}

// ── DigiTax API response shape (adapt to actual API) ─────────────────────────
interface DigiTaxResponse {
  // Standard eTIMS / OSCU field names (adjust to actual DigiTax response)
  control_number?: string;
  cu_serial_number?: string;
  qr_code_url?: string;
  verification_url?: string;
  invoice_number?: string;
  etims_invoice_no?: string;
  status?: string;
  message?: string;
}
