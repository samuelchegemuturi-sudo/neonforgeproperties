import { p as require_jsx_runtime } from "../_libs/@radix-ui/react-avatar+[...].mjs";
import { a as CardHeader, n as CardContent, o as CardTitle, r as CardDescription, t as Card } from "./card-CcQOx-bn.mjs";
import { t as supabase } from "./client-BNXqJcVa.mjs";
import { n as useQuery } from "../_libs/tanstack__react-query.mjs";
import { n as useAuth } from "./auth-D3Dl5b08.mjs";
import { t as Badge } from "./badge-D1Dupn2y.mjs";
import { t as Skeleton } from "./skeleton-D9W9wFsj.mjs";
import { a as statusTone, n as companyTypeLabel, o as titleCase, r as money } from "./platform-Df7WJh8D.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/subscriptions-CZ1LziJR.js
var import_jsx_runtime = require_jsx_runtime();
function SubscriptionsPage() {
	const { access } = useAuth();
	const isSuper = access?.profile?.is_super_admin ?? false;
	const { data: companies, isLoading } = useQuery({
		queryKey: ["subscription-companies"],
		queryFn: async () => {
			const { data, error } = await supabase.from("companies").select("id, name, company_type, activation_status, auto_disbursement, currency").order("name");
			if (error) throw error;
			return data;
		}
	});
	const { data: quotes } = useQuery({
		queryKey: ["subscription-quotes", companies?.map((c) => c.id).join(",")],
		enabled: Boolean(companies?.length),
		queryFn: async () => {
			const entries = await Promise.all(companies.map(async (c) => {
				const { data } = await supabase.rpc("calculate_subscription", {
					_company_id: c.id,
					_paid_only: c.auto_disbursement
				});
				return [c.id, data];
			}));
			return Object.fromEntries(entries);
		}
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "mx-auto max-w-5xl space-y-6",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
			className: "text-2xl font-semibold tracking-tight",
			children: "Subscriptions"
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
			className: "mt-1 text-sm text-muted-foreground",
			children: [
				isSuper ? "Recalculated every cycle from live unit counts." : "Your monthly platform charge, recalculated from your live unit counts.",
				" ",
				"With automatic disbursement on, only occupied units that paid rent are billed."
			]
		})] }), isLoading ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "h-48 w-full" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "space-y-4",
			children: (companies ?? []).map((c) => {
				const quote = quotes?.[c.id];
				return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardHeader, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex flex-wrap items-start justify-between gap-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardTitle, {
						className: "text-base",
						children: c.name
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardDescription, { children: [
						companyTypeLabel(c.company_type),
						" ·",
						" ",
						c.auto_disbursement ? "Automatic disbursement on" : "Manual settlement"
					] })] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "text-right",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-xl font-semibold",
							children: money(quote?.total ?? 0, c.currency)
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "text-xs text-muted-foreground",
							children: [
								quote?.units ?? 0,
								" billable units ·",
								" ",
								titleCase(quote?.basis ?? "registered_units")
							]
						})]
					})]
				}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardContent, {
					className: "space-y-1.5",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
						variant: statusTone(c.activation_status),
						children: titleCase(c.activation_status)
					}), quote?.breakdown?.length ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "pt-2 text-sm",
						children: quote.breakdown.map((b) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex justify-between border-b border-border py-1 last:border-0",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
								className: "text-muted-foreground",
								children: [
									b.qty,
									" × ",
									b.label,
									" @ ",
									money(b.price, c.currency)
								]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: money(b.subtotal, c.currency) })]
						}, b.slug))
					}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "pt-2 text-sm text-muted-foreground",
						children: "No billable units this cycle."
					})]
				})] }, c.id);
			})
		})]
	});
}
//#endregion
export { SubscriptionsPage as component };
