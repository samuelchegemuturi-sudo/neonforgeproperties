import { p as require_jsx_runtime } from "../_libs/@radix-ui/react-avatar+[...].mjs";
import { i as useAuth } from "./auth-BCmnXUlU.mjs";
import { t as Button } from "./button-Bq5vK6RO.mjs";
import { g as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { N as House, X as Building2, d as ShieldCheck, i as Users, nt as ArrowRight, r as Wallet } from "../_libs/lucide-react.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/routes-nVWHBRjo.js
var import_jsx_runtime = require_jsx_runtime();
var FEATURES = [
	{
		icon: ShieldCheck,
		title: "Role-based by design",
		body: "Unlimited roles with a permission matrix. Every menu, page and action follows what the signed-in user is allowed to do."
	},
	{
		icon: Building2,
		title: "Properties and units",
		body: "Register properties, define unit types once and generate every unit automatically with rent, deposit and service charge."
	},
	{
		icon: Wallet,
		title: "Money that reconciles",
		body: "Rent collection, platform and employee commission, held deposits and landlord payouts — calculated on every transaction."
	},
	{
		icon: Users,
		title: "Your whole team",
		body: "Managers, accountants, caretakers, technicians, and receptionists in one isolated company workspace."
	}
];
function Landing() {
	const { session } = useAuth();
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "min-h-screen bg-transparent",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "sticky top-4 z-40 px-4 sm:px-6 mb-4 transition-all duration-300",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", {
					className: "mx-auto flex h-16 max-w-6xl items-center justify-between rounded-full border border-border/40 bg-background/60 px-6 shadow-[0_8px_30px_rgb(0,0,0,0.08)] backdrop-blur-2xl saturate-[1.8]",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-center gap-3",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "flex size-9 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-sm",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(House, { className: "size-5" })
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "text-lg font-semibold tracking-tight",
							children: "Neon Forge Properties"
						})]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "flex items-center gap-3",
						children: session ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							asChild: true,
							size: "sm",
							className: "rounded-full px-5",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
								to: "/dashboard",
								children: "Open dashboard"
							})
						}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							asChild: true,
							variant: "ghost",
							size: "sm",
							className: "rounded-full px-5 hover:bg-muted/60",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
								to: "/auth",
								children: "Sign in"
							})
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							asChild: true,
							size: "sm",
							className: "rounded-full px-5",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
								to: "/auth",
								search: { mode: "signup" },
								children: "Start Free Trial"
							})
						})] })
					})]
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("main", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("section", {
				className: "surface-grid border-b border-border",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mx-auto max-w-6xl px-5 py-24 text-center",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mx-auto mb-5 w-fit rounded-full border border-border bg-card px-3 py-1 text-xs font-medium text-muted-foreground",
							children: "Enterprise property management · Kenya-first"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
							className: "mx-auto max-w-3xl text-4xl font-semibold tracking-tight text-foreground sm:text-6xl",
							children: "One platform for every person who runs your buildings"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mx-auto mt-6 max-w-2xl text-base text-muted-foreground sm:text-lg",
							children: "Neon Forge Properties gives landlords, property managers, accountants and caretakers a single workspace — with data isolated per company and a dashboard generated from each user's permissions."
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "mt-9 flex flex-wrap justify-center gap-3",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								asChild: true,
								size: "lg",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
									to: "/auth",
									search: { mode: "signup" },
									children: ["Start Free Trial ", /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowRight, { className: "size-4" })]
								})
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								asChild: true,
								size: "lg",
								variant: "outline",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
									to: "/auth",
									children: "I already have an account"
								})
							})]
						})
					]
				})
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("section", {
				className: "mx-auto max-w-6xl px-5 py-20",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "grid gap-5 sm:grid-cols-2",
					children: FEATURES.map((f) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "rounded-xl border border-white/40 dark:border-white/10 bg-card/40 dark:bg-card/40 backdrop-blur-xl p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)]",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "flex size-10 items-center justify-center rounded-lg bg-accent text-accent-foreground",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(f.icon, { className: "size-5" })
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
								className: "mt-4 text-lg font-semibold tracking-tight",
								children: f.title
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mt-2 text-sm leading-relaxed text-muted-foreground",
								children: f.body
							})
						]
					}, f.title))
				})
			})] }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("footer", {
				className: "border-t border-border",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "mx-auto max-w-6xl px-5 py-8 text-sm text-muted-foreground",
					children: "Neon Forge Properties — property management platform."
				})
			})
		]
	});
}
//#endregion
export { Landing as component };
