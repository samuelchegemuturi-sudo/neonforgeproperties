import { o as __toESM } from "../_runtime.mjs";
import { t as cva } from "../_libs/class-variance-authority+clsx.mjs";
import { t as cn } from "./utils-C_uf36nf.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { l as Slot, n as AvatarFallback$1, p as require_jsx_runtime, r as AvatarImage$1, t as Avatar$1 } from "../_libs/@radix-ui/react-avatar+[...].mjs";
import { a as CardHeader, n as CardContent, o as CardTitle, r as CardDescription, t as Card } from "./card-CcQOx-bn.mjs";
import { t as supabase } from "./client-BNXqJcVa.mjs";
import { t as QueryClient } from "../_libs/tanstack__query-core.mjs";
import { i as useQueryClient, n as useQuery, r as QueryClientProvider, t as useMutation } from "../_libs/tanstack__react-query.mjs";
import { n as useAuth, t as AuthProvider } from "./auth-D3Dl5b08.mjs";
import { t as Button } from "./button-Bq5vK6RO.mjs";
import { t as Input } from "./input-B8Q2ztVi.mjs";
import { _ as useNavigate, c as HeadContent, d as createRouter, f as Outlet, g as Link, h as createRootRouteWithContext, j as redirect, l as useRouterState, m as createFileRoute, p as lazyRouteComponent, s as Scripts, v as useRouter } from "../_libs/@tanstack/react-router+[...].mjs";
import { t as Route$34 } from "./auth-DjMDIlvi.mjs";
import { f as sendEmailFn } from "./platform.functions-BTrKAh3m.mjs";
import { n as toast, t as Toaster } from "../_libs/sonner.mjs";
import { A as LifeBuoy, D as MapPin, E as Map, I as DoorOpen, J as Check, K as ChevronRight, M as KeyRound, N as House, O as LogOut, P as FileText, Q as Bell, R as DatabaseBackup, T as Megaphone, V as Circle, W as CircleAlert, X as Building2, Y as ChartColumn, Z as Briefcase, a as UserCog, b as Percent, d as ShieldCheck, et as BadgeCheck, f as Settings, h as ScrollText, i as Users, it as ArrowLeftRight, j as LayoutDashboard, l as Tags, m as Search, n as Wrench, o as Undo2, ot as Activity, p as Send, r as Wallet, t as X, x as PanelLeft, y as Plug, z as CreditCard } from "../_libs/lucide-react.mjs";
import { a as DialogOverlay, i as DialogDescription, n as DialogClose, o as DialogPortal, r as DialogContent, s as DialogTitle, t as Dialog } from "../_libs/@radix-ui/react-dialog+[...].mjs";
import { a as Label2, c as Root2, d as SubTrigger2, f as Trigger, i as ItemIndicator2, l as Separator2, n as Content2, o as Portal2, r as Item2, s as RadioItem2, t as CheckboxItem2, u as SubContent2 } from "../_libs/@radix-ui/react-dropdown-menu+[...].mjs";
import { t as Badge } from "./badge-D1Dupn2y.mjs";
import { t as useServerFn } from "./useServerFn-CrZF2pjq.mjs";
import { t as Skeleton } from "./skeleton-D9W9wFsj.mjs";
import { a as statusTone, i as shortDate, o as titleCase } from "./platform-Df7WJh8D.mjs";
import { t as Route$35 } from "./leases_._leaseId.statement-6rZmWjGN.mjs";
import { t as Textarea } from "./textarea-kko37XEX.mjs";
import { r as ThemeProvider, t as ThemeButton } from "./theme-panel-SfPTTgfx.mjs";
import { t as Root } from "../_libs/radix-ui__react-separator.mjs";
import { a as Trigger$1, i as Root3, n as Portal, r as Provider, t as Content2$1 } from "../_libs/radix-ui__react-tooltip.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/router-C1SU1d-b.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var styles_default = "/assets/styles-B0rmR2Hs.css";
var Toaster$1 = ({ ...props }) => {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Toaster, {
		className: "toaster group",
		toastOptions: { classNames: {
			toast: "group toast group-[.toaster]:bg-background group-[.toaster]:text-foreground group-[.toaster]:border-border group-[.toaster]:shadow-lg",
			description: "group-[.toast]:text-muted-foreground",
			actionButton: "group-[.toast]:bg-primary group-[.toast]:text-primary-foreground",
			cancelButton: "group-[.toast]:bg-muted group-[.toast]:text-muted-foreground"
		} },
		...props
	});
};
function NotFoundComponent() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "flex min-h-screen items-center justify-center bg-background px-4",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "max-w-md text-center",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
					className: "text-7xl font-bold text-foreground",
					children: "404"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "mt-4 text-xl font-semibold text-foreground",
					children: "Page not found"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-2 text-sm text-muted-foreground",
					children: "The page you're looking for doesn't exist or has been moved."
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "mt-6",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
						to: "/",
						className: "inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90",
						children: "Go home"
					})
				})
			]
		})
	});
}
function ErrorComponent({ error, reset }) {
	console.error(error);
	const router = useRouter();
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "flex min-h-screen items-center justify-center bg-background px-4",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "max-w-md text-center",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
					className: "text-xl font-semibold tracking-tight text-foreground",
					children: "This page didn't load"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-2 text-sm text-muted-foreground",
					children: "Something went wrong on our end. You can try refreshing or head back home."
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mt-6 flex flex-wrap justify-center gap-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						onClick: () => {
							router.invalidate();
							reset();
						},
						className: "inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90",
						children: "Try again"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", {
						href: "/",
						className: "inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent",
						children: "Go home"
					})]
				})
			]
		})
	});
}
var Route$33 = createRootRouteWithContext()({
	head: () => ({
		meta: [
			{ charSet: "utf-8" },
			{
				name: "viewport",
				content: "width=device-width, initial-scale=1"
			},
			{ title: "Neon Forge Properties — Property Management Platform" },
			{
				name: "description",
				content: "Neon Forge Properties is a multi-tenant property management platform for landlords, managers, accountants and field teams."
			},
			{
				property: "og:type",
				content: "website"
			},
			{
				name: "twitter:card",
				content: "summary_large_image"
			}
		],
		links: [
			{
				rel: "stylesheet",
				href: styles_default
			},
			{
				rel: "preconnect",
				href: "https://fonts.googleapis.com"
			},
			{
				rel: "preconnect",
				href: "https://fonts.gstatic.com",
				crossOrigin: "anonymous"
			},
			{
				rel: "stylesheet",
				href: "https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Space+Grotesk:wght@400;500;600;700&family=IBM+Plex+Sans:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500;700&display=swap"
			}
		]
	}),
	shellComponent: RootShell,
	component: RootComponent,
	notFoundComponent: NotFoundComponent,
	errorComponent: ErrorComponent
});
function RootShell({ children }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("html", {
		lang: "en",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("head", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(HeadContent, {}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("body", { children: [children, /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Scripts, {})] })]
	});
}
function RootComponent() {
	const { queryClient } = Route$33.useRouteContext();
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(QueryClientProvider, {
		client: queryClient,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ThemeProvider, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AuthProvider, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Outlet, {}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Toaster$1, {
			richColors: true,
			position: "top-right"
		})] }) })
	});
}
var $$splitComponentImporter$30 = () => import("./routes-ChKfe0AZ.mjs");
var Route$32 = createFileRoute("/")({
	head: () => ({ meta: [
		{ title: "Neon Forge Properties — Multi-tenant Property Management for Kenya" },
		{
			name: "description",
			content: "Run properties, staff, rent and compliance from one platform. Role-based dashboards for landlords, managers, accountants and caretakers."
		},
		{
			property: "og:title",
			content: "Neon Forge Properties — Multi-tenant Property Management"
		},
		{
			property: "og:description",
			content: "One platform for properties, units, employees, rent collection and disbursements — with permissions for every role."
		}
	] }),
	component: lazyRouteComponent($$splitComponentImporter$30, "component")
});
var MOBILE_BREAKPOINT = 768;
function useIsMobile() {
	const [isMobile, setIsMobile] = import_react.useState(void 0);
	import_react.useEffect(() => {
		const mql = window.matchMedia(`(max-width: 767px)`);
		const onChange = () => {
			setIsMobile(window.innerWidth < MOBILE_BREAKPOINT);
		};
		mql.addEventListener("change", onChange);
		setIsMobile(window.innerWidth < MOBILE_BREAKPOINT);
		return () => mql.removeEventListener("change", onChange);
	}, []);
	return !!isMobile;
}
var Separator = import_react.forwardRef(({ className, orientation = "horizontal", decorative = true, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Root, {
	ref,
	decorative,
	orientation,
	className: cn("shrink-0 bg-border", orientation === "horizontal" ? "h-[1px] w-full" : "h-full w-[1px]", className),
	...props
}));
Separator.displayName = Root.displayName;
var Sheet = Dialog;
var SheetPortal = DialogPortal;
var SheetOverlay = import_react.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogOverlay, {
	className: cn("fixed inset-0 z-50 bg-black/80  data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0", className),
	...props,
	ref
}));
SheetOverlay.displayName = DialogOverlay.displayName;
var sheetVariants = cva("fixed z-50 gap-4 bg-background p-6 shadow-lg transition ease-in-out data-[state=closed]:duration-300 data-[state=open]:duration-500 data-[state=open]:animate-in data-[state=closed]:animate-out", {
	variants: { side: {
		top: "inset-x-0 top-0 border-b data-[state=closed]:slide-out-to-top data-[state=open]:slide-in-from-top",
		bottom: "inset-x-0 bottom-0 border-t data-[state=closed]:slide-out-to-bottom data-[state=open]:slide-in-from-bottom",
		left: "inset-y-0 left-0 h-full w-3/4 border-r data-[state=closed]:slide-out-to-left data-[state=open]:slide-in-from-left sm:max-w-sm",
		right: "inset-y-0 right-0 h-full w-3/4 border-l data-[state=closed]:slide-out-to-right data-[state=open]:slide-in-from-right sm:max-w-sm"
	} },
	defaultVariants: { side: "right" }
});
var SheetContent = import_react.forwardRef(({ side = "right", className, children, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SheetPortal, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SheetOverlay, {}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogContent, {
	ref,
	className: cn(sheetVariants({ side }), className),
	...props,
	children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogClose, {
		className: "absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background cursor-pointer transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-secondary",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, { className: "h-4 w-4" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
			className: "sr-only",
			children: "Close"
		})]
	}), children]
})] }));
SheetContent.displayName = DialogContent.displayName;
var SheetHeader = ({ className, ...props }) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
	className: cn("flex flex-col space-y-2 text-center sm:text-left", className),
	...props
});
SheetHeader.displayName = "SheetHeader";
var SheetFooter = ({ className, ...props }) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
	className: cn("flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2", className),
	...props
});
SheetFooter.displayName = "SheetFooter";
var SheetTitle = import_react.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogTitle, {
	ref,
	className: cn("text-lg font-semibold text-foreground", className),
	...props
}));
SheetTitle.displayName = DialogTitle.displayName;
var SheetDescription = import_react.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogDescription, {
	ref,
	className: cn("text-sm text-muted-foreground", className),
	...props
}));
SheetDescription.displayName = DialogDescription.displayName;
var TooltipProvider = Provider;
var Tooltip = Root3;
var TooltipTrigger = Trigger$1;
var TooltipContent = import_react.forwardRef(({ className, sideOffset = 4, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Portal, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Content2$1, {
	ref,
	sideOffset,
	className: cn("z-50 overflow-hidden rounded-md bg-primary px-3 py-1.5 text-xs text-primary-foreground animate-in fade-in-0 zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 origin-(--radix-tooltip-content-transform-origin)", className),
	...props
}) }));
TooltipContent.displayName = Content2$1.displayName;
var SIDEBAR_COOKIE_NAME = "sidebar_state";
var SIDEBAR_COOKIE_MAX_AGE = 604800;
var SIDEBAR_WIDTH = "16rem";
var SIDEBAR_WIDTH_MOBILE = "18rem";
var SIDEBAR_WIDTH_ICON = "3rem";
var SIDEBAR_KEYBOARD_SHORTCUT = "b";
var SidebarContext = import_react.createContext(null);
function useSidebar() {
	const context = import_react.useContext(SidebarContext);
	if (!context) throw new Error("useSidebar must be used within a SidebarProvider.");
	return context;
}
var SidebarProvider = import_react.forwardRef(({ defaultOpen = true, open: openProp, onOpenChange: setOpenProp, className, style, children, ...props }, ref) => {
	const isMobile = useIsMobile();
	const [openMobile, setOpenMobile] = import_react.useState(false);
	const [_open, _setOpen] = import_react.useState(defaultOpen);
	const open = openProp ?? _open;
	const setOpen = import_react.useCallback((value) => {
		const openState = typeof value === "function" ? value(open) : value;
		if (setOpenProp) setOpenProp(openState);
		else _setOpen(openState);
		document.cookie = `${SIDEBAR_COOKIE_NAME}=${openState}; path=/; max-age=${SIDEBAR_COOKIE_MAX_AGE}`;
	}, [setOpenProp, open]);
	const toggleSidebar = import_react.useCallback(() => {
		return isMobile ? setOpenMobile((open) => !open) : setOpen((open) => !open);
	}, [
		isMobile,
		setOpen,
		setOpenMobile
	]);
	import_react.useEffect(() => {
		const handleKeyDown = (event) => {
			if (event.key === SIDEBAR_KEYBOARD_SHORTCUT && (event.metaKey || event.ctrlKey)) {
				event.preventDefault();
				toggleSidebar();
			}
		};
		window.addEventListener("keydown", handleKeyDown);
		return () => window.removeEventListener("keydown", handleKeyDown);
	}, [toggleSidebar]);
	const state = open ? "expanded" : "collapsed";
	const contextValue = import_react.useMemo(() => ({
		state,
		open,
		setOpen,
		isMobile,
		openMobile,
		setOpenMobile,
		toggleSidebar
	}), [
		state,
		open,
		setOpen,
		isMobile,
		openMobile,
		setOpenMobile,
		toggleSidebar
	]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SidebarContext.Provider, {
		value: contextValue,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TooltipProvider, {
			delayDuration: 0,
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				style: {
					"--sidebar-width": SIDEBAR_WIDTH,
					"--sidebar-width-icon": SIDEBAR_WIDTH_ICON,
					...style
				},
				className: cn("group/sidebar-wrapper flex min-h-svh w-full has-[[data-variant=inset]]:bg-sidebar", className),
				ref,
				...props,
				children
			})
		})
	});
});
SidebarProvider.displayName = "SidebarProvider";
var Sidebar = import_react.forwardRef(({ side = "left", variant = "sidebar", collapsible = "offcanvas", className, children, ...props }, ref) => {
	const { isMobile, state, openMobile, setOpenMobile } = useSidebar();
	if (collapsible === "none") return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: cn("flex h-full w-(--sidebar-width) flex-col bg-sidebar text-sidebar-foreground backdrop-blur-xl border-r border-white/20 dark:border-white/10", className),
		ref,
		...props,
		children
	});
	if (isMobile) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Sheet, {
		open: openMobile,
		onOpenChange: setOpenMobile,
		...props,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SheetContent, {
			"data-sidebar": "sidebar",
			"data-mobile": "true",
			className: "w-(--sidebar-width) bg-sidebar p-0 text-sidebar-foreground [&>button]:hidden",
			style: { "--sidebar-width": SIDEBAR_WIDTH_MOBILE },
			side,
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SheetHeader, {
				className: "sr-only",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SheetTitle, { children: "Sidebar" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SheetDescription, { children: "Displays the mobile sidebar." })]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "flex h-full w-full flex-col",
				children
			})]
		})
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		ref,
		className: "group peer hidden text-sidebar-foreground md:block",
		"data-state": state,
		"data-collapsible": state === "collapsed" ? collapsible : "",
		"data-variant": variant,
		"data-side": side,
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: cn("relative w-(--sidebar-width) bg-transparent transition-[width] duration-200 ease-linear", "group-data-[collapsible=offcanvas]:w-0", "group-data-[side=right]:rotate-180", variant === "floating" || variant === "inset" ? "group-data-[collapsible=icon]:w-[calc(var(--sidebar-width-icon)_+_theme(spacing.4))]" : "group-data-[collapsible=icon]:w-(--sidebar-width-icon)") }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: cn("fixed inset-y-0 z-10 hidden h-svh w-(--sidebar-width) transition-[left,right,width] duration-200 ease-linear md:flex", side === "left" ? "left-0 group-data-[collapsible=offcanvas]:left-[calc(var(--sidebar-width)*-1)]" : "right-0 group-data-[collapsible=offcanvas]:right-[calc(var(--sidebar-width)*-1)]", variant === "floating" || variant === "inset" ? "p-2 group-data-[collapsible=icon]:w-[calc(var(--sidebar-width-icon)_+_theme(spacing.4)_+2px)]" : "group-data-[collapsible=icon]:w-(--sidebar-width-icon) group-data-[side=left]:border-r group-data-[side=right]:border-l", className),
			...props,
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				"data-sidebar": "sidebar",
				className: "flex h-full w-full flex-col bg-sidebar backdrop-blur-xl border-r border-white/20 dark:border-white/10 group-data-[variant=floating]:rounded-lg group-data-[variant=floating]:border group-data-[variant=floating]:border-sidebar-border group-data-[variant=floating]:shadow",
				children
			})
		})]
	});
});
Sidebar.displayName = "Sidebar";
var SidebarTrigger = import_react.forwardRef(({ className, onClick, ...props }, ref) => {
	const { toggleSidebar } = useSidebar();
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
		ref,
		"data-sidebar": "trigger",
		variant: "ghost",
		size: "icon",
		className: cn("h-7 w-7", className),
		onClick: (event) => {
			onClick?.(event);
			toggleSidebar();
		},
		...props,
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PanelLeft, {}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
			className: "sr-only",
			children: "Toggle Sidebar"
		})]
	});
});
SidebarTrigger.displayName = "SidebarTrigger";
var SidebarRail = import_react.forwardRef(({ className, ...props }, ref) => {
	const { toggleSidebar } = useSidebar();
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
		ref,
		"data-sidebar": "rail",
		"aria-label": "Toggle Sidebar",
		tabIndex: -1,
		onClick: toggleSidebar,
		title: "Toggle Sidebar",
		className: cn("absolute inset-y-0 z-20 hidden w-4 -translate-x-1/2 transition-all ease-linear after:absolute after:inset-y-0 after:left-1/2 after:w-[2px] hover:after:bg-sidebar-border group-data-[side=left]:-right-4 group-data-[side=right]:left-0 sm:flex", "[[data-side=left]_&]:cursor-w-resize [[data-side=right]_&]:cursor-e-resize", "[[data-side=left][data-state=collapsed]_&]:cursor-e-resize [[data-side=right][data-state=collapsed]_&]:cursor-w-resize", "group-data-[collapsible=offcanvas]:translate-x-0 group-data-[collapsible=offcanvas]:after:left-full group-data-[collapsible=offcanvas]:hover:bg-sidebar", "[[data-side=left][data-collapsible=offcanvas]_&]:-right-2", "[[data-side=right][data-collapsible=offcanvas]_&]:-left-2", className),
		...props
	});
});
SidebarRail.displayName = "SidebarRail";
var SidebarInset = import_react.forwardRef(({ className, ...props }, ref) => {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("main", {
		ref,
		className: cn("relative flex w-full flex-1 flex-col bg-background", "md:peer-data-[variant=inset]:m-2 md:peer-data-[state=collapsed]:peer-data-[variant=inset]:ml-2 md:peer-data-[variant=inset]:ml-0 md:peer-data-[variant=inset]:rounded-xl md:peer-data-[variant=inset]:shadow", className),
		...props
	});
});
SidebarInset.displayName = "SidebarInset";
var SidebarInput = import_react.forwardRef(({ className, ...props }, ref) => {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
		ref,
		"data-sidebar": "input",
		className: cn("h-8 w-full bg-background shadow-none focus-visible:ring-2 focus-visible:ring-sidebar-ring", className),
		...props
	});
});
SidebarInput.displayName = "SidebarInput";
var SidebarHeader = import_react.forwardRef(({ className, ...props }, ref) => {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		ref,
		"data-sidebar": "header",
		className: cn("flex flex-col gap-2 p-2", className),
		...props
	});
});
SidebarHeader.displayName = "SidebarHeader";
var SidebarFooter = import_react.forwardRef(({ className, ...props }, ref) => {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		ref,
		"data-sidebar": "footer",
		className: cn("flex flex-col gap-2 p-2", className),
		...props
	});
});
SidebarFooter.displayName = "SidebarFooter";
var SidebarSeparator = import_react.forwardRef(({ className, ...props }, ref) => {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Separator, {
		ref,
		"data-sidebar": "separator",
		className: cn("mx-2 w-auto bg-sidebar-border", className),
		...props
	});
});
SidebarSeparator.displayName = "SidebarSeparator";
var SidebarContent = import_react.forwardRef(({ className, ...props }, ref) => {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		ref,
		"data-sidebar": "content",
		className: cn("flex min-h-0 flex-1 flex-col gap-2 overflow-auto group-data-[collapsible=icon]:overflow-hidden", className),
		...props
	});
});
SidebarContent.displayName = "SidebarContent";
var SidebarGroup = import_react.forwardRef(({ className, ...props }, ref) => {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		ref,
		"data-sidebar": "group",
		className: cn("relative flex w-full min-w-0 flex-col p-2", className),
		...props
	});
});
SidebarGroup.displayName = "SidebarGroup";
var SidebarGroupLabel = import_react.forwardRef(({ className, asChild = false, ...props }, ref) => {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(asChild ? Slot : "div", {
		ref,
		"data-sidebar": "group-label",
		className: cn("flex h-8 shrink-0 items-center rounded-md px-2 text-xs font-medium text-sidebar-foreground/70 outline-none ring-sidebar-ring transition-[margin,opacity] duration-200 ease-linear focus-visible:ring-2 [&>svg]:size-4 [&>svg]:shrink-0", "group-data-[collapsible=icon]:-mt-8 group-data-[collapsible=icon]:opacity-0", className),
		...props
	});
});
SidebarGroupLabel.displayName = "SidebarGroupLabel";
var SidebarGroupAction = import_react.forwardRef(({ className, asChild = false, ...props }, ref) => {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(asChild ? Slot : "button", {
		ref,
		"data-sidebar": "group-action",
		className: cn("absolute right-3 top-3.5 flex aspect-square w-5 items-center justify-center rounded-md p-0 text-sidebar-foreground outline-none ring-sidebar-ring cursor-pointer transition-transform hover:bg-sidebar-accent hover:text-sidebar-accent-foreground focus-visible:ring-2 [&>svg]:size-4 [&>svg]:shrink-0", "after:absolute after:-inset-2 after:md:hidden", "group-data-[collapsible=icon]:hidden", className),
		...props
	});
});
SidebarGroupAction.displayName = "SidebarGroupAction";
var SidebarGroupContent = import_react.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
	ref,
	"data-sidebar": "group-content",
	className: cn("w-full text-sm", className),
	...props
}));
SidebarGroupContent.displayName = "SidebarGroupContent";
var SidebarMenu = import_react.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
	ref,
	"data-sidebar": "menu",
	className: cn("flex w-full min-w-0 flex-col gap-1", className),
	...props
}));
SidebarMenu.displayName = "SidebarMenu";
var SidebarMenuItem = import_react.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", {
	ref,
	"data-sidebar": "menu-item",
	className: cn("group/menu-item relative", className),
	...props
}));
SidebarMenuItem.displayName = "SidebarMenuItem";
var sidebarMenuButtonVariants = cva("peer/menu-button flex w-full items-center gap-2 overflow-hidden rounded-md p-2 text-left text-sm outline-none ring-sidebar-ring cursor-pointer transition-[width,height,padding] hover:bg-sidebar-accent hover:text-sidebar-accent-foreground focus-visible:ring-2 active:bg-sidebar-accent active:text-sidebar-accent-foreground disabled:pointer-events-none disabled:opacity-50 disabled:cursor-not-allowed group-has-[[data-sidebar=menu-action]]/menu-item:pr-8 aria-disabled:pointer-events-none aria-disabled:opacity-50 data-[active=true]:bg-sidebar-accent data-[active=true]:font-medium data-[active=true]:text-sidebar-accent-foreground data-[state=open]:hover:bg-sidebar-accent data-[state=open]:hover:text-sidebar-accent-foreground group-data-[collapsible=icon]:!size-8 group-data-[collapsible=icon]:!p-2 [&>span:last-child]:truncate [&>svg]:size-4 [&>svg]:shrink-0", {
	variants: {
		variant: {
			default: "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
			outline: "bg-background shadow-[0_0_0_1px_var(--sidebar-border)] hover:bg-sidebar-accent hover:text-sidebar-accent-foreground hover:shadow-[0_0_0_1px_var(--sidebar-accent)]"
		},
		size: {
			default: "h-8 text-sm",
			sm: "h-7 text-xs",
			lg: "h-12 text-sm group-data-[collapsible=icon]:!p-0"
		}
	},
	defaultVariants: {
		variant: "default",
		size: "default"
	}
});
var SidebarMenuButton = import_react.forwardRef(({ asChild = false, isActive = false, variant = "default", size = "default", tooltip, className, ...props }, ref) => {
	const Comp = asChild ? Slot : "button";
	const { isMobile, state } = useSidebar();
	const button = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Comp, {
		ref,
		"data-sidebar": "menu-button",
		"data-size": size,
		"data-active": isActive,
		className: cn(sidebarMenuButtonVariants({
			variant,
			size
		}), className),
		...props
	});
	if (!tooltip) return button;
	if (typeof tooltip === "string") tooltip = { children: tooltip };
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Tooltip, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TooltipTrigger, {
		asChild: true,
		children: button
	}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TooltipContent, {
		side: "right",
		align: "center",
		hidden: state !== "collapsed" || isMobile,
		...tooltip
	})] });
});
SidebarMenuButton.displayName = "SidebarMenuButton";
var SidebarMenuAction = import_react.forwardRef(({ className, asChild = false, showOnHover = false, ...props }, ref) => {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(asChild ? Slot : "button", {
		ref,
		"data-sidebar": "menu-action",
		className: cn("absolute right-1 top-1.5 flex aspect-square w-5 items-center justify-center rounded-md p-0 text-sidebar-foreground outline-none ring-sidebar-ring cursor-pointer transition-transform hover:bg-sidebar-accent hover:text-sidebar-accent-foreground focus-visible:ring-2 peer-hover/menu-button:text-sidebar-accent-foreground [&>svg]:size-4 [&>svg]:shrink-0", "after:absolute after:-inset-2 after:md:hidden", "peer-data-[size=sm]/menu-button:top-1", "peer-data-[size=default]/menu-button:top-1.5", "peer-data-[size=lg]/menu-button:top-2.5", "group-data-[collapsible=icon]:hidden", showOnHover && "group-focus-within/menu-item:opacity-100 group-hover/menu-item:opacity-100 data-[state=open]:opacity-100 peer-data-[active=true]/menu-button:text-sidebar-accent-foreground md:opacity-0", className),
		...props
	});
});
SidebarMenuAction.displayName = "SidebarMenuAction";
var SidebarMenuBadge = import_react.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
	ref,
	"data-sidebar": "menu-badge",
	className: cn("pointer-events-none absolute right-1 flex h-5 min-w-5 select-none items-center justify-center rounded-md px-1 text-xs font-medium tabular-nums text-sidebar-foreground", "peer-hover/menu-button:text-sidebar-accent-foreground peer-data-[active=true]/menu-button:text-sidebar-accent-foreground", "peer-data-[size=sm]/menu-button:top-1", "peer-data-[size=default]/menu-button:top-1.5", "peer-data-[size=lg]/menu-button:top-2.5", "group-data-[collapsible=icon]:hidden", className),
	...props
}));
SidebarMenuBadge.displayName = "SidebarMenuBadge";
var SidebarMenuSkeleton = import_react.forwardRef(({ className, showIcon = false, ...props }, ref) => {
	const width = import_react.useMemo(() => {
		return `${Math.floor(Math.random() * 40) + 50}%`;
	}, []);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		ref,
		"data-sidebar": "menu-skeleton",
		className: cn("flex h-8 items-center gap-2 rounded-md px-2", className),
		...props,
		children: [showIcon && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, {
			className: "size-4 rounded-md",
			"data-sidebar": "menu-skeleton-icon"
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, {
			className: "h-4 max-w-(--skeleton-width) flex-1",
			"data-sidebar": "menu-skeleton-text",
			style: { "--skeleton-width": width }
		})]
	});
});
SidebarMenuSkeleton.displayName = "SidebarMenuSkeleton";
var SidebarMenuSub = import_react.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
	ref,
	"data-sidebar": "menu-sub",
	className: cn("mx-3.5 flex min-w-0 translate-x-px flex-col gap-1 border-l border-sidebar-border px-2.5 py-0.5", "group-data-[collapsible=icon]:hidden", className),
	...props
}));
SidebarMenuSub.displayName = "SidebarMenuSub";
var SidebarMenuSubItem = import_react.forwardRef(({ ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", {
	ref,
	...props
}));
SidebarMenuSubItem.displayName = "SidebarMenuSubItem";
var SidebarMenuSubButton = import_react.forwardRef(({ asChild = false, size = "md", isActive, className, ...props }, ref) => {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(asChild ? Slot : "a", {
		ref,
		"data-sidebar": "menu-sub-button",
		"data-size": size,
		"data-active": isActive,
		className: cn("flex h-7 min-w-0 -translate-x-px items-center gap-2 overflow-hidden rounded-md px-2 text-sidebar-foreground outline-none ring-sidebar-ring cursor-pointer hover:bg-sidebar-accent hover:text-sidebar-accent-foreground focus-visible:ring-2 active:bg-sidebar-accent active:text-sidebar-accent-foreground disabled:pointer-events-none disabled:opacity-50 disabled:cursor-not-allowed aria-disabled:pointer-events-none aria-disabled:opacity-50 [&>span:last-child]:truncate [&>svg]:size-4 [&>svg]:shrink-0 [&>svg]:text-sidebar-accent-foreground", "data-[active=true]:bg-sidebar-accent data-[active=true]:text-sidebar-accent-foreground", size === "sm" && "text-xs", size === "md" && "text-sm", "group-data-[collapsible=icon]:hidden", className),
		...props
	});
});
SidebarMenuSubButton.displayName = "SidebarMenuSubButton";
/** The sidebar is generated from this list, filtered by the user's permissions. */
var NAV_ITEMS = [
	{
		label: "Dashboard",
		to: "/dashboard",
		icon: LayoutDashboard,
		permission: "dashboard.view",
		group: "Platform",
		featureFlag: "feature_dashboard"
	},
	{
		label: "Activation",
		to: "/onboarding",
		icon: BadgeCheck,
		permission: "dashboard.view",
		group: "Platform",
		featureFlag: "feature_activation",
		hideFromSuperAdmin: true
	},
	{
		label: "Analytics",
		to: "/analytics",
		icon: ChartColumn,
		permission: "reports.view",
		group: "Platform",
		superAdminOnly: true,
		featureFlag: "feature_analytics"
	},
	{
		label: "Live Activity",
		to: "/activity",
		icon: Activity,
		permission: "system.logs",
		group: "Platform",
		superAdminOnly: true,
		featureFlag: "feature_activity"
	},
	{
		label: "Companies",
		to: "/companies",
		icon: Briefcase,
		permission: "companies.view",
		group: "Business",
		superAdminOnly: true,
		featureFlag: "feature_business"
	},
	{
		label: "Subscriptions",
		to: "/subscriptions",
		icon: CreditCard,
		permission: "subscriptions.view",
		group: "Business",
		superAdminOnly: true,
		featureFlag: "feature_business"
	},
	{
		label: "Licences",
		to: "/licences",
		icon: KeyRound,
		permission: "licence.view",
		group: "Business",
		superAdminOnly: true,
		featureFlag: "feature_business"
	},
	{
		label: "Pricing Rules",
		to: "/pricing",
		icon: Tags,
		permission: "pricing.view",
		group: "Business",
		superAdminOnly: true,
		featureFlag: "feature_business"
	},
	{
		label: "Properties",
		to: "/properties",
		icon: Building2,
		permission: "property.view",
		group: "Property",
		featureFlag: "feature_properties"
	},
	{
		label: "Units",
		to: "/units",
		icon: DoorOpen,
		permission: "unit.view",
		group: "Property",
		featureFlag: "feature_properties"
	},
	{
		label: "Verification Queue",
		to: "/verification",
		icon: BadgeCheck,
		permission: "verification.view",
		group: "Property",
		superAdminOnly: true,
		featureFlag: "feature_verification"
	},
	{
		label: "Listings",
		to: "/listings",
		icon: Megaphone,
		permission: "listing.view",
		group: "Property",
		featureFlag: "feature_listings"
	},
	{
		label: "Map View",
		to: "/map",
		icon: Map,
		permission: "property.view",
		group: "Property",
		featureFlag: "feature_map"
	},
	{
		label: "Employees",
		to: "/employees",
		icon: UserCog,
		permission: "employees.view",
		group: "Users",
		featureFlag: "feature_users"
	},
	{
		label: "Tenants",
		to: "/tenants",
		icon: Users,
		permission: "tenant.view",
		group: "Users",
		featureFlag: "feature_users"
	},
	{
		label: "Leases",
		to: "/leases",
		icon: FileText,
		permission: "tenant.view",
		group: "Users",
		featureFlag: "feature_users"
	},
	{
		label: "Roles & Permissions",
		to: "/roles",
		icon: ShieldCheck,
		permission: "roles.view",
		group: "Users",
		featureFlag: "feature_users"
	},
	{
		label: "Finance",
		to: "/finance",
		icon: Wallet,
		permission: "finance.view",
		group: "Finance",
		featureFlag: "feature_finance"
	},
	{
		label: "Transactions",
		to: "/transactions",
		icon: ArrowLeftRight,
		permission: "finance.view",
		group: "Finance",
		featureFlag: "feature_finance"
	},
	{
		label: "Commissions",
		to: "/commissions",
		icon: Percent,
		permission: "finance.view",
		group: "Finance",
		featureFlag: "feature_finance"
	},
	{
		label: "Disbursements",
		to: "/disbursements",
		icon: Send,
		permission: "finance.view",
		group: "Finance",
		featureFlag: "feature_finance"
	},
	{
		label: "Refunds",
		to: "/refunds",
		icon: Undo2,
		permission: "finance.refund",
		group: "Finance",
		featureFlag: "feature_finance"
	},
	{
		label: "Revenue Reports",
		to: "/reports",
		icon: ChartColumn,
		permission: "reports.view",
		group: "Finance",
		featureFlag: "feature_finance"
	},
	{
		label: "Support Tickets",
		to: "/support",
		icon: LifeBuoy,
		permission: "support.view",
		group: "Operations",
		featureFlag: "feature_operations"
	},
	{
		label: "Maintenance",
		to: "/maintenance",
		icon: Wrench,
		permission: "maintenance.view",
		group: "Operations",
		featureFlag: "feature_operations"
	},
	{
		label: "Audit Logs",
		to: "/audit",
		icon: ScrollText,
		permission: "audit.view",
		group: "Operations",
		featureFlag: "feature_audit"
	},
	{
		label: "Settings",
		to: "/settings",
		icon: Settings,
		permission: "settings.view",
		group: "System"
	},
	{
		label: "Integrations",
		to: "/integrations",
		icon: Plug,
		permission: "system.settings",
		group: "System",
		superAdminOnly: true,
		featureFlag: "feature_system"
	},
	{
		label: "Backup & Restore",
		to: "/backup",
		icon: DatabaseBackup,
		permission: "system.settings",
		group: "System",
		superAdminOnly: true,
		featureFlag: "feature_system"
	}
];
var NAV_GROUP_ORDER = [
	"Platform",
	"Business",
	"Property",
	"Users",
	"Finance",
	"Operations",
	"System"
];
function AppSidebar() {
	const { state } = useSidebar();
	const collapsed = state === "collapsed";
	const { can, access } = useAuth();
	const pathname = useRouterState({ select: (r) => r.location.pathname });
	const isSuper = access?.profile?.is_super_admin ?? false;
	const { data: featureFlags } = useQuery({
		queryKey: ["feature-flags"],
		queryFn: async () => {
			const { data } = await supabase.from("platform_settings").select("key, value").like("key", "feature_%");
			return (data ?? []).reduce((acc, row) => {
				acc[row.key] = String(row.value);
				return acc;
			}, {});
		},
		staleTime: 3e5
	});
	const visible = NAV_ITEMS.filter((item) => {
		if (item.soon && !isSuper) return false;
		if (item.featureFlag && !isSuper) {
			if (featureFlags?.[item.featureFlag] !== "true") return false;
		}
		if (item.superAdminOnly && !isSuper) return false;
		if (item.hideFromSuperAdmin && isSuper) return false;
		return can(item.permission);
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Sidebar, {
		className: "print:hidden",
		collapsible: "icon",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SidebarHeader, {
				className: "border-b border-border/50 px-4 py-3",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-center gap-2.5 px-1.5 py-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "flex size-8 shrink-0 items-center justify-center rounded-md bg-sidebar-primary text-sidebar-primary-foreground",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(House, { className: "size-4" })
					}), !collapsed && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "min-w-0",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "truncate text-sm font-semibold tracking-tight",
							children: "Neon Forge Properties"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "truncate text-xs text-muted-foreground",
							children: access?.company?.name ?? "Property platform"
						})]
					})]
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SidebarContent, { children: NAV_GROUP_ORDER.map((group) => {
				const items = visible.filter((i) => i.group === group);
				if (!items.length) return null;
				return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SidebarGroup, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SidebarGroupLabel, { children: group }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SidebarGroupContent, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SidebarMenu, { children: items.map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SidebarMenuItem, { children: item.soon ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SidebarMenuButton, {
					className: "cursor-not-allowed opacity-55",
					tooltip: `${item.label} — coming soon`,
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(item.icon, { className: "size-4" }), !collapsed && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
						className: "flex w-full items-center justify-between",
						children: [item.label, /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
							variant: "outline",
							className: "ml-2 text-[10px]",
							children: "Soon"
						})]
					})]
				}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SidebarMenuButton, {
					asChild: true,
					isActive: pathname === item.to,
					tooltip: item.label,
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
						to: item.to,
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(item.icon, { className: "size-4" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: item.label })]
					})
				}) }, item.to)) }) })] }, group);
			}) }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SidebarFooter, {
				className: "border-t border-sidebar-border",
				children: !collapsed && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "px-2 py-1 text-xs text-muted-foreground",
					children: access?.roles.map((r) => r.name).join(", ") || (access?.profile?.is_super_admin ? "Super Admin" : access?.profile?.position === "Landlord" ? "Landlord" : "No role assigned")
				})
			})
		]
	});
}
var Avatar = import_react.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Avatar$1, {
	ref,
	className: cn("relative flex h-10 w-10 shrink-0 overflow-hidden rounded-full", className),
	...props
}));
Avatar.displayName = Avatar$1.displayName;
var AvatarImage = import_react.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AvatarImage$1, {
	ref,
	className: cn("aspect-square h-full w-full", className),
	...props
}));
AvatarImage.displayName = AvatarImage$1.displayName;
var AvatarFallback = import_react.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AvatarFallback$1, {
	ref,
	className: cn("flex h-full w-full items-center justify-center rounded-full bg-muted", className),
	...props
}));
AvatarFallback.displayName = AvatarFallback$1.displayName;
var DropdownMenu = Root2;
var DropdownMenuTrigger = Trigger;
var DropdownMenuSubTrigger = import_react.forwardRef(({ className, inset, children, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SubTrigger2, {
	ref,
	className: cn("flex cursor-default select-none items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-none focus:bg-accent data-[state=open]:bg-accent [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0", inset && "pl-8", className),
	...props,
	children: [children, /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronRight, { className: "ml-auto" })]
}));
DropdownMenuSubTrigger.displayName = SubTrigger2.displayName;
var DropdownMenuSubContent = import_react.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SubContent2, {
	ref,
	className: cn("z-50 min-w-[8rem] overflow-hidden rounded-md border bg-popover p-1 text-popover-foreground shadow-lg data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 origin-(--radix-dropdown-menu-content-transform-origin)", className),
	...props
}));
DropdownMenuSubContent.displayName = SubContent2.displayName;
var DropdownMenuContent = import_react.forwardRef(({ className, sideOffset = 4, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Portal2, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Content2, {
	ref,
	sideOffset,
	className: cn("z-50 max-h-[var(--radix-dropdown-menu-content-available-height)] min-w-[8rem] overflow-y-auto overflow-x-hidden rounded-md border bg-popover p-1 text-popover-foreground shadow-md", "data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 origin-(--radix-dropdown-menu-content-transform-origin)", className),
	...props
}) }));
DropdownMenuContent.displayName = Content2.displayName;
var DropdownMenuItem = import_react.forwardRef(({ className, inset, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Item2, {
	ref,
	className: cn("relative flex cursor-default select-none items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-none transition-colors focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50 [&>svg]:size-4 [&>svg]:shrink-0", inset && "pl-8", className),
	...props
}));
DropdownMenuItem.displayName = Item2.displayName;
var DropdownMenuCheckboxItem = import_react.forwardRef(({ className, children, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CheckboxItem2, {
	ref,
	className: cn("relative flex cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none transition-colors focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50", className),
	...props,
	children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
		className: "absolute left-2 flex h-3.5 w-3.5 items-center justify-center",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ItemIndicator2, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Check, { className: "h-4 w-4" }) })
	}), children]
}));
DropdownMenuCheckboxItem.displayName = CheckboxItem2.displayName;
var DropdownMenuRadioItem = import_react.forwardRef(({ className, children, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(RadioItem2, {
	ref,
	className: cn("relative flex cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none transition-colors focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50", className),
	...props,
	children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
		className: "absolute left-2 flex h-3.5 w-3.5 items-center justify-center",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ItemIndicator2, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Circle, { className: "h-2 w-2 fill-current" }) })
	}), children]
}));
DropdownMenuRadioItem.displayName = RadioItem2.displayName;
var DropdownMenuLabel = import_react.forwardRef(({ className, inset, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label2, {
	ref,
	className: cn("px-2 py-1.5 text-sm font-semibold", inset && "pl-8", className),
	...props
}));
DropdownMenuLabel.displayName = Label2.displayName;
var DropdownMenuSeparator = import_react.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Separator2, {
	ref,
	className: cn("-mx-1 my-1 h-px bg-muted", className),
	...props
}));
DropdownMenuSeparator.displayName = Separator2.displayName;
var DropdownMenuShortcut = ({ className, ...props }) => {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
		className: cn("ml-auto text-xs tracking-widest opacity-60", className),
		...props
	});
};
DropdownMenuShortcut.displayName = "DropdownMenuShortcut";
var Route$31 = createFileRoute("/_authenticated")({
	ssr: false,
	beforeLoad: async () => {
		const { data, error } = await supabase.auth.getUser();
		if (error || !data.user) throw redirect({ to: "/auth" });
		return { user: data.user };
	},
	component: RouteComponent
});
function RouteComponent() {
	const { access, user, signOut } = useAuth();
	const navigate = useNavigate();
	const name = access?.profile?.full_name ?? access?.profile?.email ?? "User";
	const initials = name.split(" ").map((p) => p[0]).slice(0, 2).join("").toUpperCase();
	const pathname = useRouterState({ select: (s) => s.location.pathname });
	(0, import_react.useEffect)(() => {
		if (!access) return;
		const isSuper = access.profile?.is_super_admin;
		const isEmployee = access.profile?.company_id && !access.company;
		const isActive = access.company?.activation_status === "active";
		const isAllowedRoute = [
			"/onboarding",
			"/settings",
			"/auth",
			"/support"
		].includes(pathname);
		if (!isSuper && !isEmployee && !isActive && !isAllowedRoute) navigate({
			to: "/onboarding",
			replace: true
		});
		if (user?.user_metadata?.["requires_password_change"] && pathname !== "/force-password-change") navigate({
			to: "/force-password-change",
			replace: true
		});
	}, [
		access,
		user,
		pathname,
		navigate
	]);
	const isSuspended = access?.profile?.status === "suspended" || access?.company?.status === "suspended";
	const isPastDue = access?.subscription?.current_period_end ? new Date(access.subscription.current_period_end) < /* @__PURE__ */ new Date() : false;
	const isSuperAdminRoute = [
		"/licences",
		"/companies",
		"/subscriptions",
		"/pricing",
		"/verification",
		"/leads"
	].includes(pathname);
	if ((isPastDue || isSuspended) && !(access?.profile?.is_super_admin && isSuperAdminRoute) && ![
		"/support",
		"/onboarding",
		"/properties"
	].includes(pathname)) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "flex min-h-screen w-full items-center justify-center bg-background p-4",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "max-w-md text-center space-y-4",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleAlert, { className: "h-6 w-6 text-destructive" })
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "text-xl font-semibold",
					children: isSuspended ? "Account Suspended" : "Subscription Past Due"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-sm text-muted-foreground",
					children: isSuspended ? "Your account or company has been suspended by an administrator. Please contact support." : "Your subscription has past its due date. Please renew your subscription to restore access to the platform."
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex gap-2 justify-center",
					children: [isPastDue && !isSuspended && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						onClick: () => navigate({ to: "/onboarding" }),
						children: "Renew Subscription"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						onClick: signOut,
						variant: "outline",
						children: "Sign out"
					})]
				})
			]
		})
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SidebarProvider, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex min-h-screen w-full bg-transparent",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AppSidebar, {}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex min-w-0 flex-1 flex-col",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", {
				className: "sticky top-0 z-20 flex h-14 items-center gap-3 border-b border-white/20 dark:border-white/10 bg-background/40 px-3 backdrop-blur-xl print:hidden",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SidebarTrigger, {}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "relative hidden max-w-sm flex-1 sm:block",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Search, { className: "pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
							placeholder: "Search properties, tenants, staff…",
							className: "h-9 pl-8",
							"aria-label": "Global search"
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "ml-auto flex items-center gap-1",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ThemeButton, {}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								variant: "ghost",
								size: "icon",
								"aria-label": "Notifications",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Bell, { className: "size-4" })
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DropdownMenu, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DropdownMenuTrigger, {
								asChild: true,
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
									variant: "ghost",
									className: "gap-2 px-2",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Avatar, {
										className: "size-7",
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AvatarFallback, {
											className: "text-xs",
											children: initials || "U"
										})
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "hidden text-sm sm:inline",
										children: name
									})]
								})
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DropdownMenuContent, {
								align: "end",
								className: "w-56",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DropdownMenuLabel, {
										className: "font-normal",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
											className: "text-sm font-medium",
											children: name
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
											className: "text-xs text-muted-foreground",
											children: access?.company?.name ?? "No company"
										})]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DropdownMenuSeparator, {}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DropdownMenuItem, {
										asChild: true,
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
											to: "/settings",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Settings, { className: "size-4" }), " Settings"]
										})
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DropdownMenuItem, {
										onClick: async () => {
											await signOut();
											navigate({
												to: "/auth",
												replace: true
											});
										},
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(LogOut, { className: "size-4" }), " Sign out"]
									})
								]
							})] })
						]
					})
				]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("main", {
				className: "flex-1 p-4 sm:p-6",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Outlet, {})
			})]
		})]
	}) });
}
var $$splitComponentImporter$29 = () => import("./forgot-password-CpbKgFDy.mjs");
var Route$30 = createFileRoute("/forgot-password")({ component: lazyRouteComponent($$splitComponentImporter$29, "component") });
var $$splitComponentImporter$28 = () => import("./activity-96-nMkCl.mjs");
var Route$29 = createFileRoute("/_authenticated/activity")({ component: lazyRouteComponent($$splitComponentImporter$28, "component") });
var $$splitComponentImporter$27 = () => import("./analytics-Cte-1One.mjs");
var Route$28 = createFileRoute("/_authenticated/analytics")({ component: lazyRouteComponent($$splitComponentImporter$27, "component") });
var $$splitComponentImporter$26 = () => import("./audit-B3t0zjIg.mjs");
var Route$27 = createFileRoute("/_authenticated/audit")({ component: lazyRouteComponent($$splitComponentImporter$26, "component") });
var $$splitComponentImporter$25 = () => import("./backup-BgJgZkeR.mjs");
var Route$26 = createFileRoute("/_authenticated/backup")({ component: lazyRouteComponent($$splitComponentImporter$25, "component") });
var $$splitComponentImporter$24 = () => import("./commissions-BDWLz1Ag.mjs");
var Route$25 = createFileRoute("/_authenticated/commissions")({ component: lazyRouteComponent($$splitComponentImporter$24, "component") });
var $$splitComponentImporter$23 = () => import("./companies-BcBuazbd.mjs");
var Route$24 = createFileRoute("/_authenticated/companies")({
	head: () => ({ meta: [
		{ title: "Companies — Neon Forge Properties" },
		{
			name: "description",
			content: "Landlords, agencies and every company on the Neon Forge Properties platform."
		},
		{
			name: "robots",
			content: "noindex"
		}
	] }),
	component: lazyRouteComponent($$splitComponentImporter$23, "component")
});
var $$splitComponentImporter$22 = () => import("./dashboard-VXWzllU9.mjs");
var Route$23 = createFileRoute("/_authenticated/dashboard")({
	head: () => ({ meta: [
		{ title: "Dashboard — Neon Forge Properties" },
		{
			name: "description",
			content: "Live portfolio, occupancy and finance insights in Neon Forge Properties."
		},
		{
			name: "robots",
			content: "noindex"
		}
	] }),
	component: lazyRouteComponent($$splitComponentImporter$22, "component")
});
var $$splitComponentImporter$21 = () => import("./disbursements-BZNbKXVQ.mjs");
var Route$22 = createFileRoute("/_authenticated/disbursements")({ component: lazyRouteComponent($$splitComponentImporter$21, "component") });
var $$splitComponentImporter$20 = () => import("./employees-qL5UPcNh.mjs");
var Route$21 = createFileRoute("/_authenticated/employees")({
	head: () => ({ meta: [
		{ title: "Employees — Neon Forge Properties" },
		{
			name: "description",
			content: "Manage your company's employees and staff."
		},
		{
			name: "robots",
			content: "noindex"
		}
	] }),
	component: lazyRouteComponent($$splitComponentImporter$20, "component")
});
var $$splitComponentImporter$19 = () => import("./finance-CNuxl7zK.mjs");
var Route$20 = createFileRoute("/_authenticated/finance")({ component: lazyRouteComponent($$splitComponentImporter$19, "component") });
var $$splitComponentImporter$18 = () => import("./force-password-change-CxwD2pQW.mjs");
var Route$19 = createFileRoute("/_authenticated/force-password-change")({ component: lazyRouteComponent($$splitComponentImporter$18, "component") });
var $$splitComponentImporter$17 = () => import("./integrations-hDQwq188.mjs");
var Route$18 = createFileRoute("/_authenticated/integrations")({ component: lazyRouteComponent($$splitComponentImporter$17, "component") });
var $$splitComponentImporter$16 = () => import("./leases-CZbPx1B8.mjs");
var Route$17 = createFileRoute("/_authenticated/leases")({
	head: () => ({ meta: [
		{ title: "Leases — Neon Forge Properties" },
		{
			name: "description",
			content: "Active and past leases, move-ins and move-outs across your portfolio."
		},
		{
			name: "robots",
			content: "noindex"
		}
	] }),
	component: lazyRouteComponent($$splitComponentImporter$16, "component")
});
var $$splitComponentImporter$15 = () => import("./licences-ekL02Umq.mjs");
var Route$16 = createFileRoute("/_authenticated/licences")({
	head: () => ({ meta: [
		{ title: "Licence Management — Neon Forge Properties" },
		{
			name: "description",
			content: "Activation licences issued to companies on Neon Forge Properties."
		},
		{
			name: "robots",
			content: "noindex"
		}
	] }),
	component: lazyRouteComponent($$splitComponentImporter$15, "component")
});
var $$splitComponentImporter$14 = () => import("./listings-ZD0_yDSS.mjs");
var Route$15 = createFileRoute("/_authenticated/listings")({ component: lazyRouteComponent($$splitComponentImporter$14, "component") });
var $$splitComponentImporter$13 = () => import("./maintenance-DknTz5Uy.mjs");
var Route$14 = createFileRoute("/_authenticated/maintenance")({ component: lazyRouteComponent($$splitComponentImporter$13, "component") });
var $$splitComponentImporter$12 = () => import("./map-Waw4ZNwf.mjs");
var Route$13 = createFileRoute("/_authenticated/map")({ component: lazyRouteComponent($$splitComponentImporter$12, "component") });
var $$splitComponentImporter$11 = () => import("./onboarding-DqTGGiSc.mjs");
var Route$12 = createFileRoute("/_authenticated/onboarding")({
	head: () => ({ meta: [
		{ title: "Activate your company — Neon Forge Properties" },
		{
			name: "description",
			content: "Complete KYC, register your first property and activate your Neon Forge Properties licence."
		},
		{
			name: "robots",
			content: "noindex"
		}
	] }),
	component: lazyRouteComponent($$splitComponentImporter$11, "component")
});
var $$splitComponentImporter$10 = () => import("./pricing-B6ydDM3B.mjs");
var Route$11 = createFileRoute("/_authenticated/pricing")({
	head: () => ({ meta: [
		{ title: "Pricing Rules — Neon Forge Properties" },
		{
			name: "description",
			content: "Per-unit subscription pricing and platform fees on Neon Forge Properties."
		},
		{
			name: "robots",
			content: "noindex"
		}
	] }),
	component: lazyRouteComponent($$splitComponentImporter$10, "component")
});
var $$splitComponentImporter$9 = () => import("./properties-nNp5AslF.mjs");
var Route$10 = createFileRoute("/_authenticated/properties")({
	head: () => ({ meta: [
		{ title: "Properties — Neon Forge Properties" },
		{
			name: "description",
			content: "Register properties and configure their unit types in Neon Forge Properties."
		},
		{
			name: "robots",
			content: "noindex"
		}
	] }),
	component: lazyRouteComponent($$splitComponentImporter$9, "component")
});
var $$splitComponentImporter$8 = () => import("./refunds-DFzrdwW9.mjs");
var Route$9 = createFileRoute("/_authenticated/refunds")({ component: lazyRouteComponent($$splitComponentImporter$8, "component") });
var $$splitComponentImporter$7 = () => import("./reports-m7I6uTPW.mjs");
var Route$8 = createFileRoute("/_authenticated/reports")({ component: lazyRouteComponent($$splitComponentImporter$7, "component") });
var $$splitComponentImporter$6 = () => import("./roles-U5xq-aNY.mjs");
var Route$7 = createFileRoute("/_authenticated/roles")({
	head: () => ({ meta: [
		{ title: "Roles & Permissions — Neon Forge Properties" },
		{
			name: "description",
			content: "Create roles and edit the permission matrix."
		},
		{
			name: "robots",
			content: "noindex"
		}
	] }),
	component: lazyRouteComponent($$splitComponentImporter$6, "component")
});
var $$splitComponentImporter$5 = () => import("./settings-rGGn2kgT.mjs");
var Route$6 = createFileRoute("/_authenticated/settings")({
	head: () => ({ meta: [
		{ title: "Settings — Neon Forge Properties" },
		{
			name: "description",
			content: "Account, company and appearance settings."
		},
		{
			name: "robots",
			content: "noindex"
		}
	] }),
	component: lazyRouteComponent($$splitComponentImporter$5, "component")
});
var $$splitComponentImporter$4 = () => import("./subscriptions-CZ1LziJR.mjs");
var Route$5 = createFileRoute("/_authenticated/subscriptions")({
	head: () => ({ meta: [
		{ title: "Subscriptions — Neon Forge Properties" },
		{
			name: "description",
			content: "Monthly per-unit subscription charges across Neon Forge Properties companies."
		},
		{
			name: "robots",
			content: "noindex"
		}
	] }),
	component: lazyRouteComponent($$splitComponentImporter$4, "component")
});
var $$splitComponentImporter$3 = () => import("./support-D9Ohu_2E.mjs");
var Route$4 = createFileRoute("/_authenticated/support")({ component: lazyRouteComponent($$splitComponentImporter$3, "component") });
var $$splitComponentImporter$2 = () => import("./tenants-DSA1MeTL.mjs");
var Route$3 = createFileRoute("/_authenticated/tenants")({
	head: () => ({ meta: [
		{ title: "Tenants — Neon Forge Properties" },
		{
			name: "description",
			content: "Tenant register with contacts, KYC status and active leases."
		},
		{
			name: "robots",
			content: "noindex"
		}
	] }),
	component: lazyRouteComponent($$splitComponentImporter$2, "component")
});
var $$splitComponentImporter$1 = () => import("./transactions-C84_IYLy.mjs");
var Route$2 = createFileRoute("/_authenticated/transactions")({ component: lazyRouteComponent($$splitComponentImporter$1, "component") });
var $$splitComponentImporter = () => import("./units-ClhcsCt7.mjs");
var Route$1 = createFileRoute("/_authenticated/units")({
	head: () => ({ meta: [
		{ title: "Units — Neon Forge Properties" },
		{
			name: "description",
			content: "Every unit across your portfolio, with occupancy status."
		},
		{
			name: "robots",
			content: "noindex"
		}
	] }),
	component: lazyRouteComponent($$splitComponentImporter, "component")
});
function SignedUrlLink({ path, label }) {
	const [url, setUrl] = (0, import_react.useState)("");
	(0, import_react.useEffect)(() => {
		if (!path) return;
		if (path.startsWith("http")) {
			setUrl(path);
			return;
		}
		supabase.storage.from("kyc_documents").createSignedUrl(path, 3600).then(({ data }) => {
			if (data?.signedUrl) setUrl(data.signedUrl);
			else setUrl("#error");
		});
	}, [path]);
	if (!url) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
		className: "text-xs text-muted-foreground animate-pulse",
		children: "Loading..."
	});
	if (url === "#error") return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
		className: "text-xs text-destructive",
		children: "Failed to load"
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", {
		href: url,
		target: "_blank",
		rel: "noreferrer",
		className: "text-primary hover:underline text-xs",
		children: label
	});
}
var Route = createFileRoute("/_authenticated/verification")({
	head: () => ({ meta: [
		{ title: "Verification Queue — Neon Forge Properties" },
		{
			name: "description",
			content: "Field verification of properties, landlords and agencies."
		},
		{
			name: "robots",
			content: "noindex"
		}
	] }),
	component: VerificationPage
});
function VerificationPage() {
	const { can, user } = useAuth();
	const sendEmail = useServerFn(sendEmailFn);
	const queryClient = useQueryClient();
	const [reports, setReports] = (0, import_react.useState)({});
	const { data: requests, isLoading } = useQuery({
		queryKey: ["verification-requests"],
		queryFn: async () => {
			const { data, error } = await supabase.from("verification_requests").select("id, target_type, status, latitude, longitude, report, created_at, company_id, property_id, properties(name, address), companies(name, kra_pin, id_document_url, profile_picture_url)").order("created_at", { ascending: false });
			if (error) throw error;
			return data;
		}
	});
	const decide = useMutation({
		mutationFn: async ({ row, status }) => {
			const coords = await new Promise((resolve) => {
				if (!navigator.geolocation) return resolve({
					lat: null,
					lng: null
				});
				navigator.geolocation.getCurrentPosition((p) => resolve({
					lat: p.coords.latitude,
					lng: p.coords.longitude
				}), () => resolve({
					lat: null,
					lng: null
				}), { timeout: 4e3 });
			});
			const { error } = await supabase.from("verification_requests").update({
				status,
				report: reports[row.id] ?? row.report,
				decision_at: (/* @__PURE__ */ new Date()).toISOString(),
				decided_by: user?.id ?? null,
				latitude: coords.lat ?? row.latitude,
				longitude: coords.lng ?? row.longitude
			}).eq("id", row.id);
			if (error) throw error;
			if (row.target_type === "company" && row.company_id) await supabase.from("companies").update({ kyc_status: status === "approved" ? "approved" : "rejected" }).eq("id", row.company_id);
			else if (row.property_id) await supabase.from("properties").update({
				verification_status: status === "approved" ? "verified" : "rejected",
				verified_at: (/* @__PURE__ */ new Date()).toISOString(),
				verified_by: user?.id ?? null
			}).eq("id", row.property_id);
		},
		onSuccess: () => {
			queryClient.invalidateQueries();
			toast.success("Verification recorded");
		},
		onError: (error) => toast.error(error.message)
	});
	const manualActivate = useMutation({
		mutationFn: async (companyId) => {
			const { error } = await supabase.from("companies").update({ activation_status: "active" }).eq("id", companyId);
			if (error) throw error;
			const { error: rpcError } = await supabase.rpc("generate_licence", { _company_id: companyId });
			if (rpcError) throw rpcError;
			const trialEnd = /* @__PURE__ */ new Date();
			trialEnd.setDate(trialEnd.getDate() + 30);
			await supabase.from("platform_subscriptions").insert({
				company_id: companyId,
				status: "trialing",
				trial_ends_at: trialEnd.toISOString(),
				current_period_end: trialEnd.toISOString()
			});
			const { data: profiles } = await supabase.from("profiles").select("email").eq("company_id", companyId).limit(1);
			if (profiles && profiles.length > 0) await sendEmail({ data: {
				to: profiles[0].email ?? "",
				subject: "Account Activated - Welcome to Neon Forge Properties!",
				htmlContent: "<h1>Welcome to Neon Forge Properties!</h1><p>Your account has been manually activated by an administrator. You can now start adding properties and units to your dashboard.</p>"
			} });
		},
		onSuccess: () => {
			toast.success("Company manually activated");
			queryClient.invalidateQueries();
		},
		onError: (e) => toast.error(e.message)
	});
	const pending = (requests ?? []).filter((r) => r.status === "pending");
	const done = (requests ?? []).filter((r) => r.status !== "pending");
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "mx-auto max-w-5xl space-y-6",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
			className: "text-2xl font-semibold tracking-tight",
			children: "Verification queue"
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "mt-1 text-sm text-muted-foreground",
			children: "Confirm ownership on the ground, capture GPS, then approve or reject."
		})] }), isLoading ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "h-40 w-full" }) : !requests?.length ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Card, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardContent, {
			className: "py-14 text-center text-sm text-muted-foreground",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(BadgeCheck, { className: "mx-auto mb-3 size-6" }), "Nothing in the queue. Requests appear here when a company submits a property for verification."]
		}) }) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "space-y-4",
			children: [pending.map((r) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardHeader, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex flex-wrap items-start justify-between gap-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardTitle, {
					className: "text-base",
					children: r.properties?.name ?? r.companies?.name ?? titleCase(r.target_type)
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardDescription, { children: [
					r.companies?.name,
					" · ",
					r.properties?.address ?? "No address",
					" ·",
					" ",
					shortDate(r.created_at)
				] })] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
					variant: statusTone(r.status),
					children: titleCase(r.status)
				})]
			}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardContent, {
				className: "space-y-3",
				children: [
					r.latitude && r.longitude && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "flex items-center gap-1.5 text-xs text-muted-foreground",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MapPin, { className: "size-3.5" }),
							" ",
							r.latitude,
							", ",
							r.longitude
						]
					}),
					r.companies && (r.companies.kra_pin || r.companies.id_document_url || r.companies.profile_picture_url) && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "rounded-md border p-3 bg-muted/20 text-sm space-y-2 mb-3",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "font-medium text-xs text-muted-foreground uppercase tracking-wider",
								children: "KYC Documents"
							}),
							r.companies.kra_pin && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", { children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: "KRA PIN:" }),
								" ",
								r.companies.kra_pin
							] }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex gap-4 mt-2",
								children: [r.companies.id_document_url && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SignedUrlLink, {
									path: r.companies.id_document_url,
									label: "View ID Document"
								}), r.companies.profile_picture_url && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SignedUrlLink, {
									path: r.companies.profile_picture_url,
									label: "View Profile Picture"
								})]
							})
						]
					}),
					can("verification.approve") && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Textarea, {
						placeholder: "Verification report — what you saw on site, documents checked…",
						defaultValue: r.report ?? "",
						onChange: (e) => setReports((s) => ({
							...s,
							[r.id]: e.target.value
						}))
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex gap-2",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								size: "sm",
								disabled: decide.isPending,
								onClick: () => decide.mutate({
									row: r,
									status: "approved"
								}),
								children: "Approve"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								size: "sm",
								variant: "destructive",
								disabled: decide.isPending,
								onClick: () => decide.mutate({
									row: r,
									status: "rejected"
								}),
								children: "Reject"
							}),
							r.target_type === "company" && r.company_id && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								size: "sm",
								variant: "outline",
								disabled: manualActivate.isPending,
								onClick: () => manualActivate.mutate(r.company_id),
								children: manualActivate.isPending ? "Activating..." : "Manually Activate"
							})
						]
					})] })
				]
			})] }, r.id)), done.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardHeader, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardTitle, {
				className: "text-base",
				children: "Completed"
			}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardContent, {
				className: "space-y-2",
				children: done.map((r) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-center justify-between border-b border-border py-2 text-sm last:border-0",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: r.properties?.name ?? r.companies?.name ?? "—" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-center gap-3",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
							variant: statusTone(r.status),
							children: titleCase(r.status)
						}), r.status === "rejected" && can("verification.approve") && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							size: "sm",
							variant: "outline",
							disabled: decide.isPending,
							onClick: () => decide.mutate({
								row: r,
								status: "approved"
							}),
							children: "Approve"
						})]
					})]
				}, r.id))
			})] })]
		})]
	});
}
var IndexRoute = Route$32.update({
	id: "/",
	path: "/",
	getParentRoute: () => Route$33
});
var AuthenticatedRouteRoute = Route$31.update({
	id: "/_authenticated",
	getParentRoute: () => Route$33
});
var AuthRoute = Route$34.update({
	id: "/auth",
	path: "/auth",
	getParentRoute: () => Route$33
});
var ForgotPasswordRoute = Route$30.update({
	id: "/forgot-password",
	path: "/forgot-password",
	getParentRoute: () => Route$33
});
var AuthenticatedRouteRouteChildren = {
	AuthenticatedActivityRoute: Route$29.update({
		id: "/activity",
		path: "/activity",
		getParentRoute: () => AuthenticatedRouteRoute
	}),
	AuthenticatedAnalyticsRoute: Route$28.update({
		id: "/analytics",
		path: "/analytics",
		getParentRoute: () => AuthenticatedRouteRoute
	}),
	AuthenticatedAuditRoute: Route$27.update({
		id: "/audit",
		path: "/audit",
		getParentRoute: () => AuthenticatedRouteRoute
	}),
	AuthenticatedBackupRoute: Route$26.update({
		id: "/backup",
		path: "/backup",
		getParentRoute: () => AuthenticatedRouteRoute
	}),
	AuthenticatedCommissionsRoute: Route$25.update({
		id: "/commissions",
		path: "/commissions",
		getParentRoute: () => AuthenticatedRouteRoute
	}),
	AuthenticatedCompaniesRoute: Route$24.update({
		id: "/companies",
		path: "/companies",
		getParentRoute: () => AuthenticatedRouteRoute
	}),
	AuthenticatedDashboardRoute: Route$23.update({
		id: "/dashboard",
		path: "/dashboard",
		getParentRoute: () => AuthenticatedRouteRoute
	}),
	AuthenticatedDisbursementsRoute: Route$22.update({
		id: "/disbursements",
		path: "/disbursements",
		getParentRoute: () => AuthenticatedRouteRoute
	}),
	AuthenticatedEmployeesRoute: Route$21.update({
		id: "/employees",
		path: "/employees",
		getParentRoute: () => AuthenticatedRouteRoute
	}),
	AuthenticatedFinanceRoute: Route$20.update({
		id: "/finance",
		path: "/finance",
		getParentRoute: () => AuthenticatedRouteRoute
	}),
	AuthenticatedForcePasswordChangeRoute: Route$19.update({
		id: "/force-password-change",
		path: "/force-password-change",
		getParentRoute: () => AuthenticatedRouteRoute
	}),
	AuthenticatedIntegrationsRoute: Route$18.update({
		id: "/integrations",
		path: "/integrations",
		getParentRoute: () => AuthenticatedRouteRoute
	}),
	AuthenticatedLeasesRoute: Route$17.update({
		id: "/leases",
		path: "/leases",
		getParentRoute: () => AuthenticatedRouteRoute
	}),
	AuthenticatedLicencesRoute: Route$16.update({
		id: "/licences",
		path: "/licences",
		getParentRoute: () => AuthenticatedRouteRoute
	}),
	AuthenticatedListingsRoute: Route$15.update({
		id: "/listings",
		path: "/listings",
		getParentRoute: () => AuthenticatedRouteRoute
	}),
	AuthenticatedMaintenanceRoute: Route$14.update({
		id: "/maintenance",
		path: "/maintenance",
		getParentRoute: () => AuthenticatedRouteRoute
	}),
	AuthenticatedMapRoute: Route$13.update({
		id: "/map",
		path: "/map",
		getParentRoute: () => AuthenticatedRouteRoute
	}),
	AuthenticatedOnboardingRoute: Route$12.update({
		id: "/onboarding",
		path: "/onboarding",
		getParentRoute: () => AuthenticatedRouteRoute
	}),
	AuthenticatedPricingRoute: Route$11.update({
		id: "/pricing",
		path: "/pricing",
		getParentRoute: () => AuthenticatedRouteRoute
	}),
	AuthenticatedPropertiesRoute: Route$10.update({
		id: "/properties",
		path: "/properties",
		getParentRoute: () => AuthenticatedRouteRoute
	}),
	AuthenticatedRefundsRoute: Route$9.update({
		id: "/refunds",
		path: "/refunds",
		getParentRoute: () => AuthenticatedRouteRoute
	}),
	AuthenticatedReportsRoute: Route$8.update({
		id: "/reports",
		path: "/reports",
		getParentRoute: () => AuthenticatedRouteRoute
	}),
	AuthenticatedRolesRoute: Route$7.update({
		id: "/roles",
		path: "/roles",
		getParentRoute: () => AuthenticatedRouteRoute
	}),
	AuthenticatedSettingsRoute: Route$6.update({
		id: "/settings",
		path: "/settings",
		getParentRoute: () => AuthenticatedRouteRoute
	}),
	AuthenticatedSubscriptionsRoute: Route$5.update({
		id: "/subscriptions",
		path: "/subscriptions",
		getParentRoute: () => AuthenticatedRouteRoute
	}),
	AuthenticatedSupportRoute: Route$4.update({
		id: "/support",
		path: "/support",
		getParentRoute: () => AuthenticatedRouteRoute
	}),
	AuthenticatedTenantsRoute: Route$3.update({
		id: "/tenants",
		path: "/tenants",
		getParentRoute: () => AuthenticatedRouteRoute
	}),
	AuthenticatedTransactionsRoute: Route$2.update({
		id: "/transactions",
		path: "/transactions",
		getParentRoute: () => AuthenticatedRouteRoute
	}),
	AuthenticatedUnitsRoute: Route$1.update({
		id: "/units",
		path: "/units",
		getParentRoute: () => AuthenticatedRouteRoute
	}),
	AuthenticatedVerificationRoute: Route.update({
		id: "/verification",
		path: "/verification",
		getParentRoute: () => AuthenticatedRouteRoute
	}),
	AuthenticatedLeasesLeaseIdStatementRoute: Route$35.update({
		id: "/leases_/$leaseId/statement",
		path: "/leases/$leaseId/statement",
		getParentRoute: () => AuthenticatedRouteRoute
	})
};
var rootRouteChildren = {
	IndexRoute,
	AuthenticatedRouteRoute: AuthenticatedRouteRoute._addFileChildren(AuthenticatedRouteRouteChildren),
	AuthRoute,
	ForgotPasswordRoute
};
var routeTree = Route$33._addFileChildren(rootRouteChildren)._addFileTypes();
var getRouter = () => {
	const queryClient = new QueryClient();
	return createRouter({
		routeTree,
		context: { queryClient },
		scrollRestoration: true,
		defaultPreloadStaleTime: 0
	});
};
//#endregion
export { getRouter };
