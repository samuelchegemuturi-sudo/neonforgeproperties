import { p as require_jsx_runtime } from "../_libs/@radix-ui/react-avatar+[...].mjs";
import { a as CardHeader, n as CardContent, o as CardTitle, r as CardDescription, t as Card } from "./card-CcQOx-bn.mjs";
import { t as supabase } from "./client-BNXqJcVa.mjs";
import { i as useQueryClient, n as useQuery, t as useMutation } from "../_libs/tanstack__react-query.mjs";
import { i as useAuth } from "./auth-BCmnXUlU.mjs";
import { t as Button } from "./button-Bq5vK6RO.mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { M as KeyRound } from "../_libs/lucide-react.mjs";
import { t as Badge } from "./badge-D1Dupn2y.mjs";
import { t as Skeleton } from "./skeleton-D9W9wFsj.mjs";
import { a as statusTone, i as shortDate, o as titleCase, r as money } from "./platform-Df7WJh8D.mjs";
import { a as TableHeader, i as TableHead, n as TableBody, o as TableRow, r as TableCell, t as Table } from "./table-C0WYWEQX.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/licences-IBi5f1eI.js
var import_jsx_runtime = require_jsx_runtime();
function LicencesPage() {
	const { can } = useAuth();
	const queryClient = useQueryClient();
	const { data: licences, isLoading } = useQuery({
		queryKey: ["licences"],
		queryFn: async () => {
			const { data, error } = await supabase.from("licences").select("id, code, status, activation_fee, issued_at, company_id, companies(name, company_type)").order("issued_at", { ascending: false });
			if (error) throw error;
			return data;
		}
	});
	const { data: unlicensed } = useQuery({
		queryKey: ["companies-unlicensed"],
		queryFn: async () => {
			const { data, error } = await supabase.from("companies").select("id, name, activation_status, licences(id)").order("created_at", { ascending: false });
			if (error) throw error;
			return data.filter((c) => !c.licences || (Array.isArray(c.licences) ? c.licences.length === 0 : false));
		}
	});
	const issue = useMutation({
		mutationFn: async (companyId) => {
			const { data, error } = await supabase.rpc("generate_licence", { _company_id: companyId });
			if (error) throw error;
			return data;
		},
		onSuccess: (code) => {
			queryClient.invalidateQueries();
			toast.success(`Licence issued: ${code}`);
		},
		onError: (error) => toast.error(error.message)
	});
	const revoke = useMutation({
		mutationFn: async ({ id, company_id, status }) => {
			if (status === "revoked") {
				const { error } = await supabase.from("licences").delete().eq("id", id);
				if (error) throw error;
			} else {
				const { error } = await supabase.from("licences").update({ status }).eq("id", id);
				if (error) throw error;
			}
			const { error: companyError } = await supabase.from("companies").update({ activation_status: status === "active" ? "active" : "pending_activation" }).eq("id", company_id);
			if (companyError) throw companyError;
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["licences"] });
			toast.success("Licence updated");
		},
		onError: (error) => toast.error(error.message)
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "mx-auto max-w-6xl space-y-6",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
				className: "text-2xl font-semibold tracking-tight",
				children: "Licence management"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-1 text-sm text-muted-foreground",
				children: "One permanent licence per company, issued after the one-time activation fee."
			})] }),
			can("licence.generate") && (unlicensed?.length ?? 0) > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardHeader, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardTitle, {
				className: "text-base",
				children: "Awaiting licence"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardDescription, { children: "These companies have no licence yet, so their dashboards stay locked." })] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardContent, {
				className: "flex flex-wrap gap-2",
				children: unlicensed.map((c) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
					size: "sm",
					variant: "outline",
					disabled: issue.isPending,
					onClick: () => issue.mutate(c.id),
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(KeyRound, { className: "size-4" }),
						" ",
						c.name
					]
				}, c.id))
			})] }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardHeader, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardTitle, {
				className: "text-base",
				children: "Issued licences"
			}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardContent, {
				className: "px-0",
				children: isLoading ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "space-y-2 px-6",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "h-10 w-full" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "h-10 w-full" })]
				}) : !licences?.length ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "px-6 py-12 text-center text-sm text-muted-foreground",
					children: "No licences issued yet."
				}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "overflow-x-auto",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Table, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHeader, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TableRow, { children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, { children: "Licence code" }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, { children: "Company" }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, { children: "Activation fee" }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, { children: "Issued" }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, { children: "Status" }),
						can("licence.revoke") && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, {
							className: "text-right",
							children: "Actions"
						})
					] }) }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableBody, { children: licences.map((l) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TableRow, { children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
							className: "font-mono text-sm",
							children: l.code
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, { children: l.companies?.name ?? "—" }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, { children: money(l.activation_fee) }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
							className: "text-sm text-muted-foreground",
							children: shortDate(l.issued_at)
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
							variant: statusTone(l.status),
							children: titleCase(l.status)
						}) }),
						can("licence.revoke") && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
							className: "text-right",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								size: "sm",
								variant: "ghost",
								onClick: () => revoke.mutate({
									id: l.id,
									company_id: l.company_id,
									status: l.status === "active" ? "revoked" : "active"
								}),
								children: l.status === "active" ? "Revoke" : "Restore"
							})
						})
					] }, l.id)) })] })
				})
			})] })
		]
	});
}
//#endregion
export { LicencesPage as component };
