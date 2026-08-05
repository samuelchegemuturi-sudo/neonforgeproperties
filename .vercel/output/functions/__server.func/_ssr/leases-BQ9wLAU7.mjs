import { o as __toESM } from "../_runtime.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { p as require_jsx_runtime } from "../_libs/@radix-ui/react-avatar+[...].mjs";
import { a as CardHeader, n as CardContent, o as CardTitle, t as Card } from "./card-CcQOx-bn.mjs";
import { t as supabase } from "./client-BNXqJcVa.mjs";
import { i as useQueryClient, n as useQuery, t as useMutation } from "../_libs/tanstack__react-query.mjs";
import { i as useAuth } from "./auth-BCmnXUlU.mjs";
import { t as Button } from "./button-Bq5vK6RO.mjs";
import { t as Input } from "./input-B8Q2ztVi.mjs";
import { t as Label } from "./label-DBD1bRRP.mjs";
import { g as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { f as sendEmailFn } from "./platform.functions-DdYyfv31.mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { F as Download, P as FileText, _ as Printer, c as Trash2, k as LoaderCircle, v as Plus } from "../_libs/lucide-react.mjs";
import { t as Badge } from "./badge-D1Dupn2y.mjs";
import { t as useServerFn } from "./useServerFn-CrZF2pjq.mjs";
import { t as Skeleton } from "./skeleton-D9W9wFsj.mjs";
import { a as SelectValue, i as SelectTrigger, n as SelectContent, r as SelectItem, t as Select } from "./select-Dg1urBTx.mjs";
import { a as statusTone, i as shortDate, o as titleCase, r as money } from "./platform-Df7WJh8D.mjs";
import { a as DialogHeader, i as DialogFooter, n as DialogContent, o as DialogTitle, r as DialogDescription, s as DialogTrigger, t as Dialog } from "./dialog-DIo89e4g.mjs";
import { a as TableHeader, i as TableHead, n as TableBody, o as TableRow, r as TableCell, t as Table } from "./table-C0WYWEQX.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/leases-BQ9wLAU7.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function LeasesPage() {
	const { access, user, can } = useAuth();
	const companyId = access?.profile?.company_id ?? null;
	const sendEmail = useServerFn(sendEmailFn);
	const currency = access?.company?.currency ?? "KES";
	const queryClient = useQueryClient();
	const [open, setOpen] = (0, import_react.useState)(false);
	const [status, setStatus] = (0, import_react.useState)("all");
	const [form, setForm] = (0, import_react.useState)({
		tenant_id: "",
		unit_id: "",
		start_date: (/* @__PURE__ */ new Date()).toISOString().slice(0, 10),
		months: "12"
	});
	const { data: leases, isLoading } = useQuery({
		queryKey: ["leases"],
		queryFn: async () => {
			const { data, error } = await supabase.from("leases").select("id, start_date, end_date, rent, deposit, status, tenants(full_name), units(unit_number), properties(name)").order("start_date", { ascending: false });
			if (error) throw error;
			return data;
		}
	});
	const { data: tenants } = useQuery({
		queryKey: ["tenants", "picker"],
		queryFn: async () => {
			const { data, error } = await supabase.from("tenants").select("id, full_name, email").eq("status", "active").order("full_name");
			if (error) throw error;
			return data;
		}
	});
	const { data: vacantUnits } = useQuery({
		queryKey: ["units", "vacant"],
		queryFn: async () => {
			const { data, error } = await supabase.from("units").select("id, unit_number, rent, property_id, properties(name), unit_types(deposit, service_charge)").eq("status", "vacant").order("unit_number");
			if (error) throw error;
			return data;
		}
	});
	const create = useMutation({
		mutationFn: async () => {
			if (!companyId) throw new Error("Your account is not attached to a company");
			const unit = vacantUnits?.find((u) => u.id === form.unit_id);
			if (!unit) throw new Error("Select a vacant unit");
			const { error } = await supabase.from("leases").insert({
				company_id: companyId,
				tenant_id: form.tenant_id,
				unit_id: unit.id,
				property_id: unit.property_id,
				start_date: form.start_date,
				rent: unit.rent,
				service_charge: unit.unit_types?.service_charge ?? 0,
				deposit: unit.unit_types?.deposit ?? 0,
				billing_day: 1,
				end_date: (() => {
					const d = new Date(form.start_date);
					d.setMonth(d.getMonth() + Number(form.months || 12));
					return d.toISOString().slice(0, 10);
				})()
			});
			if (error) throw error;
		},
		onSuccess: async () => {
			toast.success("Lease created — unit marked occupied");
			const tenant = tenants?.find((t) => t.id === form.tenant_id);
			const unit = vacantUnits?.find((u) => u.id === form.unit_id);
			if (tenant?.email && unit) await sendEmail({ data: {
				to: tenant.email,
				subject: "Your New Lease - Neon Forge Properties",
				htmlContent: `
              <h1>Lease Confirmation</h1>
              <p>Hello ${tenant.full_name},</p>
              <p>Your lease for <strong>Unit ${unit.unit_number}</strong> at <strong>${unit.properties?.name ?? "Property"}</strong> has been successfully created.</p>
              <ul>
                <li><strong>Start Date:</strong> ${form.start_date}</li>
                <li><strong>End Date:</strong> ${(() => {
					const d = new Date(form.start_date);
					d.setMonth(d.getMonth() + Number(form.months || 12));
					return d.toISOString().slice(0, 10);
				})()}</li>
                <li><strong>Rent:</strong> ${currency} ${unit.rent}</li>
                <li><strong>Deposit:</strong> ${currency} ${unit.unit_types?.deposit ?? 0}</li>
              </ul>
              <p>Welcome to your new home!</p>
            `
			} });
			setForm({
				...form,
				tenant_id: "",
				unit_id: ""
			});
			setOpen(false);
			queryClient.invalidateQueries();
		},
		onError: (e) => toast.error(e.message)
	});
	const terminate = useMutation({
		mutationFn: async (lease) => {
			const { error } = await supabase.from("leases").update({
				status: "terminated",
				terminated_at: (/* @__PURE__ */ new Date()).toISOString(),
				end_date: (/* @__PURE__ */ new Date()).toISOString().slice(0, 10)
			}).eq("id", lease.id);
			if (error) throw error;
		},
		onSuccess: () => {
			toast.success("Lease terminated — unit released");
			queryClient.invalidateQueries();
		},
		onError: (e) => toast.error(e.message)
	});
	const deleteLease = useMutation({
		mutationFn: async (id) => {
			const { error } = await supabase.from("leases").delete().eq("id", id);
			if (error) throw error;
		},
		onSuccess: () => {
			toast.success("Lease deleted");
			queryClient.invalidateQueries();
		},
		onError: (e) => toast.error(e.message)
	});
	const rows = (leases ?? []).filter((l) => status === "all" || l.status === status);
	const active = (leases ?? []).filter((l) => l.status === "active").length;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "mx-auto max-w-6xl space-y-6",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex flex-wrap items-end justify-between gap-3 print:hidden",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
				className: "text-2xl font-semibold tracking-tight",
				children: "Leases"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				className: "mt-1 text-sm text-muted-foreground",
				children: [
					leases?.length ?? 0,
					" leases · ",
					active,
					" active"
				]
			})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex gap-2",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
						variant: "outline",
						size: "sm",
						onClick: () => window.print(),
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Download, { className: "mr-1.5 size-4" }), "Export"]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						asChild: true,
						variant: "outline",
						size: "sm",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
							to: "/tenants",
							children: "Tenants"
						})
					}),
					can("tenant.create") && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Dialog, {
						open,
						onOpenChange: setOpen,
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogTrigger, {
							asChild: true,
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
								size: "sm",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, { className: "mr-1.5 size-4" }), "New lease"]
							})
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogContent, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogHeader, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogTitle, { children: "Move a tenant in" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogDescription, { children: "Rent, service charge and deposit are pulled from the unit configuration." })] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
							className: "grid gap-3",
							onSubmit: (e) => {
								e.preventDefault();
								create.mutate();
							},
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "space-y-1.5",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Tenant" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
										value: form.tenant_id,
										onValueChange: (v) => setForm({
											...form,
											tenant_id: v
										}),
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, { placeholder: "Select tenant" }) }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectContent, { children: (tenants ?? []).map((t) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
											value: t.id,
											children: t.full_name
										}, t.id)) })]
									})]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "space-y-1.5",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Vacant unit" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
										value: form.unit_id,
										onValueChange: (v) => setForm({
											...form,
											unit_id: v
										}),
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, { placeholder: "Select unit" }) }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectContent, { children: (vacantUnits ?? []).map((u) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SelectItem, {
											value: u.id,
											children: [
												u.properties?.name ?? "Property",
												" · ",
												u.unit_number,
												" ·",
												" ",
												money(u.rent, currency)
											]
										}, u.id)) })]
									})]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "grid gap-3 sm:grid-cols-2",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "space-y-1.5",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
											htmlFor: "start_date",
											children: "Start date"
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
											id: "start_date",
											type: "date",
											value: form.start_date,
											onChange: (e) => setForm({
												...form,
												start_date: e.target.value
											}),
											required: true
										})]
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "space-y-1.5",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
											htmlFor: "months",
											children: "No. of months"
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
											id: "months",
											type: "number",
											min: 1,
											max: 120,
											value: form.months,
											onChange: (e) => setForm({
												...form,
												months: e.target.value
											}),
											required: true
										})]
									})]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogFooter, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
									type: "submit",
									disabled: create.isPending || !form.tenant_id || !form.unit_id,
									children: [create.isPending && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "mr-2 size-4 animate-spin" }), "Create lease"]
								}) })
							]
						})] })]
					})
				]
			})]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardHeader, {
			className: "flex flex-row flex-wrap items-center gap-2 space-y-0",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
				value: status,
				onValueChange: setStatus,
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, {
					className: "h-9 w-44",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, {})
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SelectContent, { children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
						value: "all",
						children: "All leases"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
						value: "active",
						children: "Active"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
						value: "terminated",
						children: "Terminated"
					})
				] })]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardTitle, {
				className: "sr-only",
				children: "Lease list"
			})]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardContent, {
			className: "px-0",
			children: isLoading ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "space-y-2 px-6",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "h-10 w-full" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "h-10 w-full" })]
			}) : !rows.length ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				className: "px-6 py-12 text-center text-sm text-muted-foreground",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(FileText, { className: "mx-auto mb-3 size-6" }), "No leases yet — add a tenant, then move them into a vacant unit."]
			}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "overflow-x-auto",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Table, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHeader, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TableRow, { children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, { children: "Tenant" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, { children: "Unit" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, { children: "Rent" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, { children: "Deposit" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, { children: "Period" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, { children: "Status" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, {
						className: "text-right",
						children: "Actions"
					})
				] }) }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableBody, { children: rows.map((l) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TableRow, { children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
						className: "font-medium",
						children: l.tenants?.full_name ?? "—"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TableCell, { children: [
						l.properties?.name ?? "—",
						" · ",
						l.units?.unit_number ?? "—"
					] }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, { children: money(l.rent, currency) }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, { children: money(l.deposit, currency) }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TableCell, {
						className: "text-sm text-muted-foreground",
						children: [
							shortDate(l.start_date),
							" → ",
							l.end_date ? shortDate(l.end_date) : "open"
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
						variant: statusTone(l.status),
						children: titleCase(l.status)
					}) }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
						className: "text-right",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex justify-end gap-1",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
								to: "/leases/$leaseId/statement",
								params: { leaseId: l.id },
								className: "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 hover:bg-accent hover:text-accent-foreground h-8 w-8 text-muted-foreground",
								title: "Print Statement",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Printer, { className: "size-4" })
							}), l.status === "active" ? can("tenant.edit") && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								size: "sm",
								variant: "ghost",
								onClick: () => terminate.mutate(l),
								disabled: terminate.isPending,
								children: "Move out"
							}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								size: "sm",
								variant: "ghost",
								className: "text-destructive hover:bg-destructive/10",
								onClick: () => {
									if (confirm("Are you sure you want to delete this lease?")) deleteLease.mutate(l.id);
								},
								disabled: deleteLease.isPending,
								title: "Delete Lease",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Trash2, { className: "size-4" })
							})]
						})
					})
				] }, l.id)) })] })
			})
		})] })]
	});
}
//#endregion
export { LeasesPage as component };
