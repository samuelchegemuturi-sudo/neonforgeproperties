import { p as require_jsx_runtime } from "../_libs/@radix-ui/react-avatar+[...].mjs";
import { a as CardHeader, n as CardContent, o as CardTitle, r as CardDescription, t as Card } from "./card-CcQOx-bn.mjs";
import { t as supabase } from "./client-BNXqJcVa.mjs";
import { n as useQuery } from "../_libs/tanstack__react-query.mjs";
import { n as useAuth } from "./auth-D3Dl5b08.mjs";
import { t as Button } from "./button-Bq5vK6RO.mjs";
import { g as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { I as DoorOpen, M as KeyRound, W as CircleAlert, X as Building2, Z as Briefcase, a as UserCog, d as ShieldCheck, et as BadgeCheck, i as Users, n as Wrench, r as Wallet, s as TrendingUp, z as CreditCard } from "../_libs/lucide-react.mjs";
import { t as Badge } from "./badge-D1Dupn2y.mjs";
import { t as Skeleton } from "./skeleton-D9W9wFsj.mjs";
import { r as money } from "./platform-Df7WJh8D.mjs";
import { a as XAxis, c as Bar, d as ResponsiveContainer, f as Tooltip, i as YAxis, l as Pie, n as PieChart, o as Area, r as BarChart, s as CartesianGrid, t as AreaChart, u as Cell } from "../_libs/recharts+[...].mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/dashboard-VXWzllU9.js
var import_jsx_runtime = require_jsx_runtime();
function Dashboard() {
	const { access, can } = useAuth();
	return access?.profile?.is_super_admin ?? false ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PlatformDashboard, {}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CompanyDashboard, {});
}
function Header({ title, subtitle }) {
	const { access } = useAuth();
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex flex-wrap items-end justify-between gap-3",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
			className: "text-2xl font-semibold tracking-tight",
			children: title
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "mt-1 text-sm text-muted-foreground",
			children: subtitle
		})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Badge, {
			variant: "secondary",
			className: "gap-1.5",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ShieldCheck, { className: "size-3.5" }), access?.profile?.is_super_admin ? "All permissions" : `${access?.permissions.length ?? 0} permissions`]
		})]
	});
}
function MetricGrid({ metrics, loading }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "grid gap-4 sm:grid-cols-2 xl:grid-cols-4",
		children: [metrics.map((m) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
			className: "shadow-[var(--shadow-card)]",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardHeader, {
				className: "flex flex-row items-center justify-between space-y-0 pb-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardTitle, {
					className: "text-sm font-medium text-muted-foreground",
					children: m.label
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(m.icon, { className: "size-4 text-muted-foreground" })]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardContent, { children: [loading ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "h-8 w-20" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-2xl font-semibold tracking-tight",
				children: m.value
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-1 text-xs text-muted-foreground",
				children: m.hint
			})] })]
		}, m.label)), !metrics.length && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Card, {
			className: "sm:col-span-2 xl:col-span-4",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardContent, {
				className: "py-10 text-center text-sm text-muted-foreground",
				children: "Your role has no dashboard metrics assigned yet. Ask your landlord to grant permissions."
			})
		})]
	});
}
function PlatformDashboard() {
	const { data, isLoading } = useQuery({
		queryKey: ["platform-dashboard"],
		queryFn: async () => {
			const head = {
				count: "exact",
				head: true
			};
			const [companies, active, pending, properties, units, occupied, licences, verifications, tickets, invoices, recent] = await Promise.all([
				supabase.from("companies").select("id", head),
				supabase.from("companies").select("id", head).eq("activation_status", "active"),
				supabase.from("companies").select("id", head).eq("verification_status", "pending"),
				supabase.from("properties").select("id", head),
				supabase.from("units").select("id", head),
				supabase.from("units").select("id", head).eq("status", "occupied"),
				supabase.from("licences").select("id", head),
				supabase.from("verification_requests").select("id", head).eq("status", "pending"),
				supabase.from("support_tickets").select("id", head).neq("status", "closed"),
				supabase.from("subscription_invoices").select("amount, status, period_start"),
				supabase.from("companies").select("id, name, company_type, activation_status, created_at").order("created_at", { ascending: false }).limit(6)
			]);
			const rows = invoices.data ?? [];
			const mrr = rows.reduce((sum, r) => sum + Number(r.amount ?? 0), 0);
			const outstanding = rows.filter((r) => r.status !== "paid").reduce((sum, r) => sum + Number(r.amount ?? 0), 0);
			return {
				companies: companies.count ?? 0,
				active: active.count ?? 0,
				pending: pending.count ?? 0,
				properties: properties.count ?? 0,
				units: units.count ?? 0,
				occupied: occupied.count ?? 0,
				licences: licences.count ?? 0,
				verifications: verifications.count ?? 0,
				tickets: tickets.count ?? 0,
				mrr,
				outstanding,
				recent: recent.data ?? []
			};
		}
	});
	const occupancy = data?.units ? Math.round(data.occupied / data.units * 100) : 0;
	const metrics = [
		{
			label: "Companies",
			value: String(data?.companies ?? 0),
			hint: `${data?.active ?? 0} activated`,
			icon: Briefcase,
			permission: "companies.view"
		},
		{
			label: "Licences issued",
			value: String(data?.licences ?? 0),
			hint: `${data?.pending ?? 0} awaiting verification`,
			icon: KeyRound,
			permission: "licence.view"
		},
		{
			label: "Properties",
			value: String(data?.properties ?? 0),
			hint: `${data?.units ?? 0} units on platform`,
			icon: Building2,
			permission: "property.view"
		},
		{
			label: "Occupancy",
			value: `${occupancy}%`,
			hint: `${data?.occupied ?? 0} occupied units`,
			icon: TrendingUp,
			permission: "unit.view"
		},
		{
			label: "Subscription billed",
			value: money(data?.mrr ?? 0),
			hint: "Across all invoices",
			icon: CreditCard,
			permission: "subscriptions.view"
		},
		{
			label: "Outstanding",
			value: money(data?.outstanding ?? 0),
			hint: "Unsettled invoices",
			icon: CircleAlert,
			permission: "subscriptions.view"
		},
		{
			label: "Verification queue",
			value: String(data?.verifications ?? 0),
			hint: "Pending site checks",
			icon: BadgeCheck,
			permission: "verification.view"
		},
		{
			label: "Open tickets",
			value: String(data?.tickets ?? 0),
			hint: "Support backlog",
			icon: Wrench,
			permission: "support.view"
		}
	];
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "mx-auto max-w-7xl space-y-6",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Header, {
				title: "Platform dashboard",
				subtitle: "Every company, licence and subscription across Neon Forge Properties."
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MetricGrid, {
				metrics,
				loading: isLoading
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardHeader, {
				className: "flex flex-row items-center justify-between space-y-0",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardTitle, {
					className: "text-base",
					children: "Newest companies"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardDescription, { children: "Latest registrations on the platform" })] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					asChild: true,
					size: "sm",
					variant: "outline",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
						to: "/companies",
						children: "All companies"
					})
				})]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardContent, {
				className: "space-y-2",
				children: [
					isLoading && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "h-24 w-full" }),
					!isLoading && !data?.recent.length && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "py-6 text-center text-sm text-muted-foreground",
						children: "No companies registered yet."
					}),
					data?.recent.map((c) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-center justify-between rounded-lg border px-3 py-2 text-sm",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "font-medium",
							children: c.name
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
							variant: "outline",
							className: "text-[11px]",
							children: c.activation_status
						})]
					}, c.id))
				]
			})] })
		]
	});
}
function CompanyDashboard() {
	const { access, can } = useAuth();
	const companyId = access?.profile?.company_id ?? null;
	const currency = access?.company?.currency ?? "KES";
	const { data, isLoading } = useQuery({
		queryKey: ["company-dashboard", companyId],
		enabled: Boolean(companyId),
		queryFn: async () => {
			const head = {
				count: "exact",
				head: true
			};
			const [staff, roles, properties, units, occupied, unitRows, licence, quote] = await Promise.all([
				supabase.from("profiles").select("id", head).eq("company_id", companyId),
				supabase.from("roles").select("id", head).eq("company_id", companyId),
				supabase.from("properties").select("id", head).eq("company_id", companyId),
				supabase.from("units").select("id", head).eq("company_id", companyId),
				supabase.from("units").select("id", head).eq("company_id", companyId).eq("status", "occupied"),
				supabase.from("units").select("rent, status").eq("company_id", companyId),
				supabase.from("licences").select("code").eq("company_id", companyId).maybeSingle(),
				supabase.rpc("calculate_subscription", {
					_company_id: companyId,
					_paid_only: false
				})
			]);
			const rows = unitRows.data ?? [];
			const potential = rows.reduce((s, u) => s + Number(u.rent ?? 0), 0);
			const billed = rows.filter((u) => u.status === "occupied").reduce((s, u) => s + Number(u.rent ?? 0), 0);
			return {
				staff: staff.count ?? 0,
				roles: roles.count ?? 0,
				properties: properties.count ?? 0,
				units: units.count ?? 0,
				occupied: occupied.count ?? 0,
				potential,
				billed,
				licence: licence.data,
				quote: quote.data ?? null
			};
		}
	});
	const occupancy = data?.units ? Math.round(data.occupied / data.units * 100) : 0;
	const visibleMetrics = [
		{
			label: "Properties",
			value: String(data?.properties ?? 0),
			hint: data?.properties ? "In your portfolio" : "Register your first property",
			icon: Building2,
			permission: "property.view"
		},
		{
			label: "Units",
			value: String(data?.units ?? 0),
			hint: "Generated from unit types",
			icon: DoorOpen,
			permission: "unit.view"
		},
		{
			label: "Occupied units",
			value: String(data?.occupied ?? 0),
			hint: `Occupancy ${occupancy}%`,
			icon: TrendingUp,
			permission: "unit.view"
		},
		{
			label: "Active tenants",
			value: "0",
			hint: "Leases arrive next phase",
			icon: Users,
			permission: "tenant.view"
		},
		{
			label: "Expected rent",
			value: money(data?.billed ?? 0, currency),
			hint: `${money(data?.potential ?? 0, currency)} at full occupancy`,
			icon: Wallet,
			permission: "finance.view"
		},
		{
			label: "Subscription",
			value: money(data?.quote?.total ?? 0, currency),
			hint: `${data?.quote?.units ?? 0} properties / month${access?.subscription?.current_period_end ? ` • Due ${new Date(access.subscription.current_period_end).toLocaleDateString()}` : ""}`,
			icon: CreditCard,
			permission: "dashboard.view"
		},
		{
			label: "Maintenance requests",
			value: "0",
			hint: "0 open work orders",
			icon: Wrench,
			permission: "maintenance.view"
		},
		{
			label: "Team members",
			value: String(data?.staff ?? 0),
			hint: `${data?.roles ?? 0} roles configured`,
			icon: UserCog,
			permission: "employees.view"
		}
	].filter((m) => can(m.permission));
	const emptySeries = [
		"Jan",
		"Feb",
		"Mar",
		"Apr",
		"May",
		"Jun",
		"Jul",
		"Aug",
		"Sep"
	].map((m) => ({
		month: m,
		collected: 0,
		invoiced: 0
	}));
	const methodSeries = [
		{
			name: "M-Pesa",
			value: 0
		},
		{
			name: "Paystack",
			value: 0
		},
		{
			name: "Bank",
			value: 0
		},
		{
			name: "Card",
			value: 0
		}
	];
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "mx-auto max-w-7xl space-y-6",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Header, {
				title: `${access?.company?.name ?? "Executive"} dashboard`,
				subtitle: `Signed in as ${access?.roles.map((r) => r.name).join(", ") || "no role assigned"}. You see only what your permissions allow.`
			}),
			!isLoading && companyId && !data?.licence && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Card, {
				className: "border-primary/40 bg-primary/5",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardContent, {
					className: "flex flex-wrap items-center justify-between gap-3 py-4",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-sm font-medium",
						children: "Your company is not activated yet"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-xs text-muted-foreground",
						children: "Complete KYC, add a property and settle the activation fee to receive your licence."
					})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						asChild: true,
						size: "sm",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
							to: "/onboarding",
							children: "Continue activation"
						})
					})]
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MetricGrid, {
				metrics: visibleMetrics,
				loading: isLoading
			}),
			can("finance.view") && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid gap-4 lg:grid-cols-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
					className: "lg:col-span-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardHeader, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardTitle, {
						className: "text-base",
						children: "Rent collection"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardDescription, { children: "Invoiced vs collected per month" })] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardContent, {
						className: "h-72",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ResponsiveContainer, {
							width: "100%",
							height: "100%",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(BarChart, {
								data: emptySeries,
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CartesianGrid, {
										strokeDasharray: "3 3",
										stroke: "var(--border)",
										vertical: false
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(XAxis, {
										dataKey: "month",
										stroke: "var(--muted-foreground)",
										fontSize: 12
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(YAxis, {
										stroke: "var(--muted-foreground)",
										fontSize: 12
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Tooltip, { contentStyle: {
										background: "var(--popover)",
										border: "1px solid var(--border)",
										borderRadius: "var(--radius)",
										color: "var(--popover-foreground)"
									} }),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Bar, {
										dataKey: "invoiced",
										fill: "var(--chart-2)",
										radius: [
											4,
											4,
											0,
											0
										]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Bar, {
										dataKey: "collected",
										fill: "var(--chart-1)",
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
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardHeader, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardTitle, {
					className: "text-base",
					children: "Payment methods"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardDescription, { children: "Share of collections" })] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardContent, {
					className: "h-72",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ResponsiveContainer, {
						width: "100%",
						height: "100%",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PieChart, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Pie, {
							data: methodSeries.map((m) => ({
								...m,
								value: m.value || 1
							})),
							dataKey: "value",
							nameKey: "name",
							innerRadius: 55,
							outerRadius: 85,
							paddingAngle: 3,
							children: methodSeries.map((_, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Cell, {
								fill: `var(--chart-${i + 1})`,
								opacity: .35
							}, i))
						}) })
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "-mt-4 text-center text-xs text-muted-foreground",
						children: "No payments recorded yet"
					})]
				})] })]
			}),
			can("reports.view") && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardHeader, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardTitle, {
				className: "text-base",
				children: "Revenue trend"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardDescription, { children: "Rolling nine months" })] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardContent, {
				className: "h-64",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ResponsiveContainer, {
					width: "100%",
					height: "100%",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AreaChart, {
						data: emptySeries,
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("defs", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("linearGradient", {
								id: "rev",
								x1: "0",
								y1: "0",
								x2: "0",
								y2: "1",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("stop", {
									offset: "0%",
									stopColor: "var(--chart-1)",
									stopOpacity: .35
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("stop", {
									offset: "100%",
									stopColor: "var(--chart-1)",
									stopOpacity: 0
								})]
							}) }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CartesianGrid, {
								strokeDasharray: "3 3",
								stroke: "var(--border)",
								vertical: false
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(XAxis, {
								dataKey: "month",
								stroke: "var(--muted-foreground)",
								fontSize: 12
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(YAxis, {
								stroke: "var(--muted-foreground)",
								fontSize: 12
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Area, {
								type: "monotone",
								dataKey: "collected",
								stroke: "var(--chart-1)",
								fill: "url(#rev)",
								strokeWidth: 2
							})
						]
					})
				})
			})] })
		]
	});
}
//#endregion
export { Dashboard as component };
