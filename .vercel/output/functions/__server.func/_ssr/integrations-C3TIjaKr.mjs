import { o as __toESM } from "../_runtime.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { p as require_jsx_runtime } from "../_libs/@radix-ui/react-avatar+[...].mjs";
import { a as CardHeader, i as CardFooter, n as CardContent, o as CardTitle, r as CardDescription, t as Card } from "./card-CcQOx-bn.mjs";
import { t as supabase } from "./client-BNXqJcVa.mjs";
import { i as useQueryClient, n as useQuery, t as useMutation } from "../_libs/tanstack__react-query.mjs";
import { i as useAuth } from "./auth-BCmnXUlU.mjs";
import { t as Button } from "./button-Bq5vK6RO.mjs";
import { t as Input } from "./input-B8Q2ztVi.mjs";
import { t as Label } from "./label-DBD1bRRP.mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { U as CircleCheck, W as CircleAlert, g as Save, y as Plug } from "../_libs/lucide-react.mjs";
import { t as Badge } from "./badge-D1Dupn2y.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/integrations-C3TIjaKr.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var MARKETPLACE_CATEGORIES = [
	"Payment Gateways",
	"Smart Meters",
	"SMS Providers",
	"Email Providers",
	"Maps",
	"Tax Services",
	"Storage",
	"AI Services",
	"Analytics",
	"Identity Verification",
	"API Keys",
	"Feature Flags"
];
function IntegrationsComponent() {
	const { access, can } = useAuth();
	const queryClient = useQueryClient();
	const editable = can("system.settings") || access?.profile?.is_super_admin;
	const [settingDraft, setSettingDraft] = (0, import_react.useState)({});
	const [activeTab, setActiveTab] = (0, import_react.useState)("Payment Gateways");
	const { data: platformSettings = [] } = useQuery({
		queryKey: ["platform-settings"],
		queryFn: async () => {
			const { data, error } = await supabase.from("platform_settings").select("key, value, label, category").order("category").order("key");
			if (error) throw error;
			return data;
		}
	});
	const groupedSettings = (0, import_react.useMemo)(() => {
		return platformSettings.reduce((acc, item) => {
			const bucket = item.category || "General";
			acc[bucket] ??= [];
			acc[bucket].push(item);
			return acc;
		}, {});
	}, [platformSettings]);
	const saveSetting = useMutation({
		mutationFn: async (settingsToSave) => {
			const { error } = await supabase.from("platform_settings").upsert(settingsToSave.map((s) => ({
				key: s.key,
				value: s.value
			})), { onConflict: "key" });
			if (error) throw error;
		},
		onSuccess: () => {
			toast.success("Settings saved successfully");
			queryClient.invalidateQueries({ queryKey: ["platform-settings"] });
		},
		onError: (error) => toast.error(error.message)
	});
	const handleSaveCategory = (category) => {
		const rows = groupedSettings[category] || [];
		const changed = rows.map((row) => {
			const raw = settingDraft[row.key] ?? String(row.value ?? "");
			const parsed = raw === "true" ? true : raw === "false" ? false : raw;
			return {
				key: row.key,
				value: parsed
			};
		}).filter((s) => {
			const original = rows.find((r) => r.key === s.key);
			return String(original?.value ?? "") !== String(s.value);
		});
		if (changed.length > 0) saveSetting.mutate(changed);
		else toast.info("No changes to save");
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "mx-auto max-w-6xl space-y-6 p-6",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex items-center gap-3",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plug, { className: "size-5" })
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
				className: "text-2xl font-semibold tracking-tight",
				children: "Integration Marketplace"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-1 text-sm text-muted-foreground",
				children: "Configure APIs, smart meters, payment gateways, and third-party services in one place."
			})] })]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex flex-col space-y-8 lg:flex-row lg:space-x-12 lg:space-y-0",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("aside", {
				className: "lg:w-1/4",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("nav", {
					className: "flex space-x-2 lg:flex-col lg:space-x-0 lg:space-y-1 overflow-x-auto pb-4 lg:pb-0",
					children: MARKETPLACE_CATEGORIES.map((category) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
						onClick: () => setActiveTab(category),
						className: `flex items-center justify-between rounded-md px-3 py-2 text-sm font-medium transition-colors whitespace-nowrap ${activeTab === category ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-muted hover:text-foreground"}`,
						children: [category, groupedSettings[category]?.some((s) => s.value && s.value !== "false" && !String(s.value).includes("placeholder")) ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleCheck, { className: "size-4 text-green-500" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
							variant: "secondary",
							className: "text-[10px] ml-2",
							children: "Config"
						})]
					}, category))
				})
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "flex-1",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, { children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardHeader, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardTitle, { children: activeTab }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardDescription, { children: [
						"Configure credentials and preferences for ",
						activeTab.toLowerCase(),
						"."
					] })] }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardContent, { children: groupedSettings[activeTab] && groupedSettings[activeTab].length > 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "space-y-4",
						children: groupedSettings[activeTab].map((row) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "grid gap-2",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
									htmlFor: row.key,
									children: row.label
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
									id: row.key,
									type: row.key.includes("secret") || row.key.includes("password") || row.key.includes("token") ? "password" : "text",
									placeholder: `Enter ${row.label}`,
									defaultValue: String(row.value ?? ""),
									readOnly: !editable,
									onChange: (e) => setSettingDraft((draft) => ({
										...draft,
										[row.key]: e.target.value
									})),
									className: String(row.value).includes("placeholder") ? "border-amber-500/50" : ""
								}),
								String(row.value).includes("placeholder") && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
									className: "text-xs text-amber-500 flex items-center gap-1",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleAlert, { className: "size-3" }), " Needs configuration"]
								})
							]
						}, row.key))
					}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex flex-col items-center justify-center py-12 text-center",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plug, { className: "size-12 text-muted-foreground/50 mb-4" }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
								className: "text-lg font-semibold",
								children: "No settings found"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
								className: "text-sm text-muted-foreground max-w-sm mt-1",
								children: [
									"There are no configuration keys available for ",
									activeTab,
									" yet."
								]
							})
						]
					}) }),
					groupedSettings[activeTab] && groupedSettings[activeTab].length > 0 && editable && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardFooter, {
						className: "border-t px-6 py-4",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
							onClick: () => handleSaveCategory(activeTab),
							disabled: saveSetting.isPending,
							className: "ml-auto",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Save, { className: "mr-2 size-4" }), "Save Changes"]
						})
					})
				] })
			})]
		})]
	});
}
//#endregion
export { IntegrationsComponent as component };
