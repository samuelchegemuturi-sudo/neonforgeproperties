import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import type { Transaction, TenantInvoice, Commission, Disbursement } from "@/types/finance";
import { toast } from "sonner";
import { useServerFn } from "@tanstack/react-start";
import { sendEmailFn } from "@/lib/platform.functions";
export function useTransactions() {
  const { access } = useAuth();
  const companyId = access?.company?.id;

  return useQuery({
    queryKey: ["transactions", companyId],
    queryFn: async () => {
      if (!companyId) return [];
      const { data, error } = await supabase
        .from("transactions" as any)
        .select(`
          *,
          tenant:tenants(id, full_name, email),
          property:properties(id, name)
        `)
        .eq("company_id", companyId)
        .order("transaction_date", { ascending: false });

      if (error) throw error;
      return data as any[]; // casting to any to handle joined data for now
    },
    enabled: !!companyId,
  });
}

export function useInvoices() {
  const { access } = useAuth();
  const companyId = access?.company?.id;

  return useQuery({
    queryKey: ["invoices", companyId],
    queryFn: async () => {
      if (!companyId) return [];
      const { data, error } = await supabase
        .from("tenant_invoices" as any)
        .select(`
          *,
          tenant:tenants(id, full_name),
          property:properties(id, name)
        `)
        .eq("company_id", companyId)
        .order("due_date", { ascending: false });

      if (error) throw error;
      return data as any[];
    },
    enabled: !!companyId,
  });
}

export function useCommissions() {
  const { access } = useAuth();
  const companyId = access?.company?.id;

  return useQuery({
    queryKey: ["commissions", companyId],
    queryFn: async () => {
      if (!companyId) return [];
      const { data, error } = await supabase
        .from("commissions" as any)
        .select(`
          *,
          property:properties(id, name)
        `)
        .eq("company_id", companyId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as any[];
    },
    enabled: !!companyId,
  });
}

export function useRecordTransaction() {
  const queryClient = useQueryClient();
  const { access } = useAuth();
  const sendEmail = useServerFn(sendEmailFn);

  return useMutation({
    mutationFn: async ({ transaction, tenantInfo }: { transaction: Partial<Transaction>, tenantInfo?: { email: string, name: string } }) => {
      if (!access?.company?.id) throw new Error("No company selected");
      
      const { data, error } = await supabase
        .from("transactions" as any)
        .insert({
          ...transaction,
          company_id: access.company.id,
        })
        .select()
        .single();

      if (error) throw error;
      return { data, tenantInfo };
    },
    onSuccess: async ({ data, tenantInfo }) => {
      toast.success("Transaction recorded successfully");
      void queryClient.invalidateQueries({ queryKey: ["transactions"] });
      void queryClient.invalidateQueries({ queryKey: ["invoices"] });

      if (tenantInfo?.email && data.type === 'payment' && data.status === 'completed') {
        await sendEmail({
          data: {
            to: tenantInfo.email,
            subject: 'Payment Receipt - Neon Forge Properties',
            htmlContent: `
              <h1>Payment Receipt</h1>
              <p>Hello ${tenantInfo.name},</p>
              <p>We have successfully received your payment of <strong>KSH ${data.amount}</strong> on ${new Date(data.transaction_date).toLocaleDateString()}.</p>
              <p>Thank you for your payment!</p>
            `
          }
        });
      }
    },
    onError: (error) => {
      toast.error("Failed to record transaction: " + error.message);
    },
  });
}
