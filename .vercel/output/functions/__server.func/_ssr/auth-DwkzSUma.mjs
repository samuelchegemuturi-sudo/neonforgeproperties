import { o as __toESM } from "../_runtime.mjs";
import { t as cn } from "./utils-C_uf36nf.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { p as require_jsx_runtime } from "../_libs/@radix-ui/react-avatar+[...].mjs";
import { a as CardHeader, n as CardContent, o as CardTitle, r as CardDescription, t as Card } from "./card-CcQOx-bn.mjs";
import { t as supabase } from "./client-BNXqJcVa.mjs";
import { n as useAuth } from "./auth-D3Dl5b08.mjs";
import { t as Button } from "./button-Bq5vK6RO.mjs";
import { t as Input } from "./input-B8Q2ztVi.mjs";
import { t as Label } from "./label-DBD1bRRP.mjs";
import { _ as useNavigate, g as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { t as Route } from "./auth-DjMDIlvi.mjs";
import { l as registerUserFn } from "./platform.functions-BTrKAh3m.mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { N as House, k as LoaderCircle } from "../_libs/lucide-react.mjs";
import { i as Trigger, n as List, r as Root2, t as Content } from "../_libs/radix-ui__react-tabs.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/auth-DwkzSUma.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var Tabs = Root2;
var TabsList = import_react.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(List, {
	ref,
	className: cn("inline-flex h-9 items-center justify-center rounded-lg bg-muted p-1 text-muted-foreground", className),
	...props
}));
TabsList.displayName = List.displayName;
var TabsTrigger = import_react.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Trigger, {
	ref,
	className: cn("inline-flex items-center justify-center whitespace-nowrap rounded-md px-3 py-1 text-sm font-medium ring-offset-background cursor-pointer transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 disabled:cursor-not-allowed data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow", className),
	...props
}));
TabsTrigger.displayName = Trigger.displayName;
var TabsContent = import_react.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Content, {
	ref,
	className: cn("mt-2 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2", className),
	...props
}));
TabsContent.displayName = Content.displayName;
var ROLE_TEMPLATES = {
	landlord: {
		name: "Landlord",
		slug: "landlord",
		description: "Company owner with full access.",
		prefixes: [
			"dashboard",
			"property",
			"unit",
			"tenant",
			"finance",
			"maintenance",
			"employees",
			"roles",
			"listing",
			"reports",
			"settings",
			"audit"
		]
	},
	property_manager: {
		name: "Property Manager",
		slug: "property_manager",
		description: "Day-to-day property operations.",
		prefixes: [
			"dashboard",
			"property",
			"unit",
			"tenant",
			"maintenance",
			"listing",
			"reports"
		]
	},
	accountant: {
		name: "Accountant",
		slug: "accountant",
		description: "Finance and reporting access.",
		prefixes: [
			"dashboard",
			"finance",
			"reports",
			"tenant"
		]
	},
	tenant: {
		name: "Tenant",
		slug: "tenant",
		description: "Tenant-only workspace access.",
		prefixes: ["dashboard", "tenant"]
	},
	employee: {
		name: "Employee",
		slug: "employee",
		description: "Team member access for day-to-day operations.",
		prefixes: [
			"dashboard",
			"tenant",
			"property",
			"unit",
			"maintenance",
			"verification"
		]
	}
};
function AuthPage() {
	const { session, access, accessLoading } = useAuth();
	const { mode = "signin" } = Route.useSearch();
	const navigate = useNavigate({ from: Route.fullPath });
	const [busy, setBusy] = (0, import_react.useState)(false);
	const [pendingRole, setPendingRole] = (0, import_react.useState)(null);
	const needsRoleSelection = Boolean(session && !accessLoading && !access?.profile?.is_super_admin && !access?.roles.length);
	(0, import_react.useEffect)(() => {
		if (session && !accessLoading && access?.roles.length) navigate({
			to: "/dashboard",
			replace: true
		});
	}, [
		session,
		accessLoading,
		access?.roles.length,
		navigate
	]);
	async function assignRole(roleSlug) {
		if (!session?.user.id) return;
		const template = ROLE_TEMPLATES[roleSlug];
		setBusy(true);
		setPendingRole(roleSlug);
		try {
			const { data: existingRole, error: existingRoleError } = await supabase.from("roles").select("id").is("company_id", null).eq("slug", template.slug).maybeSingle();
			if (existingRoleError) throw existingRoleError;
			let roleId = existingRole?.id;
			if (!roleId) {
				const { data: insertedRole, error: insertRoleError } = await supabase.from("roles").insert({
					company_id: null,
					name: template.name,
					slug: template.slug,
					description: template.description,
					is_system: true
				}).select("id").single();
				if (insertRoleError) throw insertRoleError;
				roleId = insertedRole.id;
				const { data: permissions, error: permissionsError } = await supabase.from("permissions").select("key");
				if (permissionsError) throw permissionsError;
				const keys = (permissions ?? []).filter((row) => template.prefixes.includes(row.key.split(".")[0])).map((row) => ({
					role_id: roleId,
					permission_key: row.key
				}));
				if (keys.length) {
					const { error: rolePermError } = await supabase.from("role_permissions").insert(keys);
					if (rolePermError) throw rolePermError;
				}
			}
			const { error: roleAssignError } = await supabase.from("user_roles").upsert({
				user_id: session.user.id,
				role_id: roleId,
				company_id: null
			}, { onConflict: "user_id,role_id,company_id" });
			if (roleAssignError) throw roleAssignError;
			toast.success(`${template.name} role assigned. Redirecting to your dashboard...`);
			navigate({
				to: "/dashboard",
				replace: true
			});
		} catch (error) {
			console.error(error);
			toast.error("We couldn’t assign your role. Please try again.");
		} finally {
			setBusy(false);
			setPendingRole(null);
		}
	}
	async function handleSignIn(e) {
		e.preventDefault();
		const form = new FormData(e.currentTarget);
		setBusy(true);
		const { error } = await supabase.auth.signInWithPassword({
			email: String(form.get("email")).trim(),
			password: String(form.get("password"))
		});
		setBusy(false);
		if (error) {
			toast.error(error.message);
			return;
		}
		toast.success("Welcome back");
		navigate({ to: "/dashboard" });
	}
	async function handleSignUp(e) {
		e.preventDefault();
		const form = new FormData(e.currentTarget);
		setBusy(true);
		try {
			const email = String(form.get("email")).trim();
			const password = String(form.get("password"));
			const full_name = String(form.get("full_name"));
			await registerUserFn({ data: {
				email,
				password,
				full_name
			} });
			const { error } = await supabase.auth.signInWithPassword({
				email,
				password
			});
			if (error) {
				toast.error(error.message);
				return;
			}
			toast.success("Account created successfully. Welcome!");
			navigate({ to: "/dashboard" });
		} catch (err) {
			toast.error(err.message);
		} finally {
			setBusy(false);
		}
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "grid min-h-screen lg:grid-cols-2",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "surface-grid hidden flex-col justify-between border-r border-border p-12 lg:flex",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
					to: "/",
					className: "flex items-center gap-2.5",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "flex size-8 items-center justify-center rounded-md bg-primary text-primary-foreground",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(House, { className: "size-4" })
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "text-lg font-semibold tracking-tight",
						children: "Neon Forge Properties"
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "max-w-md",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
						className: "text-3xl font-semibold tracking-tight",
						children: "Every role sees exactly what it should."
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-4 text-sm leading-relaxed text-muted-foreground",
						children: "Sign in and Neon Forge Properties loads your company, your role and your permissions, then builds your dashboard around them."
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-xs text-muted-foreground",
					children: "Multi-tenant · Role-based · Audit ready"
				})
			]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "flex items-center justify-center px-5 py-12",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "w-full max-w-sm",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
						className: "text-2xl font-semibold tracking-tight",
						children: "Welcome to Neon Forge Properties"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-1 text-sm text-muted-foreground",
						children: "Manage your portfolio and your team in one place."
					}),
					needsRoleSelection && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
						className: "mt-6 border-primary/30 bg-primary/5",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardHeader, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardTitle, {
							className: "text-base",
							children: "Choose your role"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardDescription, { children: "Your Google account is signed in. Pick the role you want to apply for before you continue to the dashboard." })] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardContent, {
							className: "grid gap-2",
							children: Object.entries(ROLE_TEMPLATES).map(([key, role]) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
								variant: "outline",
								className: "justify-start",
								onClick: () => void assignRole(key),
								disabled: busy,
								children: [busy && pendingRole === key && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "mr-2 size-4 animate-spin" }), role.name]
							}, key))
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Tabs, {
						value: mode,
						onValueChange: (v) => navigate({ search: { mode: v } }),
						className: "mt-7",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TabsList, {
								className: "grid w-full grid-cols-2",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabsTrigger, {
									value: "signin",
									children: "Sign In"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabsTrigger, {
									value: "signup",
									children: "Free Trial"
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabsContent, {
								value: "signin",
								className: "mt-4",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
									onSubmit: handleSignIn,
									className: "space-y-4",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "space-y-1.5",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
												htmlFor: "si-email",
												children: "Email"
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
												id: "si-email",
												name: "email",
												type: "email",
												required: true,
												autoComplete: "email"
											})]
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "space-y-1.5",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
												htmlFor: "si-password",
												children: "Password"
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
												id: "si-password",
												name: "password",
												type: "password",
												required: true,
												autoComplete: "current-password"
											})]
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
											type: "submit",
											className: "w-full",
											disabled: busy,
											children: [busy && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "mr-2 size-4 animate-spin" }), " Sign in"]
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
											to: "/forgot-password",
											className: "w-full text-center text-xs text-muted-foreground underline-offset-4 hover:underline mt-2 block",
											children: "Forgot your password?"
										})
									]
								})
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabsContent, {
								value: "signup",
								className: "mt-4",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
									onSubmit: handleSignUp,
									className: "space-y-4",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "space-y-1.5",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
												htmlFor: "su-name",
												children: "Full Name"
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
												id: "su-name",
												name: "full_name",
												type: "text",
												required: true,
												autoComplete: "name"
											})]
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "space-y-1.5",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
												htmlFor: "su-email",
												children: "Email"
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
												id: "su-email",
												name: "email",
												type: "email",
												required: true,
												autoComplete: "email"
											})]
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "space-y-1.5",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
												htmlFor: "su-password",
												children: "Password"
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
												id: "su-password",
												name: "password",
												type: "password",
												required: true,
												autoComplete: "new-password",
												minLength: 6
											})]
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
											type: "submit",
											className: "w-full",
											disabled: busy,
											children: [busy && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "mr-2 size-4 animate-spin" }), " Sign Up & Start Trial"]
										})
									]
								})
							})
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-8 text-center text-xs text-muted-foreground",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
							to: "/",
							className: "underline-offset-4 hover:underline",
							children: "Back to home"
						})
					})
				]
			})
		})]
	});
}
//#endregion
export { AuthPage as component };
