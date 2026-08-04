import { o as __toESM } from "../_runtime.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { p as require_jsx_runtime } from "../_libs/@radix-ui/react-avatar+[...].mjs";
import { a as CardHeader, n as CardContent, o as CardTitle, r as CardDescription, t as Card } from "./card-CcQOx-bn.mjs";
import { t as Button } from "./button-Bq5vK6RO.mjs";
import { t as Input } from "./input-B8Q2ztVi.mjs";
import { t as Label } from "./label-DBD1bRRP.mjs";
import { g as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { d as requestPasswordReset } from "./platform.functions-BTrKAh3m.mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { k as LoaderCircle } from "../_libs/lucide-react.mjs";
import { t as useServerFn } from "./useServerFn-CrZF2pjq.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/forgot-password-CpbKgFDy.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function ForgotPasswordPage() {
	const [busy, setBusy] = (0, import_react.useState)(false);
	const [email, setEmail] = (0, import_react.useState)("");
	const [success, setSuccess] = (0, import_react.useState)(false);
	const resetPassword = useServerFn(requestPasswordReset);
	async function handleSubmit(e) {
		e.preventDefault();
		if (!email) return;
		setBusy(true);
		try {
			await resetPassword({ data: { email } });
			setSuccess(true);
			toast.success("Password reset instructions sent");
		} catch (error) {
			toast.error(error.message || "Failed to request password reset");
		} finally {
			setBusy(false);
		}
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "flex min-h-[100dvh] w-full flex-col items-center justify-center bg-muted/30 p-4 md:p-8",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "mx-auto flex w-full max-w-sm flex-col gap-6",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex flex-col items-center gap-2 text-center",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
						to: "/",
						className: "flex items-center gap-2 font-bold tracking-tight text-xl",
						children: "Neon Forge Properties"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-balance text-sm text-muted-foreground",
						children: "Enter your email to receive a password reset link."
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
					className: "border-muted bg-background/60 shadow-lg backdrop-blur-xl",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardHeader, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardTitle, { children: "Forgot Password" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardDescription, { children: "We'll send you an email with a link to reset your password." })] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardContent, { children: success ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex flex-col space-y-4 text-center",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-sm text-muted-foreground",
							children: "If an account exists with that email, we've sent password reset instructions."
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							asChild: true,
							variant: "outline",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
								to: "/auth",
								children: "Return to Sign in"
							})
						})]
					}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
						onSubmit: handleSubmit,
						className: "grid gap-4",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "grid gap-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
								htmlFor: "email",
								children: "Email"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
								id: "email",
								name: "email",
								type: "email",
								placeholder: "you@example.com",
								required: true,
								disabled: busy,
								value: email,
								onChange: (e) => setEmail(e.target.value)
							})]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
							type: "submit",
							className: "w-full",
							disabled: busy,
							children: [busy ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "mr-2 h-4 w-4 animate-spin" }) : null, "Send Reset Link"]
						})]
					}) })]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "text-center text-sm",
					children: [
						"Remembered your password?",
						" ",
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
							to: "/auth",
							className: "underline underline-offset-4 hover:text-primary",
							children: "Sign in"
						})
					]
				})
			]
		})
	});
}
//#endregion
export { ForgotPasswordPage as component };
