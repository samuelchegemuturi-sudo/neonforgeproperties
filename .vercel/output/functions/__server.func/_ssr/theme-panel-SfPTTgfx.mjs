import { i as __toESM } from "../_runtime.mjs";
import { t as cn } from "./utils-C_uf36nf.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { p as require_jsx_runtime } from "../_libs/@radix-ui/react-avatar+[...].mjs";
import { t as supabase } from "./client-BNXqJcVa.mjs";
import { t as Button } from "./button-Bq5vK6RO.mjs";
import { t as Label } from "./label-DBD1bRRP.mjs";
import { C as Moon, J as Check, S as Palette, u as Sun, w as Monitor } from "../_libs/lucide-react.mjs";
import { i as Trigger, n as Portal, r as Root2, t as Content2 } from "../_libs/radix-ui__react-popover.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/theme-panel-SfPTTgfx.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var DEFAULTS = {
	mode: "light",
	accent: "indigo",
	radius: "medium",
	font: "inter"
};
var STORAGE_KEY = "makao.theme";
var ACCENTS = [
	{
		value: "indigo",
		label: "Indigo",
		swatch: "oklch(0.52 0.21 274)"
	},
	{
		value: "violet",
		label: "Violet",
		swatch: "oklch(0.55 0.24 300)"
	},
	{
		value: "blue",
		label: "Blue",
		swatch: "oklch(0.55 0.2 255)"
	},
	{
		value: "emerald",
		label: "Emerald",
		swatch: "oklch(0.55 0.13 163)"
	},
	{
		value: "amber",
		label: "Amber",
		swatch: "oklch(0.68 0.16 65)"
	},
	{
		value: "rose",
		label: "Rose",
		swatch: "oklch(0.58 0.21 15)"
	},
	{
		value: "slate",
		label: "Slate",
		swatch: "oklch(0.32 0.028 264)"
	}
];
var FONTS = [
	{
		value: "inter",
		label: "Inter"
	},
	{
		value: "grotesk",
		label: "Space Grotesk"
	},
	{
		value: "plex",
		label: "IBM Plex Sans"
	},
	{
		value: "mono",
		label: "JetBrains Mono"
	}
];
var RADII = [
	{
		value: "sharp",
		label: "Sharp"
	},
	{
		value: "medium",
		label: "Medium"
	},
	{
		value: "round",
		label: "Rounded"
	}
];
var ThemeContext = (0, import_react.createContext)(null);
function applyToDocument(state) {
	if (typeof document === "undefined") return "light";
	const root = document.documentElement;
	const prefersDark = typeof window !== "undefined" && window.matchMedia("(prefers-color-scheme: dark)").matches;
	const resolved = state.mode === "system" ? prefersDark ? "dark" : "light" : state.mode;
	root.classList.toggle("dark", resolved === "dark");
	root.dataset["accent"] = state.accent;
	root.dataset["radius"] = state.radius;
	root.dataset["font"] = state.font;
	root.style.colorScheme = resolved;
	return resolved;
}
function ThemeProvider({ children }) {
	const [state, setState] = (0, import_react.useState)(DEFAULTS);
	const [resolvedMode, setResolvedMode] = (0, import_react.useState)("light");
	(0, import_react.useEffect)(() => {
		let next = DEFAULTS;
		try {
			const raw = window.localStorage.getItem(STORAGE_KEY);
			if (raw) next = {
				...DEFAULTS,
				...JSON.parse(raw)
			};
		} catch {}
		setState(next);
		setResolvedMode(applyToDocument(next));
		(async () => {
			const { data } = await supabase.auth.getSession();
			const userId = data.session?.user.id;
			if (!userId) return;
			const { data: pref } = await supabase.from("theme_preferences").select("mode, accent, radius, font").eq("user_id", userId).maybeSingle();
			if (pref) {
				const merged = {
					...DEFAULTS,
					...pref
				};
				setState(merged);
				setResolvedMode(applyToDocument(merged));
			}
		})();
	}, []);
	const setTheme = (0, import_react.useCallback)((patch) => {
		setState((prev) => {
			const next = {
				...prev,
				...patch
			};
			setResolvedMode(applyToDocument(next));
			try {
				window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
			} catch {}
			(async () => {
				const { data } = await supabase.auth.getSession();
				const userId = data.session?.user.id;
				if (!userId) return;
				await supabase.from("theme_preferences").upsert({
					user_id: userId,
					...next,
					updated_at: (/* @__PURE__ */ new Date()).toISOString()
				}, { onConflict: "user_id" });
			})();
			return next;
		});
	}, []);
	const reset = (0, import_react.useCallback)(() => setTheme(DEFAULTS), [setTheme]);
	const value = (0, import_react.useMemo)(() => ({
		...state,
		resolvedMode,
		setTheme,
		reset
	}), [
		state,
		resolvedMode,
		setTheme,
		reset
	]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ThemeContext.Provider, {
		value,
		children
	});
}
function useTheme() {
	const ctx = (0, import_react.useContext)(ThemeContext);
	if (!ctx) throw new Error("useTheme must be used inside ThemeProvider");
	return ctx;
}
var Popover = Root2;
var PopoverTrigger = Trigger;
var PopoverContent = import_react.forwardRef(({ className, align = "center", sideOffset = 4, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Portal, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Content2, {
	ref,
	align,
	sideOffset,
	className: cn("z-50 w-72 rounded-md border bg-popover p-4 text-popover-foreground shadow-md outline-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 origin-(--radix-popover-content-transform-origin)", className),
	...props
}) }));
PopoverContent.displayName = Content2.displayName;
var MODES = [
	{
		value: "light",
		label: "Light",
		icon: Sun
	},
	{
		value: "dark",
		label: "Dark",
		icon: Moon
	},
	{
		value: "system",
		label: "System",
		icon: Monitor
	}
];
function ThemePanel() {
	const { mode, accent, radius, font, setTheme, reset } = useTheme();
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-5",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "space-y-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
					className: "text-xs uppercase tracking-wide text-muted-foreground",
					children: "Mode"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "grid grid-cols-3 gap-2",
					children: MODES.map((m) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
						type: "button",
						variant: mode === m.value ? "default" : "outline",
						size: "sm",
						onClick: () => setTheme({ mode: m.value }),
						className: "justify-center gap-1.5",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(m.icon, { className: "size-3.5" }), m.label]
					}, m.value))
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "space-y-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
					className: "text-xs uppercase tracking-wide text-muted-foreground",
					children: "Accent"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "flex flex-wrap gap-2",
					children: ACCENTS.map((a) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						"aria-label": a.label,
						onClick: () => setTheme({ accent: a.value }),
						style: { backgroundColor: a.swatch },
						className: cn("flex size-8 items-center justify-center rounded-full ring-offset-2 ring-offset-background transition", accent === a.value ? "ring-2 ring-ring" : "hover:scale-105"),
						children: accent === a.value && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Check, { className: "size-4 text-white" })
					}, a.value))
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "space-y-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
					className: "text-xs uppercase tracking-wide text-muted-foreground",
					children: "Corners"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "grid grid-cols-3 gap-2",
					children: RADII.map((r) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						type: "button",
						variant: radius === r.value ? "default" : "outline",
						size: "sm",
						onClick: () => setTheme({ radius: r.value }),
						children: r.label
					}, r.value))
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "space-y-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
					className: "text-xs uppercase tracking-wide text-muted-foreground",
					children: "Typeface"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "grid grid-cols-2 gap-2",
					children: FONTS.map((f) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						type: "button",
						variant: font === f.value ? "default" : "outline",
						size: "sm",
						onClick: () => setTheme({ font: f.value }),
						children: f.label
					}, f.value))
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
				type: "button",
				variant: "ghost",
				size: "sm",
				className: "w-full",
				onClick: reset,
				children: "Reset to defaults"
			})
		]
	});
}
function ThemeButton() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Popover, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PopoverTrigger, {
		asChild: true,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
			variant: "ghost",
			size: "icon",
			"aria-label": "Customize theme",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Palette, { className: "size-4" })
		})
	}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(PopoverContent, {
		align: "end",
		className: "w-72",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "mb-4 text-sm font-medium",
			children: "Customize appearance"
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ThemePanel, {})]
	})] });
}
//#endregion
export { ThemePanel as n, ThemeProvider as r, ThemeButton as t };
