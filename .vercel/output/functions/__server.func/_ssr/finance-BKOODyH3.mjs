import { p as require_jsx_runtime } from "../_libs/@radix-ui/react-avatar+[...].mjs";
import { a as CardHeader, n as CardContent, o as CardTitle, r as CardDescription, t as Card } from "./card-CcQOx-bn.mjs";
import { i as useAuth } from "./auth-BCmnXUlU.mjs";
import { b as Percent, r as Wallet, st as ArrowDownUp } from "../_libs/lucide-react.mjs";
import { i as useTransactions, n as useInvoices, t as useCommissions } from "./use-finance-BysPG3CS.mjs";
import { n as format, t as subMonths } from "../_libs/date-fns.mjs";
import { a as XAxis, d as ResponsiveContainer, f as Tooltip, i as YAxis, o as Area, s as CartesianGrid, t as AreaChart } from "../_libs/recharts+[...].mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/finance-BKOODyH3.js
var import_jsx_runtime = require_jsx_runtime();
function FinanceComponent() {
	const { data: transactions = [], isLoading: txLoading } = useTransactions();
	const { data: invoices = [] } = useInvoices();
	const { data: commissions = [] } = useCommissions();
	const totalCollected = transactions.filter((t) => t.status === "completed" && t.type === "payment").reduce((acc, t) => acc + (Number(t.amount) || 0), 0);
	const outstandingArrears = invoices.filter((i) => i.status !== "paid" && i.status !== "void").reduce((acc, i) => acc + (Number(i.amount) || 0), 0);
	const { access } = useAuth();
	const isClient = access?.roles?.some((r) => r.slug === "client_landlord");
	const totalCommissions = commissions.reduce((acc, c) => acc + (Number(isClient ? c.owner_amount : c.agency_amount) || 0), 0);
	const chartData = Array.from({ length: 6 }).map((_, i) => format(subMonths(/* @__PURE__ */ new Date(), i), "MMM yyyy")).reverse().map((month) => {
		return {
			name: month,
			revenue: transactions.filter((t) => t.status === "completed" && t.type === "payment" && format(new Date(t.transaction_date), "MMM yyyy") === month).reduce((acc, t) => acc + (Number(t.amount) || 0), 0)
		};
	});
	if (txLoading) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "p-6",
		children: "Loading finance data..."
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex flex-col gap-6 p-6",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
				className: "text-2xl font-bold tracking-tight",
				children: "Finance Overview"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-muted-foreground",
				children: "Monitor revenue, outstanding arrears, and commissions."
			})] }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid gap-4 md:grid-cols-3",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardHeader, {
						className: "flex flex-row items-center justify-between space-y-0 pb-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardTitle, {
							className: "text-sm font-medium",
							children: "Total Collected"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Wallet, { className: "h-4 w-4 text-muted-foreground" })]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardContent, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "text-2xl font-bold",
						children: ["KSH ", totalCollected.toLocaleString(void 0, { minimumFractionDigits: 2 })]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-xs text-muted-foreground",
						children: "Total successful payments"
					})] })] }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardHeader, {
						className: "flex flex-row items-center justify-between space-y-0 pb-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardTitle, {
							className: "text-sm font-medium",
							children: "Outstanding Arrears"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowDownUp, { className: "h-4 w-4 text-muted-foreground" })]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardContent, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "text-2xl font-bold text-destructive",
						children: ["KSH ", outstandingArrears.toLocaleString(void 0, { minimumFractionDigits: 2 })]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-xs text-muted-foreground",
						children: "Unpaid invoices"
					})] })] }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardHeader, {
						className: "flex flex-row items-center justify-between space-y-0 pb-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardTitle, {
							className: "text-sm font-medium",
							children: "Commissions Earned"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Percent, { className: "h-4 w-4 text-muted-foreground" })]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardContent, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "text-2xl font-bold text-success",
						children: ["KSH ", totalCommissions.toLocaleString(void 0, { minimumFractionDigits: 2 })]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-xs text-muted-foreground",
						children: "Paid agency commissions"
					})] })] })
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
				className: "col-span-4",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardHeader, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardTitle, { children: "Revenue History" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardDescription, { children: "Payment collection over the last 6 months." })] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardContent, {
					className: "pl-2",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "h-[300px] w-full",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ResponsiveContainer, {
							width: "100%",
							height: "100%",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AreaChart, {
								data: chartData,
								margin: {
									top: 10,
									right: 30,
									left: 0,
									bottom: 0
								},
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("defs", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("linearGradient", {
										id: "colorRevenue",
										x1: "0",
										y1: "0",
										x2: "0",
										y2: "1",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("stop", {
											offset: "5%",
											stopColor: "var(--primary)",
											stopOpacity: .3
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("stop", {
											offset: "95%",
											stopColor: "var(--primary)",
											stopOpacity: 0
										})]
									}) }),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CartesianGrid, {
										strokeDasharray: "3 3",
										vertical: false,
										stroke: "var(--border)",
										opacity: .5
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(XAxis, {
										dataKey: "name",
										stroke: "var(--muted-foreground)",
										fontSize: 12,
										tickLine: false,
										axisLine: false
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(YAxis, {
										stroke: "var(--muted-foreground)",
										fontSize: 12,
										tickLine: false,
										axisLine: false,
										tickFormatter: (val) => `KSH ${val}`
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Tooltip, {
										contentStyle: {
											backgroundColor: "var(--card)",
											borderColor: "var(--border)",
											borderRadius: "8px"
										},
										itemStyle: { color: "var(--foreground)" },
										formatter: (value) => [`KSH ${value.toLocaleString()}`, "Revenue"]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Area, {
										type: "monotone",
										dataKey: "revenue",
										stroke: "var(--primary)",
										fillOpacity: 1,
										fill: "url(#colorRevenue)"
									})
								]
							})
						})
					})
				})]
			})
		]
	});
}
//#endregion
export { FinanceComponent as component };
