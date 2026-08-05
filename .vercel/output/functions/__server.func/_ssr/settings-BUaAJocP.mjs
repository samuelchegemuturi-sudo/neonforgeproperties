import { o as __toESM } from "../_runtime.mjs";
import { t as cn } from "./utils-C_uf36nf.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { p as require_jsx_runtime } from "../_libs/@radix-ui/react-avatar+[...].mjs";
import { a as CardHeader, n as CardContent, o as CardTitle, r as CardDescription, t as Card } from "./card-CcQOx-bn.mjs";
import { t as supabase } from "./client-BNXqJcVa.mjs";
import { i as useQueryClient, n as useQuery, t as useMutation } from "../_libs/tanstack__react-query.mjs";
import { i as useAuth, n as BACKGROUNDS, r as useAppStore } from "./auth-BCmnXUlU.mjs";
import { t as Button } from "./button-Bq5vK6RO.mjs";
import { t as Input } from "./input-B8Q2ztVi.mjs";
import { t as Label } from "./label-DBD1bRRP.mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { a as ThemePanel, n as AvatarFallback, r as AvatarImage, t as Avatar } from "./avatar-B0TtxMp4.mjs";
import { n as SwitchThumb, t as Switch$1 } from "../_libs/radix-ui__react-switch.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/settings-BUaAJocP.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var Switch = import_react.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Switch$1, {
	className: cn("peer inline-flex h-5 w-9 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-primary data-[state=unchecked]:bg-input", className),
	...props,
	ref,
	children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SwitchThumb, { className: cn("pointer-events-none block h-4 w-4 rounded-full bg-background shadow-lg ring-0 transition-transform data-[state=checked]:translate-x-4 data-[state=unchecked]:translate-x-0") })
}));
Switch.displayName = Switch$1.displayName;
function UiCustomizer() {
	const { backgroundImage, setBackgroundImage, blurIntensity, setBlurIntensity, glassOpacity, setGlassOpacity } = useAppStore();
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-6 pt-4 border-t border-border mt-4",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "space-y-3",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Background Image" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "grid grid-cols-2 sm:grid-cols-5 gap-3",
				children: BACKGROUNDS.map((bg) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					onClick: () => setBackgroundImage(bg.url),
					className: `relative overflow-hidden rounded-lg aspect-video border-2 transition-all ${backgroundImage === bg.url ? "border-primary" : "border-transparent hover:border-primary/50"}`,
					children: bg.url ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
						src: bg.url,
						alt: bg.label,
						className: "object-cover w-full h-full"
					}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "w-full h-full bg-muted flex items-center justify-center text-xs text-muted-foreground",
						children: bg.label
					})
				}, bg.id))
			})]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "grid sm:grid-cols-2 gap-6",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "space-y-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Glass Frosting (Blur)" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "flex flex-wrap gap-2",
					children: [
						{
							value: "backdrop-blur-sm",
							label: "Light"
						},
						{
							value: "backdrop-blur-md",
							label: "Medium"
						},
						{
							value: "backdrop-blur-xl",
							label: "Heavy"
						},
						{
							value: "backdrop-blur-2xl",
							label: "Extreme"
						},
						{
							value: "backdrop-blur-3xl",
							label: "Max"
						}
					].map((blur) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						variant: blurIntensity === blur.value ? "default" : "outline",
						size: "sm",
						onClick: () => setBlurIntensity(blur.value),
						children: blur.label
					}, blur.value))
				})]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "space-y-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Glass Opacity" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "flex flex-wrap gap-2",
					children: [
						{
							value: "bg-background/20",
							label: "20%"
						},
						{
							value: "bg-background/40",
							label: "40%"
						},
						{
							value: "bg-background/60",
							label: "60%"
						},
						{
							value: "bg-background/80",
							label: "80%"
						}
					].map((op) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						variant: glassOpacity === op.value ? "default" : "outline",
						size: "sm",
						onClick: () => setGlassOpacity(op.value),
						children: op.label
					}, op.value))
				})]
			})]
		})]
	});
}
function CompanySettings() {
	const { access } = useAuth();
	const queryClient = useQueryClient();
	const [isUploading, setIsUploading] = (0, import_react.useState)(false);
	const [companyDraft, setCompanyDraft] = (0, import_react.useState)({ name: access?.company?.name ?? "" });
	const saveCompany = useMutation({
		mutationFn: async () => {
			if (!access?.company?.id) throw new Error("Company unavailable");
			const { error } = await supabase.from("companies").update({ name: companyDraft.name.trim() }).eq("id", access.company.id);
			if (error) throw error;
		},
		onSuccess: () => {
			toast.success("Company settings updated");
			queryClient.invalidateQueries({ queryKey: ["access"] });
		},
		onError: (error) => toast.error(error.message)
	});
	const uploadLogo = async (event) => {
		try {
			if (!event.target.files || event.target.files.length === 0) return;
			const file = event.target.files[0];
			if (!file) return;
			if (!access?.company?.id) throw new Error("Company unavailable");
			const fileExt = file.name.split(".").pop();
			const filePath = `${access.company.id}/logo.${fileExt}`;
			setIsUploading(true);
			const { error: uploadError } = await supabase.storage.from("company_logos").upload(filePath, file, { upsert: true });
			if (uploadError) throw uploadError;
			const { data } = supabase.storage.from("company_logos").getPublicUrl(filePath);
			const { error: updateError } = await supabase.from("companies").update({ logo_url: data.publicUrl }).eq("id", access.company.id);
			if (updateError) throw updateError;
			toast.success("Logo uploaded successfully");
			queryClient.invalidateQueries({ queryKey: ["access"] });
		} catch (error) {
			toast.error(error.message);
		} finally {
			setIsUploading(false);
		}
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-6",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-center gap-6",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Avatar, {
					className: "h-24 w-24 border",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AvatarImage, {
						src: (access?.company)?.logo_url ?? void 0,
						className: "object-contain"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AvatarFallback, {
						className: "text-2xl",
						children: access?.company?.name?.charAt(0) ?? "C"
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "space-y-2",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
							htmlFor: "logo-upload",
							children: "Company Logo"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
							id: "logo-upload",
							type: "file",
							accept: "image/*",
							disabled: isUploading,
							onChange: uploadLogo,
							className: "w-full max-w-sm"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-xs text-muted-foreground",
							children: "Recommended: Square PNG or JPG, at least 200x200px."
						})
					]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "space-y-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Company Name" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
					value: companyDraft.name,
					onChange: (e) => setCompanyDraft((prev) => ({
						...prev,
						name: e.target.value
					})),
					className: "max-w-md"
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
				onClick: () => saveCompany.mutate(),
				disabled: saveCompany.isPending,
				children: saveCompany.isPending ? "Saving..." : "Save Company"
			})
		]
	});
}
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
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardHeader, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardTitle, {
				className: "text-base",
				children: "Appearance"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardDescription, { children: "Saved to your profile and applied on every device." })] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardContent, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ThemePanel, {}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(UiCustomizer, {})] })] }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardHeader, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardTitle, {
				className: "text-base",
				children: "Company Settings"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardDescription, { children: "Update your company name and logo." })] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardContent, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CompanySettings, {}) })] }),
			access?.profile?.is_super_admin && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardHeader, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardTitle, {
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
			})] })
		]
	});
}
//#endregion
export { SettingsPage as component };
