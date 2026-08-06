import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { toast } from "sonner";

export type InvoiceLineItem = {
  description: string;
  quantity: number;
  unit_price: number;
};

export type TenantInvoiceFull = {
  id: string;
  company_id: string;
  property_id: string | null;
  unit_id: string | null;
  lease_id: string | null;
  tenant_id: string | null;
  invoice_number: string | null;
  amount: number;
  tax_rate: number;
  tax_amount: number | null;
  description: string;
  notes: string | null;
  due_date: string;
  status: "unpaid" | "partial" | "paid" | "void";
  buyer_pin: string | null;
  line_items: InvoiceLineItem[];
  payment_reference: string | null;
  paid_at: string | null;
  digitax_control_number: string | null;
  digitax_qr_code_url: string | null;
  digitax_invoice_number: string | null;
  digitax_fiscalized_at: string | null;
  digitax_status: "pending" | "submitted" | "fiscalized" | "failed";
  created_at: string;
  updated_at: string;
  // Joined
  tenants?: { full_name: string; email: string; phone: string | null } | null;
  properties?: { name: string } | null;
  units?: { unit_number: string } | null;
};

/** List all invoices for the current company */
export function useTenantInvoices() {
  const { access } = useAuth();
  const companyId = access?.company?.id;

  return useQuery({
    queryKey: ["tenant-invoices", companyId],
    queryFn: async () => {
      if (!companyId) return [] as TenantInvoiceFull[];
      const { data, error } = await supabase
        .from("tenant_invoices" as any)
        .select(`
          *,
          tenants(full_name, email, phone),
          properties(name),
          units(unit_number)
        `)
        .eq("company_id", companyId)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as TenantInvoiceFull[];
    },
    enabled: !!companyId,
  });
}

/** Fetch a single invoice by ID (for the print view) */
export function useTenantInvoice(invoiceId: string | undefined) {
  return useQuery({
    queryKey: ["tenant-invoice", invoiceId],
    queryFn: async () => {
      if (!invoiceId) return null;
      const { data, error } = await supabase
        .from("tenant_invoices" as any)
        .select(`
          *,
          tenants(full_name, email, phone),
          properties(name),
          units(unit_number),
          companies(name, email, phone)
        `)
        .eq("id", invoiceId)
        .single();
      if (error) throw error;
      return data as TenantInvoiceFull & { companies?: { name: string; email: string; phone?: string } | null };
    },
    enabled: !!invoiceId,
  });
}

export type CreateInvoiceInput = {
  property_id?: string | null;
  unit_id?: string | null;
  lease_id?: string | null;
  tenant_id?: string | null;
  description: string;
  due_date: string;
  tax_rate?: number;
  buyer_pin?: string;
  notes?: string;
  line_items: InvoiceLineItem[];
};

/** Create a new rent invoice */
export function useCreateTenantInvoice() {
  const queryClient = useQueryClient();
  const { access } = useAuth();

  return useMutation({
    mutationFn: async (input: CreateInvoiceInput) => {
      if (!access?.company?.id) throw new Error("No company selected");

      const taxRate = input.tax_rate ?? 16;
      const subtotal = input.line_items.reduce(
        (acc, item) => acc + item.quantity * item.unit_price,
        0
      );
      const taxAmount = subtotal * (taxRate / 100);
      const total = subtotal + taxAmount;

      const { data, error } = await supabase
        .from("tenant_invoices" as any)
        .insert({
          company_id: access.company.id,
          property_id: input.property_id ?? null,
          unit_id: input.unit_id ?? null,
          lease_id: input.lease_id ?? null,
          tenant_id: input.tenant_id ?? null,
          description: input.description,
          due_date: input.due_date,
          tax_rate: taxRate,
          tax_amount: Number(taxAmount.toFixed(2)),
          amount: Number(total.toFixed(2)),
          buyer_pin: input.buyer_pin ?? null,
          notes: input.notes ?? null,
          line_items: input.line_items,
          digitax_status: "pending",
          status: "unpaid",
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast.success("Invoice created successfully");
      void queryClient.invalidateQueries({ queryKey: ["tenant-invoices"] });
    },
    onError: (err: Error) => toast.error("Failed to create invoice: " + err.message),
  });
}

/** Trigger DigiTax fiscalization for an invoice */
export function useFiscalizeInvoice() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (invoiceId: string) => {
      const { data, error } = await supabase.functions.invoke("digitax_invoice", {
        body: { invoice_id: invoiceId },
      });
      if (error) throw new Error(error.message);
      if (data?.error) throw new Error(data.error);
      return data;
    },
    onSuccess: (data) => {
      const controlNo = data?.invoice?.digitax_control_number;
      toast.success(
        controlNo
          ? `Invoice fiscalized ✓ Control: ${controlNo}`
          : "Invoice submitted to DigiTax"
      );
      void queryClient.invalidateQueries({ queryKey: ["tenant-invoices"] });
      void queryClient.invalidateQueries({ queryKey: ["tenant-invoice"] });
    },
    onError: (err: Error) => toast.error("DigiTax error: " + err.message),
  });
}

/** Log a manual payment (M-Pesa / bank reference) and mark invoice paid */
export function useLogInvoicePayment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      invoiceId,
      reference,
    }: {
      invoiceId: string;
      reference: string;
    }) => {
      const { error } = await supabase
        .from("tenant_invoices" as any)
        .update({
          status: "paid",
          payment_reference: reference,
          paid_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq("id", invoiceId);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Payment logged — invoice marked as paid");
      void queryClient.invalidateQueries({ queryKey: ["tenant-invoices"] });
      void queryClient.invalidateQueries({ queryKey: ["tenant-invoice"] });
    },
    onError: (err: Error) => toast.error("Failed to log payment: " + err.message),
  });
}

/** Void an invoice */
export function useVoidInvoice() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (invoiceId: string) => {
      const { error } = await supabase
        .from("tenant_invoices" as any)
        .update({ status: "void", updated_at: new Date().toISOString() })
        .eq("id", invoiceId);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Invoice voided");
      void queryClient.invalidateQueries({ queryKey: ["tenant-invoices"] });
    },
    onError: (err: Error) => toast.error("Failed to void invoice: " + err.message),
  });
}
