import { i as __toESM } from "../_runtime.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { p as require_jsx_runtime } from "../_libs/@radix-ui/react-avatar+[...].mjs";
import { a as CardHeader, n as CardContent, o as CardTitle, t as Card } from "./card-BfBj_YIE.mjs";
import { t as supabase } from "./client-BNXqJcVa.mjs";
import { i as useQueryClient, n as useQuery, t as useMutation } from "../_libs/tanstack__react-query.mjs";
import { n as useAuth } from "./auth-D3Dl5b08.mjs";
import { t as Button } from "./button-Bq5vK6RO.mjs";
import { t as Input } from "./input-B8Q2ztVi.mjs";
import { t as Label } from "./label-DBD1bRRP.mjs";
import { g as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { u as sendEmailFn } from "./platform.functions-xhJW-uih.mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { F as Download, c as Trash2, i as Users, k as LoaderCircle, v as Plus } from "../_libs/lucide-react.mjs";
import { t as useServerFn } from "./useServerFn-CrZF2pjq.mjs";
import { t as Skeleton } from "./skeleton-D9W9wFsj.mjs";
import { t as Badge } from "./badge-D1Dupn2y.mjs";
import { a as statusTone, i as shortDate, o as titleCase } from "./platform-Df7WJh8D.mjs";
import { a as DialogHeader, i as DialogFooter, n as DialogContent, o as DialogTitle, r as DialogDescription, s as DialogTrigger, t as Dialog } from "./dialog-DIo89e4g.mjs";
import { a as TableHeader, i as TableHead, n as TableBody, o as TableRow, r as TableCell, t as Table } from "./table-C0WYWEQX.mjs";
import { t as Textarea } from "./textarea-kko37XEX.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/tenants-CVlA1Wg4.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var emptyForm = {
	full_name: "",
	phone: "",
	email: "",
	national_id: "",
	emergency_name: "",
	emergency_phone: "",
	notes: ""
};
function TenantsPage() {
	const { access, can } = useAuth();
	const companyId = access?.profile?.company_id ?? null;
	const sendEmail = useServerFn(sendEmailFn);
	const queryClient = useQueryClient();
	const [search, setSearch] = (0, import_react.useState)("");
	const [open, setOpen] = (0, import_react.useState)(false);
	const [form, setForm] = (0, import_react.useState)(emptyForm);
	const { data: tenants, isLoading } = useQuery({
		queryKey: ["tenants"],
		queryFn: async () => {
			const { data, error } = await supabase.from("tenants").select("id, full_name, email, phone, national_id, kyc_status, status, created_at, leases(id, status, units(unit_number))").order("full_name");
			if (error) throw error;
			return data;
		}
	});
	const create = useMutation({
		mutationFn: async () => {
			if (!companyId) throw new Error("Your account is not attached to a company");
			const { error } = await supabase.from("tenants").insert({
				company_id: companyId,
				full_name: form.full_name,
				phone: form.phone,
				email: form.email || null,
				national_id: form.national_id || null,
				emergency_name: form.emergency_name || null,
				emergency_phone: form.emergency_phone || null,
				notes: form.notes || null
			});
			if (error) throw error;
		},
		onSuccess: async () => {
			toast.success("Tenant added");
			if (form.email) await sendEmail({ data: {
				to: form.email,
				subject: "Welcome to Neon Forge Properties",
				htmlContent: `
              <h1>Welcome to Neon Forge Properties!</h1>
              <p>Hello ${form.full_name},</p>
              <p>You have been successfully registered as a tenant. We will send your lease documents and payment details here.</p>
              <p>Thank you!</p>
            `
			} });
			setForm(emptyForm);
			setOpen(false);
			queryClient.invalidateQueries({ queryKey: ["tenants"] });
		},
		onError: (e) => toast.error(e.message)
	});
	const deleteTenant = useMutation({
		mutationFn: async (id) => {
			const { error } = await supabase.from("tenants").delete().eq("id", id);
			if (error) throw error;
		},
		onSuccess: () => {
			toast.success("Tenant deleted");
			queryClient.invalidateQueries({ queryKey: ["tenants"] });
		},
		onError: (e) => toast.error(e.message)
	});
	const rows = (tenants ?? []).filter((t) => search ? `${t.full_name} ${t.phone} ${t.email ?? ""}`.toLowerCase().includes(search.toLowerCase()) : true);
	(tenants ?? []).filter((t) => t.leases?.some((l) => l.status === "active")).length;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "mx-auto max-w-5xl space-y-6",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex flex-wrap items-end justify-between gap-3 print:hidden",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
				className: "text-2xl font-semibold tracking-tight",
				children: "Tenants"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-1 text-sm text-muted-foreground",
				children: "View contacts, KYC status and active leases for all tenants."
			})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex gap-2",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
						variant: "outline",
						size: "sm",
						onClick: () => window.print(),
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Download, { className: "mr-1.5 size-4" }), " Export"]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						asChild: true,
						variant: "outline",
						size: "sm",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
							to: "/leases",
							children: "Leases"
						})
					}),
					can("tenant.create") && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Dialog, {
						open,
						onOpenChange: setOpen,
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogTrigger, {
							asChild: true,
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
								size: "sm",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, { className: "mr-1.5 size-4" }), "Add tenant"]
							})
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogContent, {
							className: "sm:max-w-lg",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogHeader, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogTitle, { children: "New tenant" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogDescription, { children: "Capture the tenant record first, then create a lease to move them into a unit." })] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
								className: "grid gap-3 sm:grid-cols-2",
								onSubmit: (e) => {
									e.preventDefault();
									create.mutate();
								},
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "space-y-1.5 sm:col-span-2",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
											htmlFor: "full_name",
											children: "Full name"
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
											id: "full_name",
											value: form.full_name,
											onChange: (e) => setForm({
												...form,
												full_name: e.target.value
											}),
											required: true
										})]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "space-y-1.5",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
											htmlFor: "phone",
											children: "Phone"
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
											id: "phone",
											value: form.phone,
											onChange: (e) => setForm({
												...form,
												phone: e.target.value
											}),
											required: true
										})]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "space-y-1.5",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
											htmlFor: "email",
											children: "Email"
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
											id: "email",
											type: "email",
											value: form.email,
											onChange: (e) => setForm({
												...form,
												email: e.target.value
											})
										})]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "space-y-1.5",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
											htmlFor: "national_id",
											children: "National ID"
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
											id: "national_id",
											value: form.national_id,
											onChange: (e) => setForm({
												...form,
												national_id: e.target.value
											})
										})]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "space-y-1.5",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
											htmlFor: "emergency_name",
											children: "Emergency contact"
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
											id: "emergency_name",
											value: form.emergency_name,
											onChange: (e) => setForm({
												...form,
												emergency_name: e.target.value
											})
										})]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "space-y-1.5 sm:col-span-2",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
											htmlFor: "emergency_phone",
											children: "Emergency phone"
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
											id: "emergency_phone",
											value: form.emergency_phone,
											onChange: (e) => setForm({
												...form,
												emergency_phone: e.target.value
											})
										})]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "space-y-1.5 sm:col-span-2",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
											htmlFor: "notes",
											children: "Notes"
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Textarea, {
											id: "notes",
											value: form.notes,
											onChange: (e) => setForm({
												...form,
												notes: e.target.value
											})
										})]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogFooter, {
										className: "sm:col-span-2",
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
											type: "submit",
											disabled: create.isPending,
											children: [create.isPending && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "mr-2 size-4 animate-spin" }), "Save tenant"]
										})
									})
								]
							})]
						})]
					})
				]
			})]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardHeader, {
			className: "flex flex-row flex-wrap items-center gap-2 space-y-0",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
				placeholder: "Search name, phone or email…",
				value: search,
				onChange: (e) => setSearch(e.target.value),
				className: "h-9 max-w-xs"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardTitle, {
				className: "sr-only",
				children: "Tenant list"
			})]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardContent, {
			className: "px-0",
			children: isLoading ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "space-y-2 px-6",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "h-10 w-full" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "h-10 w-full" })]
			}) : !rows.length ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				className: "px-6 py-12 text-center text-sm text-muted-foreground",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Users, { className: "mx-auto mb-3 size-6" }), "No tenants yet."]
			}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "overflow-x-auto",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Table, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHeader, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TableRow, { children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, { children: "Tenant" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, { children: "Contact" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, { children: "Unit" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, { children: "KYC" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, { children: "Status" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, { children: "Added" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, {
						className: "text-right",
						children: "Actions"
					})
				] }) }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableBody, { children: rows.map((t) => {
					const lease = t.leases?.find((l) => l.status === "active");
					return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TableRow, { children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
							className: "font-medium",
							children: t.full_name
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TableCell, {
							className: "text-sm text-muted-foreground",
							children: [t.phone, t.email ? ` · ${t.email}` : ""]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, { children: lease?.units?.unit_number ?? "—" }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
							variant: statusTone(t.kyc_status),
							children: titleCase(t.kyc_status)
						}) }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
							variant: statusTone(t.status),
							children: titleCase(t.status)
						}) }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
							className: "text-sm text-muted-foreground",
							children: shortDate(t.created_at)
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
							className: "text-right",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								size: "sm",
								variant: "ghost",
								className: "text-destructive hover:bg-destructive/10",
								onClick: () => {
									if (confirm("Are you sure you want to completely delete this tenant? This will also delete their history.")) deleteTenant.mutate(t.id);
								},
								disabled: deleteTenant.isPending,
								title: "Delete Tenant",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Trash2, { className: "size-4" })
							})
						})
					] }, t.id);
				}) })] })
			})
		})] })]
	});
}
//#endregion
export { TenantsPage as component };
