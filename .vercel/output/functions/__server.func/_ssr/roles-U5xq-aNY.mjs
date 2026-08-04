import { o as __toESM } from "../_runtime.mjs";
import { t as cn } from "./utils-C_uf36nf.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { p as require_jsx_runtime } from "../_libs/@radix-ui/react-avatar+[...].mjs";
import { a as CardHeader, n as CardContent, o as CardTitle, r as CardDescription, t as Card } from "./card-CcQOx-bn.mjs";
import { t as supabase } from "./client-BNXqJcVa.mjs";
import { i as useQueryClient, n as useQuery, t as useMutation } from "../_libs/tanstack__react-query.mjs";
import { n as useAuth } from "./auth-D3Dl5b08.mjs";
import { t as Button } from "./button-Bq5vK6RO.mjs";
import { t as Input } from "./input-B8Q2ztVi.mjs";
import { t as Label } from "./label-DBD1bRRP.mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { J as Check, c as Trash2, d as ShieldCheck, k as LoaderCircle, v as Plus } from "../_libs/lucide-react.mjs";
import { n as CheckboxIndicator, t as Checkbox$1 } from "../_libs/@radix-ui/react-checkbox+[...].mjs";
import { t as Badge } from "./badge-D1Dupn2y.mjs";
import { t as Skeleton } from "./skeleton-D9W9wFsj.mjs";
import { a as DialogHeader, i as DialogFooter, n as DialogContent, o as DialogTitle, r as DialogDescription, s as DialogTrigger, t as Dialog } from "./dialog-DIo89e4g.mjs";
import { a as TableHeader, i as TableHead, n as TableBody, o as TableRow, r as TableCell, t as Table } from "./table-C0WYWEQX.mjs";
import { t as Textarea } from "./textarea-kko37XEX.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/roles-U5xq-aNY.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var Checkbox = import_react.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Checkbox$1, {
	ref,
	className: cn("grid place-content-center peer h-4 w-4 shrink-0 rounded-sm border border-primary shadow cursor-pointer focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground", className),
	...props,
	children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CheckboxIndicator, {
		className: cn("grid place-content-center text-current"),
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Check, { className: "h-4 w-4" })
	})
}));
Checkbox.displayName = Checkbox$1.displayName;
function RolesPage() {
	const { access, can } = useAuth();
	const companyId = access?.profile?.company_id ?? null;
	const queryClient = useQueryClient();
	const editable = can("roles.edit");
	const [open, setOpen] = (0, import_react.useState)(false);
	const { data: roles, isLoading: rolesLoading } = useQuery({
		queryKey: ["roles", companyId],
		enabled: Boolean(companyId),
		queryFn: async () => {
			const { data, error } = await supabase.from("roles").select("id, name, slug, description, is_system").eq("company_id", companyId).order("is_system", { ascending: false }).order("name");
			if (error) throw error;
			return data;
		}
	});
	const { data: permissions } = useQuery({
		queryKey: ["permissions"],
		queryFn: async () => {
			const { data, error } = await supabase.from("permissions").select("key, module, action, label, sort_order").order("sort_order");
			if (error) throw error;
			return data;
		}
	});
	const { data: rolePerms } = useQuery({
		queryKey: ["role-permissions", companyId],
		enabled: Boolean(roles?.length),
		queryFn: async () => {
			const { data, error } = await supabase.from("role_permissions").select("role_id, permission_key").in("role_id", (roles ?? []).map((r) => r.id));
			if (error) throw error;
			return data;
		}
	});
	const matrix = (0, import_react.useMemo)(() => {
		const map = /* @__PURE__ */ new Map();
		(rolePerms ?? []).forEach((rp) => {
			if (!map.has(rp.role_id)) map.set(rp.role_id, /* @__PURE__ */ new Set());
			map.get(rp.role_id).add(rp.permission_key);
		});
		return map;
	}, [rolePerms]);
	const modules = (0, import_react.useMemo)(() => {
		const grouped = /* @__PURE__ */ new Map();
		(permissions ?? []).forEach((p) => {
			if (!grouped.has(p.module)) grouped.set(p.module, []);
			grouped.get(p.module).push(p);
		});
		return Array.from(grouped.entries());
	}, [permissions]);
	const toggle = useMutation({
		mutationFn: async (input) => {
			if (input.granted) {
				const { error } = await supabase.from("role_permissions").delete().eq("role_id", input.roleId).eq("permission_key", input.key);
				if (error) throw error;
			} else {
				const { error } = await supabase.from("role_permissions").insert({
					role_id: input.roleId,
					permission_key: input.key
				});
				if (error) throw error;
			}
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["role-permissions", companyId] });
			queryClient.invalidateQueries({ queryKey: ["access"] });
		},
		onError: (e) => toast.error(e.message)
	});
	const createRole = useMutation({
		mutationFn: async (input) => {
			const slug = input.name.toLowerCase().trim().replace(/[^a-z0-9]+/g, "_").replace(/^_|_$/g, "");
			const { error } = await supabase.from("roles").insert({
				company_id: companyId,
				name: input.name,
				slug,
				description: input.description
			});
			if (error) throw error;
		},
		onSuccess: () => {
			toast.success("Role created");
			setOpen(false);
			queryClient.invalidateQueries({ queryKey: ["roles", companyId] });
		},
		onError: (e) => toast.error(e.message)
	});
	const deleteRole = useMutation({
		mutationFn: async (roleId) => {
			const { error } = await supabase.from("roles").delete().eq("id", roleId);
			if (error) throw error;
		},
		onSuccess: () => {
			toast.success("Role deleted");
			queryClient.invalidateQueries({ queryKey: ["roles", companyId] });
		},
		onError: (e) => toast.error(e.message)
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "mx-auto max-w-7xl space-y-6",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex flex-wrap items-end justify-between gap-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
					className: "text-2xl font-semibold tracking-tight",
					children: "Roles & permissions"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-1 text-sm text-muted-foreground",
					children: "Unlimited roles per company. Tick a box to grant a permission — it applies immediately."
				})] }), can("roles.create") && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Dialog, {
					open,
					onOpenChange: setOpen,
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogTrigger, {
						asChild: true,
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, { className: "size-4" }), " New role"] })
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogContent, { children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogHeader, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogTitle, { children: "Create a custom role" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogDescription, { children: "For example Regional Manager, Estate Supervisor or Finance Assistant." })] }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
							id: "role-form",
							className: "space-y-4",
							onSubmit: (e) => {
								e.preventDefault();
								const fd = new FormData(e.currentTarget);
								createRole.mutate({
									name: String(fd.get("name")),
									description: String(fd.get("description") ?? "")
								});
							},
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "space-y-1.5",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
									htmlFor: "role-name",
									children: "Role name"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
									id: "role-name",
									name: "name",
									required: true
								})]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "space-y-1.5",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
									htmlFor: "role-desc",
									children: "Description"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Textarea, {
									id: "role-desc",
									name: "description",
									rows: 3
								})]
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogFooter, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
							type: "submit",
							form: "role-form",
							disabled: createRole.isPending,
							children: [createRole.isPending && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "size-4 animate-spin" }), " Create role"]
						}) })
					] })]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid gap-4 md:grid-cols-2 xl:grid-cols-4",
				children: [rolesLoading && Array.from({ length: 4 }).map((_, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "h-28 rounded-xl" }, i)), (roles ?? []).map((role) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
					className: "shadow-[var(--shadow-card)]",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardHeader, {
						className: "pb-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-start justify-between gap-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardTitle, {
								className: "text-base",
								children: role.name
							}), role.is_system ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
								variant: "secondary",
								children: "System"
							}) : can("roles.delete") && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								variant: "ghost",
								size: "icon",
								"aria-label": `Delete ${role.name}`,
								onClick: () => deleteRole.mutate(role.id),
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Trash2, { className: "size-4" })
							})]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardDescription, {
							className: "line-clamp-2",
							children: role.description ?? "Custom role"
						})]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardContent, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "text-xs text-muted-foreground",
						children: [matrix.get(role.id)?.size ?? 0, " permissions"]
					}) })]
				}, role.id))]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardHeader, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardTitle, {
				className: "flex items-center gap-2 text-base",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ShieldCheck, { className: "size-4" }), " Permission matrix"]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardDescription, { children: editable ? "Changes save instantly." : "Read-only — you do not have permission to edit roles." })] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardContent, {
				className: "overflow-x-auto",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Table, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHeader, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TableRow, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, {
					className: "min-w-56",
					children: "Permission"
				}), (roles ?? []).map((r) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, {
					className: "text-center whitespace-nowrap",
					children: r.name
				}, r.id))] }) }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableBody, { children: modules.map(([moduleName, perms]) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableRow, {
					className: "bg-muted/50 hover:bg-muted/50",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
						colSpan: (roles?.length ?? 0) + 1,
						className: "text-xs font-semibold uppercase tracking-wide text-muted-foreground",
						children: moduleName
					})
				}, moduleName), perms.map((p) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TableRow, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
					className: "text-sm",
					children: p.label
				}), (roles ?? []).map((r) => {
					const granted = matrix.get(r.id)?.has(p.key) ?? false;
					return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
						className: "text-center",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Checkbox, {
							checked: granted,
							disabled: !editable || toggle.isPending,
							"aria-label": `${p.label} for ${r.name}`,
							onCheckedChange: () => toggle.mutate({
								roleId: r.id,
								key: p.key,
								granted
							})
						})
					}, r.id);
				})] }, p.key))] })) })] })
			})] })
		]
	});
}
//#endregion
export { RolesPage as component };
