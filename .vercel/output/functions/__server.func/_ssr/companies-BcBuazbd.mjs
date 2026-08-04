import { o as __toESM } from "../_runtime.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { p as require_jsx_runtime } from "../_libs/@radix-ui/react-avatar+[...].mjs";
import { a as CardHeader, n as CardContent, o as CardTitle, r as CardDescription, t as Card } from "./card-CcQOx-bn.mjs";
import { t as supabase } from "./client-BNXqJcVa.mjs";
import { i as useQueryClient, n as useQuery, t as useMutation } from "../_libs/tanstack__react-query.mjs";
import { n as useAuth } from "./auth-D3Dl5b08.mjs";
import { t as Button } from "./button-Bq5vK6RO.mjs";
import { t as Input } from "./input-B8Q2ztVi.mjs";
import { t as Label } from "./label-DBD1bRRP.mjs";
import { f as sendEmailFn, i as adminDeleteCompany, n as adminCreateCompany, o as adminResetTemporaryPassword } from "./platform.functions-BTrKAh3m.mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { $ as Ban, B as Copy, M as KeyRound, U as CircleCheck, X as Building2, c as Trash2, d as ShieldCheck, v as Plus } from "../_libs/lucide-react.mjs";
import { t as Badge } from "./badge-D1Dupn2y.mjs";
import { t as useServerFn } from "./useServerFn-CrZF2pjq.mjs";
import { t as Skeleton } from "./skeleton-D9W9wFsj.mjs";
import { a as statusTone, i as shortDate, n as companyTypeLabel, o as titleCase, t as COMPANY_TYPES } from "./platform-Df7WJh8D.mjs";
import { a as DialogHeader, i as DialogFooter, n as DialogContent, o as DialogTitle, r as DialogDescription, s as DialogTrigger, t as Dialog } from "./dialog-DIo89e4g.mjs";
import { a as SelectValue, i as SelectTrigger, n as SelectContent, r as SelectItem, t as Select } from "./select-Dg1urBTx.mjs";
import { a as TableHeader, i as TableHead, n as TableBody, o as TableRow, r as TableCell, t as Table } from "./table-C0WYWEQX.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/companies-BcBuazbd.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function CompaniesPage() {
	const { can } = useAuth();
	const queryClient = useQueryClient();
	const sendEmail = useServerFn(sendEmailFn);
	const [typeFilter, setTypeFilter] = (0, import_react.useState)("all");
	const [statusFilter, setStatusFilter] = (0, import_react.useState)("all");
	const [search, setSearch] = (0, import_react.useState)("");
	const [open, setOpen] = (0, import_react.useState)(false);
	const [credentials, setCredentials] = (0, import_react.useState)(null);
	const { data: companies, isLoading } = useQuery({
		queryKey: ["companies"],
		queryFn: async () => {
			const { data, error } = await supabase.from("companies").select("id, name, email, phone, company_type, status, activation_status, verification_status, currency, created_at").order("created_at", { ascending: false });
			if (error) throw error;
			return data;
		}
	});
	const createFn = useServerFn(adminCreateCompany);
	const createCompany = useMutation({
		mutationFn: (input) => createFn({ data: input }),
		onSuccess: async (result, variables) => {
			setCredentials({
				email: result.email,
				temporaryPassword: result.temporaryPassword
			});
			setOpen(false);
			queryClient.invalidateQueries({ queryKey: ["companies"] });
			toast.success("Company registered");
			try {
				const emailRes = await sendEmail({ data: {
					to: result.email,
					subject: "Welcome to Neon Forge Properties - Company Admin Account",
					htmlContent: `
              <h1>Welcome to Neon Forge Properties!</h1>
              <p>Hello ${variables.owner_name},</p>
              <p>Your company <strong>${variables.name}</strong> has been registered. You can log in as the owner using this email address and the following temporary password:</p>
              <p><strong>${result.temporaryPassword}</strong></p>
              <p>Please log in and change your password immediately.</p>
            `
				} });
				if (emailRes.success) toast.success("Welcome email sent to " + result.email);
				else toast.error("Welcome email failed: " + emailRes.error);
			} catch (err) {
				toast.error("Welcome email fetch failed: " + err.message);
			}
		},
		onError: (error) => toast.error(error.message)
	});
	const updateCompany = useMutation({
		mutationFn: async ({ id, patch }) => {
			const { error } = await supabase.from("companies").update(patch).eq("id", id);
			if (error) throw error;
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["companies"] });
			toast.success("Company updated");
		},
		onError: (error) => toast.error(error.message)
	});
	const generateLicence = useMutation({
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
	const resetPasswordFn = useServerFn(adminResetTemporaryPassword);
	const resetPassword = useMutation({
		mutationFn: (email) => resetPasswordFn({ data: { email } }),
		onSuccess: async (result, email) => {
			setCredentials({
				email,
				temporaryPassword: result.temporaryPassword
			});
			toast.success("Temporary password generated");
			try {
				const emailRes = await sendEmail({ data: {
					to: email,
					subject: "Your Password Has Been Reset",
					htmlContent: `
              <h1>Password Reset</h1>
              <p>Your temporary password is: <strong>${result.temporaryPassword}</strong></p>
              <p>Please log in and change your password immediately.</p>
            `
				} });
				if (emailRes.success) toast.success("Email sent to " + email);
				else toast.error("Email failed: " + emailRes.error);
			} catch (err) {
				toast.error("Email fetch failed: " + err.message);
			}
		},
		onError: (error) => toast.error(error.message)
	});
	const deleteCompanyFn = useServerFn(adminDeleteCompany);
	const deleteCompany = useMutation({
		mutationFn: async (id) => {
			const { data: files } = await supabase.storage.from("kyc_documents").list(id);
			if (files && files.length > 0) await supabase.storage.from("kyc_documents").remove(files.map((f) => `${id}/${f.name}`));
			await deleteCompanyFn({ data: { targetCompanyId: id } });
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["companies"] });
			toast.success("Company and KYC data deleted");
		},
		onError: (error) => toast.error(error.message)
	});
	const rows = (companies ?? []).filter((c) => {
		if (typeFilter !== "all" && c.company_type !== typeFilter) return false;
		if (statusFilter !== "all" && c.activation_status !== statusFilter) return false;
		if (search && !`${c.name} ${c.email ?? ""}`.toLowerCase().includes(search.toLowerCase())) return false;
		return true;
	});
	const stats = [
		{
			label: "Companies",
			value: companies?.length ?? 0
		},
		{
			label: "Active",
			value: (companies ?? []).filter((c) => c.activation_status === "active").length
		},
		{
			label: "Pending activation",
			value: (companies ?? []).filter((c) => c.activation_status === "pending_activation").length
		},
		{
			label: "Verified",
			value: (companies ?? []).filter((c) => c.verification_status === "verified").length
		}
	];
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "mx-auto max-w-7xl space-y-6",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex flex-wrap items-end justify-between gap-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
					className: "text-2xl font-semibold tracking-tight",
					children: "Companies"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-1 text-sm text-muted-foreground",
					children: "Every landlord, agency and organisation subscribing to Neon Forge Properties."
				})] }), can("companies.create") && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Dialog, {
					open,
					onOpenChange: setOpen,
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogTrigger, {
						asChild: true,
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, { className: "size-4" }), " Register company"] })
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogContent, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
						onSubmit: (e) => {
							e.preventDefault();
							const form = new FormData(e.currentTarget);
							createCompany.mutate({
								name: String(form.get("name") ?? ""),
								company_type: String(form.get("company_type") ?? "individual_landlord"),
								email: String(form.get("email") ?? ""),
								phone: String(form.get("phone") ?? ""),
								owner_name: String(form.get("owner_name") ?? "")
							});
						},
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogHeader, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogTitle, { children: "Register a company" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogDescription, { children: "Creates the company, an owner login with a temporary password, and the default role set." })] }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "grid gap-3 py-4",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "grid gap-1.5",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
											htmlFor: "name",
											children: "Company name"
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
											id: "name",
											name: "name",
											required: true,
											placeholder: "ABC Property Agency"
										})]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "grid gap-1.5",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
											htmlFor: "company_type",
											children: "Company type"
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
											name: "company_type",
											defaultValue: "individual_landlord",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, {
												id: "company_type",
												children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, {})
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectContent, { children: COMPANY_TYPES.map((t) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
												value: t.value,
												children: t.label
											}, t.value)) })]
										})]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "grid gap-1.5",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
											htmlFor: "owner_name",
											children: "Owner full name"
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
											id: "owner_name",
											name: "owner_name",
											placeholder: "Jane Wanjiru"
										})]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "grid gap-1.5",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
											htmlFor: "email",
											children: "Owner email"
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
											id: "email",
											name: "email",
											type: "email",
											required: true
										})]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "grid gap-1.5",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
											htmlFor: "phone",
											children: "Phone"
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
											id: "phone",
											name: "phone",
											placeholder: "+254…"
										})]
									})
								]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogFooter, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								type: "submit",
								disabled: createCompany.isPending,
								children: createCompany.isPending ? "Creating…" : "Create company"
							}) })
						]
					}) })]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "grid gap-4 sm:grid-cols-2 xl:grid-cols-4",
				children: stats.map((s) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardHeader, {
					className: "pb-2",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardTitle, {
						className: "text-sm font-medium text-muted-foreground",
						children: s.label
					})
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardContent, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-2xl font-semibold tracking-tight",
					children: s.value
				}) })] }, s.label))
			}),
			credentials && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
				className: "border-primary/40",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardHeader, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardTitle, {
					className: "text-base",
					children: "Temporary credentials"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardDescription, { children: "Shown once. Share securely — the owner should change it on first sign-in." })] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardContent, {
					className: "flex flex-wrap items-center gap-3",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("code", {
							className: "rounded bg-muted px-2 py-1 text-sm",
							children: credentials.email
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("code", {
							className: "rounded bg-muted px-2 py-1 text-sm",
							children: credentials.temporaryPassword
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
							size: "sm",
							variant: "outline",
							onClick: () => {
								navigator.clipboard.writeText(`${credentials.email} / ${credentials.temporaryPassword}`);
								toast.success("Copied");
							},
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Copy, { className: "size-4" }), " Copy"]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							size: "sm",
							variant: "ghost",
							onClick: () => setCredentials(null),
							children: "Dismiss"
						})
					]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardHeader, {
				className: "gap-3",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex flex-wrap items-center gap-2",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
							placeholder: "Search company or email…",
							value: search,
							onChange: (e) => setSearch(e.target.value),
							className: "h-9 max-w-xs"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
							value: typeFilter,
							onValueChange: setTypeFilter,
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, {
								className: "h-9 w-56",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, { placeholder: "All types" })
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SelectContent, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
								value: "all",
								children: "All types"
							}), COMPANY_TYPES.map((t) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
								value: t.value,
								children: t.label
							}, t.value))] })]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
							value: statusFilter,
							onValueChange: setStatusFilter,
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, {
								className: "h-9 w-48",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, { placeholder: "All statuses" })
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SelectContent, { children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
									value: "all",
									children: "All statuses"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
									value: "pending_activation",
									children: "Pending activation"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
									value: "active",
									children: "Active"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
									value: "suspended",
									children: "Suspended"
								})
							] })]
						})
					]
				})
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardContent, {
				className: "px-0",
				children: isLoading ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "space-y-2 px-6",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "h-10 w-full" }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "h-10 w-full" }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "h-10 w-full" })
					]
				}) : rows.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "px-6 py-12 text-center text-sm text-muted-foreground",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Building2, { className: "mx-auto mb-3 size-6" }), "No companies match these filters."]
				}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "overflow-x-auto",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Table, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHeader, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TableRow, { children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, { children: "Company" }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, { children: "Type" }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, { children: "Activation" }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, { children: "Verification" }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, { children: "Joined" }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, {
							className: "text-right",
							children: "Actions"
						})
					] }) }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableBody, { children: rows.map((c) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TableRow, { children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TableCell, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "font-medium",
							children: c.name
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-xs text-muted-foreground",
							children: c.email ?? "—"
						})] }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
							className: "text-sm",
							children: companyTypeLabel(c.company_type)
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
							variant: statusTone(c.activation_status),
							children: titleCase(c.activation_status)
						}) }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
							variant: statusTone(c.verification_status),
							children: titleCase(c.verification_status)
						}) }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
							className: "text-sm text-muted-foreground",
							children: shortDate(c.created_at)
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
							className: "text-right",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex justify-end gap-1",
								children: [
									can("companies.verify") && c.verification_status !== "verified" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
										size: "sm",
										variant: "ghost",
										title: "Verify company",
										onClick: () => updateCompany.mutate({
											id: c.id,
											patch: {
												verification_status: "verified",
												verified_at: (/* @__PURE__ */ new Date()).toISOString()
											}
										}),
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ShieldCheck, { className: "size-4" })
									}),
									can("licence.generate") && c.activation_status !== "active" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
										size: "sm",
										variant: "ghost",
										title: "Generate licence & activate",
										onClick: () => generateLicence.mutate(c.id),
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(KeyRound, { className: "size-4" })
									}),
									can("companies.suspend") && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
										size: "sm",
										variant: "ghost",
										title: c.status === "suspended" ? "Reinstate" : "Suspend",
										onClick: () => updateCompany.mutate({
											id: c.id,
											patch: {
												status: c.status === "suspended" ? "active" : "suspended",
												activation_status: c.status === "suspended" ? "active" : "suspended"
											}
										}),
										children: c.status === "suspended" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleCheck, { className: "size-4" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Ban, { className: "size-4" })
									}),
									can("support.reset_password") && c.email && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
										size: "sm",
										variant: "ghost",
										title: "Reset Password",
										onClick: () => {
											if (confirm("Generate a new temporary password for this company owner?")) resetPassword.mutate(c.email);
										},
										disabled: resetPassword.isPending,
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(KeyRound, { className: "size-4 text-blue-500" })
									}),
									can("companies.delete") && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
										size: "sm",
										variant: "ghost",
										className: "text-destructive hover:bg-destructive/10",
										title: "Delete company and KYC data",
										onClick: () => {
											if (confirm("Are you sure you want to permanently delete this company and all its KYC data?")) deleteCompany.mutate(c.id);
										},
										disabled: deleteCompany.isPending,
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Trash2, { className: "size-4" })
									})
								]
							})
						})
					] }, c.id)) })] })
				})
			})] })
		]
	});
}
//#endregion
export { CompaniesPage as component };
