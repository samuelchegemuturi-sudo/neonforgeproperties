import { o as __toESM } from "../_runtime.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { p as require_jsx_runtime } from "../_libs/@radix-ui/react-avatar+[...].mjs";
import { a as CardHeader, n as CardContent, o as CardTitle, r as CardDescription, t as Card } from "./card-CcQOx-bn.mjs";
import { t as supabase } from "./client-BNXqJcVa.mjs";
import { n as useQuery } from "../_libs/tanstack__react-query.mjs";
import { i as useAuth } from "./auth-BCmnXUlU.mjs";
import { L as DollarSign, ot as Activity, tt as ArrowUpRight, z as CreditCard } from "../_libs/lucide-react.mjs";
import { t as Badge } from "./badge-D1Dupn2y.mjs";
import { a as TableHeader, i as TableHead, n as TableBody, o as TableRow, r as TableCell, t as Table } from "./table-C0WYWEQX.mjs";
import { a as XAxis, c as Bar, d as ResponsiveContainer, f as Tooltip, i as YAxis, r as BarChart, s as CartesianGrid } from "../_libs/recharts+[...].mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/reports-B-Hu_kHy.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function ReportsComponent() {
	const { access } = useAuth();
	const companyId = access?.profile?.company_id ?? null;
	const isSuper = access?.profile?.is_super_admin;
	const queryEnabled = Boolean(companyId) || Boolean(isSuper);
	const { data: transactions, isLoading } = useQuery({
		queryKey: [
			"transactions",
			companyId,
			isSuper
		],
		enabled: queryEnabled,
		queryFn: async () => {
			let query = supabase.from("transactions").select(`
          id, amount, type, status, payment_method, description, transaction_date,
          tenants (
            profiles (full_name)
          )
        `).order("transaction_date", { ascending: false });
			if (companyId) query = query.eq("company_id", companyId);
			else if (!isSuper) return [];
			const { data, error } = await query;
			if (error) throw error;
			return data;
		}
	});
	const { totalRevenue, chartData } = (0, import_react.useMemo)(() => {
		if (!transactions) return {
			totalRevenue: 0,
			chartData: []
		};
		let total = 0;
		const monthlyData = {};
		transactions?.forEach((t) => {
			if (t.status === "completed" && t.type === "rent_payment") {
				const amount = Number(t.amount) || 0;
				total += amount;
				const monthYear = new Date(t.transaction_date).toLocaleString("default", {
					month: "short",
					year: "numeric"
				});
				monthlyData[monthYear] = (monthlyData[monthYear] || 0) + amount;
			}
		});
		const chart = [];
		for (let i = 5; i >= 0; i--) {
			const d = /* @__PURE__ */ new Date();
			d.setMonth(d.getMonth() - i);
			const monthYear = d.toLocaleString("default", {
				month: "short",
				year: "numeric"
			});
			chart.push({
				name: monthYear,
				revenue: monthlyData[monthYear] || 0
			});
		}
		return {
			totalRevenue: total,
			chartData: chart
		};
	}, [transactions]);
	if (!queryEnabled) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "p-6",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Card, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardHeader, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardTitle, { children: "Revenue Reports" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardDescription, { children: "You must belong to a company to view revenue reports." })] }) })
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "p-6 space-y-6 flex flex-col h-full",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
				className: "text-2xl font-bold tracking-tight",
				children: "Revenue Reports"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-muted-foreground",
				children: "Monitor your financial performance and transactions."
			})] }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid gap-4 md:grid-cols-2 lg:grid-cols-4",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardHeader, {
						className: "flex flex-row items-center justify-between space-y-0 pb-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardTitle, {
							className: "text-sm font-medium",
							children: "Total Revenue"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DollarSign, { className: "h-4 w-4 text-muted-foreground" })]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardContent, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "text-2xl font-bold",
						children: ["$", totalRevenue.toLocaleString(void 0, {
							minimumFractionDigits: 2,
							maximumFractionDigits: 2
						})]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-xs text-muted-foreground",
						children: "All time completed rent payments"
					})] })] }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardHeader, {
						className: "flex flex-row items-center justify-between space-y-0 pb-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardTitle, {
							className: "text-sm font-medium",
							children: "Monthly Target"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Activity, { className: "h-4 w-4 text-muted-foreground" })]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardContent, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "text-2xl font-bold",
						children: chartData.length > 0 ? `$${chartData[chartData.length - 1].revenue.toLocaleString()}` : "$0"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-xs text-muted-foreground",
						children: "Collected this month"
					})] })] }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardHeader, {
						className: "flex flex-row items-center justify-between space-y-0 pb-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardTitle, {
							className: "text-sm font-medium",
							children: "Growth"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowUpRight, { className: "h-4 w-4 text-green-500" })]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardContent, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "text-2xl font-bold",
						children: "+12.5%"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-xs text-muted-foreground",
						children: "From previous month"
					})] })] }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardHeader, {
						className: "flex flex-row items-center justify-between space-y-0 pb-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardTitle, {
							className: "text-sm font-medium",
							children: "Transactions"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CreditCard, { className: "h-4 w-4 text-muted-foreground" })]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardContent, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "text-2xl font-bold",
						children: transactions?.length || 0
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-xs text-muted-foreground",
						children: "Total records found"
					})] })] })
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid gap-4 md:grid-cols-2 lg:grid-cols-7",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
					className: "col-span-4",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardHeader, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardTitle, { children: "Revenue Over Time" }) }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardContent, {
						className: "pl-2",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "h-[300px] w-full",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ResponsiveContainer, {
								width: "100%",
								height: "100%",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(BarChart, {
									data: chartData,
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CartesianGrid, {
											strokeDasharray: "3 3",
											vertical: false
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(XAxis, {
											dataKey: "name",
											stroke: "#888888",
											fontSize: 12,
											tickLine: false,
											axisLine: false
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(YAxis, {
											stroke: "#888888",
											fontSize: 12,
											tickLine: false,
											axisLine: false,
											tickFormatter: (value) => `$${value}`
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Tooltip, {
											cursor: { fill: "transparent" },
											formatter: (value) => [`$${value.toLocaleString()}`, "Revenue"]
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Bar, {
											dataKey: "revenue",
											fill: "hsl(var(--primary))",
											radius: [
												4,
												4,
												0,
												0
											]
										})
									]
								})
							})
						})
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
					className: "col-span-3",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardHeader, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardTitle, { children: "Recent Transactions" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardDescription, { children: [
						"You have ",
						transactions?.length || 0,
						" total transactions."
					] })] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardContent, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "space-y-8",
						children: isLoading ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "text-sm text-center text-muted-foreground py-10",
							children: "Loading transactions..."
						}) : transactions?.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "text-sm text-center text-muted-foreground py-10",
							children: "No recent transactions."
						}) : transactions?.slice(0, 5).map((t) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-center",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "space-y-1",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "text-sm font-medium leading-none",
									children: t.tenants?.profiles?.full_name || "System / Auto"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "text-sm text-muted-foreground",
									children: t.type.replace("_", " ").replace(/\b\w/g, (l) => l.toUpperCase())
								})]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "ml-auto font-medium",
								children: [
									t.type === "rent_payment" ? "+" : "-",
									"$",
									Number(t.amount).toLocaleString(void 0, {
										minimumFractionDigits: 2,
										maximumFractionDigits: 2
									})
								]
							})]
						}, t.id))
					}) })]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardHeader, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardTitle, { children: "Transaction Ledger" }) }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardContent, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Table, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHeader, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TableRow, { children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, { children: "Date" }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, { children: "Description" }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, { children: "Type" }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, { children: "Status" }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, {
					className: "text-right",
					children: "Amount"
				})
			] }) }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableBody, { children: isLoading ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableRow, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
				colSpan: 5,
				className: "h-24 text-center",
				children: "Loading data..."
			}) }) : !transactions || transactions.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableRow, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
				colSpan: 6,
				className: "h-24 text-center",
				children: "No transactions available."
			}) }) : transactions.map((t) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TableRow, { children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, { children: new Date(t.transaction_date).toLocaleDateString() }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
					className: "font-medium",
					children: t.type === "rent_payment" ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex flex-col",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Rent Payment" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "text-xs text-muted-foreground",
							children: t.tenants?.profiles?.full_name
						})]
					}) : t.type
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, { children: t.type.replace("_", " ").replace(/\b\w/g, (l) => l.toUpperCase()) }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
					variant: t.status === "completed" ? "default" : t.status === "pending" ? "secondary" : "destructive",
					children: t.status.toUpperCase()
				}) }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, { children: t.payment_method || "N/A" }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TableCell, {
					className: "text-right font-medium",
					children: ["$", Number(t.amount).toLocaleString(void 0, {
						minimumFractionDigits: 2,
						maximumFractionDigits: 2
					})]
				})
			] }, t.id)) })] }) })] })
		]
	});
}
//#endregion
export { ReportsComponent as component };
