import { o as __toESM } from "../_runtime.mjs";
import { t as supabase } from "./client-BNXqJcVa.mjs";
import { i as useQueryClient, n as useQuery, t as useMutation } from "../_libs/tanstack__react-query.mjs";
import { i as useAuth } from "./auth-BCmnXUlU.mjs";
import { f as sendEmailFn } from "./platform.functions-DdYyfv31.mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { t as useServerFn } from "./useServerFn-CrZF2pjq.mjs";
import { t as require_jspdf_node_min } from "../_libs/jspdf.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/use-finance-BUeqwFsG.js
var import_jspdf_node_min = /* @__PURE__ */ __toESM(require_jspdf_node_min());
function useTransactions() {
	const { access } = useAuth();
	const companyId = access?.company?.id;
	const isClient = access?.roles?.some((r) => r.slug === "client_landlord");
	const ownerId = access?.profile?.id;
	return useQuery({
		queryKey: [
			"transactions",
			companyId,
			isClient ? ownerId : "all"
		],
		queryFn: async () => {
			if (!companyId) return [];
			let q = supabase.from("transactions").select(`
          *,
          leases!inner(
            units!inner(
              properties!inner(id, name, owner_id)
            )
          )
        `).eq("company_id", companyId);
			if (isClient && ownerId) q = q.eq("leases.units.properties.owner_id", ownerId);
			const { data, error } = await q.order("transaction_date", { ascending: false });
			if (error) throw error;
			return data;
		},
		enabled: !!companyId
	});
}
function useInvoices() {
	const { access } = useAuth();
	const companyId = access?.company?.id;
	return useQuery({
		queryKey: ["invoices", companyId],
		queryFn: async () => {
			return [];
		},
		enabled: !!companyId
	});
}
function useCommissions() {
	const { access } = useAuth();
	const companyId = access?.company?.id;
	const isClient = access?.roles?.some((r) => r.slug === "client_landlord");
	const ownerId = access?.profile?.id;
	return useQuery({
		queryKey: [
			"commissions",
			companyId,
			isClient ? ownerId : "all"
		],
		queryFn: async () => {
			if (!companyId) return [];
			let q = supabase.from("commissions").select(`
          *
        `).eq("company_id", companyId);
			if (isClient && ownerId) q = q.eq("owner_id", ownerId);
			const { data, error } = await q.order("created_at", { ascending: false });
			if (error) throw error;
			return data;
		},
		enabled: !!companyId
	});
}
function useRecordTransaction() {
	const queryClient = useQueryClient();
	const { access } = useAuth();
	const sendEmail = useServerFn(sendEmailFn);
	return useMutation({
		mutationFn: async ({ transaction, tenantInfo }) => {
			if (!access?.company?.id) throw new Error("No company selected");
			const { data, error } = await supabase.from("transactions").insert({
				...transaction,
				company_id: access.company.id
			}).select().single();
			if (error) throw error;
			return {
				data,
				tenantInfo
			};
		},
		onSuccess: async ({ data, tenantInfo }) => {
			toast.success("Transaction recorded successfully");
			queryClient.invalidateQueries({ queryKey: ["transactions"] });
			queryClient.invalidateQueries({ queryKey: ["invoices"] });
			if (tenantInfo?.email && data.type === "payment" && data.status === "completed") {
				const tx = data;
				const doc = new import_jspdf_node_min.default();
				doc.setFontSize(22);
				doc.text("Payment Receipt", 20, 20);
				doc.setFontSize(12);
				doc.text(`Tenant Name: ${tenantInfo.name}`, 20, 40);
				doc.text(`Amount Paid: KSH ${tx.amount}`, 20, 50);
				doc.text(`Transaction Date: ${new Date(tx.transaction_date).toLocaleDateString()}`, 20, 60);
				doc.text(`Description: ${tx.description || "Payment"}`, 20, 70);
				doc.setFontSize(10);
				doc.text("Thank you for your business!", 20, 90);
				const pdfBase64 = doc.output("datauristring").split(",")[1];
				await sendEmail({ data: {
					to: tenantInfo.email,
					subject: "Payment Receipt - Neon Forge Properties",
					htmlContent: `
              <h1>Payment Receipt</h1>
              <p>Hello ${tenantInfo.name},</p>
              <p>We have successfully received your payment of <strong>KSH ${tx.amount}</strong> on ${new Date(tx.transaction_date).toLocaleDateString()}.</p>
              <p>Please find your detailed receipt attached to this email.</p>
              <br/>
              <p>Thank you for your payment!</p>
            `,
					attachments: [{
						name: "receipt.pdf",
						content: pdfBase64
					}]
				} });
			}
		},
		onError: (error) => {
			toast.error("Failed to record transaction: " + error.message);
		}
	});
}
//#endregion
export { useTransactions as i, useInvoices as n, useRecordTransaction as r, useCommissions as t };
