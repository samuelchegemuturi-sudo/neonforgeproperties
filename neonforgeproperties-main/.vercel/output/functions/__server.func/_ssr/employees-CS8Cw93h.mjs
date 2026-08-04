import { i as __toESM } from "../_runtime.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { p as require_jsx_runtime } from "../_libs/@radix-ui/react-avatar+[...].mjs";
import { a as CardHeader, n as CardContent, o as CardTitle, r as CardDescription, t as Card } from "./card-BfBj_YIE.mjs";
import { t as supabase } from "./client-BNXqJcVa.mjs";
import { i as useQueryClient, n as useQuery, t as useMutation } from "../_libs/tanstack__react-query.mjs";
import { n as useAuth } from "./auth-D3Dl5b08.mjs";
import { t as Button } from "./button-Bq5vK6RO.mjs";
import { t as Input } from "./input-B8Q2ztVi.mjs";
import { t as Label } from "./label-DBD1bRRP.mjs";
import { a as adminResetTemporaryPassword, i as adminDeleteUser, o as companyCreateEmployee, u as sendEmailFn } from "./platform.functions-xhJW-uih.mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { B as Copy, U as CircleCheck, a as UserCog, c as Trash2, v as Plus } from "../_libs/lucide-react.mjs";
import { t as useServerFn } from "./useServerFn-CrZF2pjq.mjs";
import { t as Skeleton } from "./skeleton-D9W9wFsj.mjs";
import { t as Badge } from "./badge-D1Dupn2y.mjs";
import { a as DialogHeader, i as DialogFooter, n as DialogContent, o as DialogTitle, r as DialogDescription, s as DialogTrigger, t as Dialog } from "./dialog-DIo89e4g.mjs";
import { a as SelectValue, i as SelectTrigger, n as SelectContent, r as SelectItem, t as Select } from "./select-Dg1urBTx.mjs";
import { a as TableHeader, i as TableHead, n as TableBody, o as TableRow, r as TableCell, t as Table } from "./table-C0WYWEQX.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/employees-CS8Cw93h.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function EmployeesPage() {
	const { access, can } = useAuth();
	const companyId = access?.profile?.company_id ?? null;
	const isSuper = access?.profile?.is_super_admin;
	const queryClient = useQueryClient();
	const editable = can("employees.create") || isSuper;
	const queryEnabled = Boolean(companyId) || Boolean(isSuper);
	const [open, setOpen] = (0, import_react.useState)(false);
	const [credentials, setCredentials] = (0, import_react.useState)(null);
	const { data: roles } = useQuery({
		queryKey: [
			"roles",
			companyId,
			isSuper
		],
		enabled: queryEnabled,
		queryFn: async () => {
			let query = supabase.from("roles").select("id, name").order("name");
			if (companyId) query = query.eq("company_id", companyId);
			else query = query.is("company_id", null);
			const { data, error } = await query;
			if (error) throw error;
			return data;
		}
	});
	const { data: employees, isLoading } = useQuery({
		queryKey: [
			"employees",
			companyId,
			isSuper
		],
		enabled: queryEnabled,
		queryFn: async () => {
			let profilesQuery = supabase.from("profiles").select("id, full_name, email, position, status").order("full_name");
			if (companyId) profilesQuery = profilesQuery.eq("company_id", companyId);
			else profilesQuery = profilesQuery.is("company_id", null);
			const { data: profiles, error } = await profilesQuery;
			if (error) throw error;
			let rolesQuery = supabase.from("user_roles").select("user_id, role_id, roles(name)");
			if (companyId) rolesQuery = rolesQuery.eq("company_id", companyId);
			else rolesQuery = rolesQuery.is("company_id", null);
			const { data: userRoles, error: rolesError } = await rolesQuery;
			if (rolesError) throw rolesError;
			const rolesMap = new Map(userRoles.map((ur) => [ur.user_id, ur.roles?.name]));
			return profiles.map((p) => ({
				...p,
				role_name: rolesMap.get(p.id) || "No Role"
			}));
		}
	});
	const sendEmail = useServerFn(sendEmailFn);
	const createFn = useServerFn(companyCreateEmployee);
	const createEmployee = useMutation({
		mutationFn: (input) => createFn({ data: input }),
		onSuccess: async (result, variables) => {
			setCredentials({
				email: result.email,
				temporaryPassword: result.temporaryPassword
			});
			setOpen(false);
			queryClient.invalidateQueries({ queryKey: [
				"employees",
				companyId,
				isSuper
			] });
			toast.success("Employee created successfully");
			await sendEmail({ data: {
				to: result.email,
				subject: "Welcome to Neon Forge Properties - Your Employee Account",
				htmlContent: `
            <h1>Welcome to Neon Forge Properties!</h1>
            <p>Hello ${variables.full_name},</p>
            <p>You have been added as an employee. You can log in using this email address and the following temporary password:</p>
            <p><strong>${result.temporaryPassword}</strong></p>
            <p>Please log in and change your password immediately.</p>
          `
			} });
		},
		onError: (e) => toast.error(e.message)
	});
	const resetPasswordFn = useServerFn(adminResetTemporaryPassword);
	const resetPassword = useMutation({
		mutationFn: (email) => resetPasswordFn({ data: { email } }),
		onSuccess: (result, email) => {
			setCredentials({
				email,
				temporaryPassword: result.temporaryPassword
			});
			toast.success("Temporary password generated");
		},
		onError: (error) => toast.error(error.message)
	});
	const deleteUserFn = useServerFn(adminDeleteUser);
	const deleteEmployee = useMutation({
		mutationFn: async (id) => {
			await deleteUserFn({ data: { targetUserId: id } });
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: [
				"employees",
				companyId,
				isSuper
			] });
			toast.success("Employee deleted");
		},
		onError: (error) => toast.error(error.message)
	});
	if (!companyId && !isSuper) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "p-6",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Card, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardHeader, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardTitle, { children: "Employees" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardDescription, { children: "You must belong to a company to manage employees." })] }) })
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex flex-col gap-6 p-6",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
					className: "text-2xl font-semibold tracking-tight",
					children: "Employees"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-sm text-muted-foreground",
					children: "Manage your team members and assign roles."
				})] }), editable && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Dialog, {
					open,
					onOpenChange: setOpen,
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogTrigger, {
						asChild: true,
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, { className: "mr-2 size-4" }), "Add Employee"] })
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogContent, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogHeader, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogTitle, { children: "Add Employee" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogDescription, { children: "Create a new employee account. They will be assigned a temporary password." })] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
						onSubmit: (e) => {
							e.preventDefault();
							const fd = new FormData(e.currentTarget);
							createEmployee.mutate({
								full_name: fd.get("full_name"),
								email: fd.get("email"),
								position: fd.get("position"),
								role_id: fd.get("role_id")
							});
						},
						className: "grid gap-4 py-4",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "grid gap-2",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
									htmlFor: "full_name",
									children: "Full Name"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
									id: "full_name",
									name: "full_name",
									required: true,
									placeholder: "John Doe"
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "grid gap-2",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
									htmlFor: "email",
									children: "Email"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
									id: "email",
									name: "email",
									type: "email",
									required: true,
									placeholder: "john@example.com"
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "grid gap-2",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
									htmlFor: "position",
									children: "Position / Job Title"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
									id: "position",
									name: "position",
									required: true,
									placeholder: "Property Manager"
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "grid gap-2",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
									htmlFor: "role_id",
									children: "Role"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
									name: "role_id",
									required: true,
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, { placeholder: "Select a role" }) }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectContent, { children: roles?.map((r) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
										value: r.id,
										children: r.name
									}, r.id)) })]
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogFooter, {
								className: "mt-4",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
									type: "submit",
									disabled: createEmployee.isPending,
									children: [createEmployee.isPending && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(UserCog, { className: "mr-2 size-4 animate-spin" }), "Create Employee"]
								})
							})
						]
					})] })]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Dialog, {
				open: !!credentials,
				onOpenChange: (o) => !o && setCredentials(null),
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogContent, { children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogHeader, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogTitle, {
						className: "flex items-center gap-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleCheck, { className: "size-5 text-emerald-500" }), " Employee Created"]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogDescription, { children: "Please copy these credentials and send them to the employee securely. They will be prompted to change their password on first login." })] }),
					credentials && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "grid gap-4 py-4",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "grid gap-1.5",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Login Email" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("code", {
								className: "relative rounded bg-muted px-[0.3rem] py-[0.2rem] font-mono text-sm font-semibold",
								children: credentials.email
							})]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "grid gap-1.5",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Temporary Password" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex items-center gap-2",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("code", {
									className: "relative flex-1 rounded bg-muted px-[0.3rem] py-[0.2rem] font-mono text-sm font-semibold",
									children: credentials.temporaryPassword
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
									variant: "outline",
									size: "icon",
									onClick: () => {
										navigator.clipboard.writeText(credentials.temporaryPassword);
										toast.success("Password copied to clipboard");
									},
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Copy, { className: "size-4" })
								})]
							})]
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogFooter, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						onClick: () => setCredentials(null),
						children: "Done"
					}) })
				] })
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Card, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardContent, {
				className: "p-0",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Table, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHeader, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TableRow, { children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, {
						className: "pl-6",
						children: "Name"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, { children: "Email" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, { children: "Position" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, { children: "Role" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, { children: "Status" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, {
						className: "text-right",
						children: "Actions"
					})
				] }) }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableBody, { children: isLoading ? Array.from({ length: 3 }).map((_, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TableRow, { children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
						className: "pl-6",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "h-4 w-[120px]" })
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "h-4 w-[150px]" }) }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "h-4 w-[100px]" }) }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "h-4 w-[80px]" }) }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "h-4 w-[60px]" }) }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {})
				] }, i)) : !employees?.length ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableRow, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
					colSpan: 6,
					className: "h-24 text-center text-muted-foreground",
					children: "No employees found."
				}) }) : employees.map((emp) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TableRow, { children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
						className: "pl-6 font-medium",
						children: emp.full_name || "—"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
						className: "text-muted-foreground",
						children: emp.email || "—"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, { children: emp.position || "—" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
						variant: "outline",
						children: emp.role_name
					}) }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
						variant: emp.status === "active" ? "default" : "secondary",
						children: emp.status
					}) }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
						className: "text-right",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex justify-end gap-1",
							children: [can("support.reset_password") && emp.email && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								size: "sm",
								variant: "ghost",
								title: "Reset Password",
								onClick: () => {
									if (confirm("Generate a new temporary password for this employee?")) resetPassword.mutate(emp.email);
								},
								disabled: resetPassword.isPending,
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(UserCog, { className: "size-4 text-blue-500" })
							}), can("employees.delete") && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								size: "sm",
								variant: "ghost",
								className: "text-destructive hover:bg-destructive/10",
								title: "Delete Employee",
								onClick: () => {
									if (confirm("Are you sure you want to permanently delete this employee?")) deleteEmployee.mutate(emp.id);
								},
								disabled: deleteEmployee.isPending,
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Trash2, { className: "size-4" })
							})]
						})
					})
				] }, emp.id)) })] })
			}) })
		]
	});
}
//#endregion
export { EmployeesPage as component };
