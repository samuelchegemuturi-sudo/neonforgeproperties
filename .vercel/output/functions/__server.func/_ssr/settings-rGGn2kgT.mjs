import { o as __toESM } from "../_runtime.mjs";
import { t as cn } from "./utils-C_uf36nf.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { p as require_jsx_runtime } from "../_libs/@radix-ui/react-avatar+[...].mjs";
import { a as CardHeader, n as CardContent, o as CardTitle, r as CardDescription, t as Card } from "./card-CcQOx-bn.mjs";
import { t as supabase } from "./client-BNXqJcVa.mjs";
import { i as useQueryClient, n as useQuery, t as useMutation } from "../_libs/tanstack__react-query.mjs";
import { n as useAuth } from "./auth-D3Dl5b08.mjs";
import { t as Label } from "./label-DBD1bRRP.mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { n as ThemePanel } from "./theme-panel-SfPTTgfx.mjs";
import { n as SwitchThumb, t as Switch$1 } from "../_libs/radix-ui__react-switch.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/settings-rGGn2kgT.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var Switch = import_react.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Switch$1, {
	className: cn("peer inline-flex h-5 w-9 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-primary data-[state=unchecked]:bg-input", className),
	...props,
	ref,
	children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SwitchThumb, { className: cn("pointer-events-none block h-4 w-4 rounded-full bg-background shadow-lg ring-0 transition-transform data-[state=checked]:translate-x-4 data-[state=unchecked]:translate-x-0") })
}));
Switch.displayName = Switch$1.displayName;
function SettingsPage() {
	const { access, can } = useAuth();
	const queryClient = useQueryClient();
	can("settings.edit") || access?.profile?.is_super_admin;
	const [profileDraft, setProfileDraft] = (0, import_react.useState)({
		full_name: access?.profile?.full_name ?? "",
		position: access?.profile?.position ?? "",
		phone: access?.profile?.phone ?? ""
	});
	const [companyDraft, setCompanyDraft] = (0, import_react.useState)({
		name: access?.company?.name ?? "",
		currency: access?.company?.currency ?? "KES",
		country: access?.company?.country ?? "KE"
	});
	const [settingDraft, setSettingDraft] = (0, import_react.useState)({});
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
	useMutation({
		mutationFn: async () => {
			if (!access?.profile?.id) throw new Error("Profile unavailable");
			const { error } = await supabase.from("profiles").update({
				full_name: profileDraft.full_name.trim(),
				position: profileDraft.position.trim(),
				phone: profileDraft.phone.trim()
			}).eq("id", access.profile.id);
			if (error) throw error;
		},
		onSuccess: () => {
			toast.success("Profile updated");
			queryClient.invalidateQueries({ queryKey: ["access"] });
		},
		onError: (error) => toast.error(error.message)
	});
	useMutation({
		mutationFn: async () => {
			if (!access?.company?.id) throw new Error("Company unavailable");
			const { error } = await supabase.from("companies").update({
				name: companyDraft.name.trim(),
				currency: companyDraft.currency.trim().toUpperCase(),
				country: companyDraft.country.trim().toUpperCase()
			}).eq("id", access.company.id);
			if (error) throw error;
		},
		onSuccess: () => {
			toast.success("Company settings updated");
			queryClient.invalidateQueries({ queryKey: ["access"] });
		},
		onError: (error) => toast.error(error.message)
	});
	const saveSetting = useMutation({
		mutationFn: async ({ key, value }) => {
			const { error } = await supabase.from("platform_settings").update({ value }).eq("key", key);
			if (error) throw error;
		},
		onSuccess: () => {
			toast.success("Settings updated");
			queryClient.invalidateQueries({ queryKey: ["platform-settings"] });
			queryClient.invalidateQueries({ queryKey: ["feature-flags"] });
		},
		onError: (error) => toast.error(error.message)
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-6",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardHeader, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardTitle, {
			className: "text-base",
			children: "Appearance"
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardDescription, { children: "Saved to your profile and applied on every device." })] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardContent, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ThemePanel, {}) })] }), access?.profile?.is_super_admin && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardHeader, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardTitle, {
			className: "text-base",
			children: "Features & Modules"
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardDescription, { children: "Toggle specific modules on or off for the entire platform." })] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardContent, {
			className: "space-y-4",
			children: [groupedSettings["Features & Modules"]?.map((setting) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-center justify-between",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "space-y-0.5",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: setting.label })
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Switch, {
					checked: setting.value === "true",
					onCheckedChange: (checked) => saveSetting.mutate({
						key: setting.key,
						value: String(checked)
					})
				})]
			}, setting.key)), !groupedSettings["Features & Modules"]?.length && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "text-sm text-muted-foreground",
				children: "No feature flags available."
			})]
		})] })]
	});
}
//#endregion
export { SettingsPage as component };
