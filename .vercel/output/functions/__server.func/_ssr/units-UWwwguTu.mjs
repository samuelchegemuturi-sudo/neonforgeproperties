import { o as __toESM } from "../_runtime.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { p as require_jsx_runtime } from "../_libs/@radix-ui/react-avatar+[...].mjs";
import { a as CardHeader, n as CardContent, o as CardTitle, t as Card } from "./card-CcQOx-bn.mjs";
import { t as supabase } from "./client-BNXqJcVa.mjs";
import { i as useQueryClient, n as useQuery, t as useMutation } from "../_libs/tanstack__react-query.mjs";
import { i as useAuth } from "./auth-BCmnXUlU.mjs";
import { t as Button } from "./button-Bq5vK6RO.mjs";
import { t as Input } from "./input-B8Q2ztVi.mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { L as DoorOpen } from "../_libs/lucide-react.mjs";
import { a as TableHeader, i as TableHead, n as TableBody, o as TableRow, r as TableCell, t as Table } from "./table-C0WYWEQX.mjs";
import { t as Badge } from "./badge-D1Dupn2y.mjs";
import { t as Skeleton } from "./skeleton-D9W9wFsj.mjs";
import { a as SelectValue, i as SelectTrigger, n as SelectContent, r as SelectItem, t as Select } from "./select-Dg1urBTx.mjs";
import { a as statusTone, o as titleCase, r as money } from "./platform-Df7WJh8D.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/units-UWwwguTu.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function UnitsPage() {
	const { access, can } = useAuth();
	const queryClient = useQueryClient();
	const currency = access?.company?.currency ?? "KES";
	const [search, setSearch] = (0, import_react.useState)("");
	const [status, setStatus] = (0, import_react.useState)("all");
	const { data: units, isLoading } = useQuery({
		queryKey: ["units"],
		queryFn: async () => {
			const { data, error } = await supabase.from("units").select("id, unit_number, status, rent, properties(name), unit_types(label)").order("unit_number");
			if (error) throw error;
			return data;
		}
	});
	const toggle = useMutation({
		mutationFn: async (unit) => {
			const { error } = await supabase.from("units").update({ status: unit.status === "occupied" ? "vacant" : "occupied" }).eq("id", unit.id);
			if (error) throw error;
		},
		onSuccess: () => {
			queryClient.invalidateQueries();
			toast.success("Unit updated");
		},
		onError: (error) => toast.error(error.message)
	});
	const rows = (units ?? []).filter((u) => {
		if (status !== "all" && u.status !== status) return false;
		if (search && !`${u.unit_number} ${u.properties?.name ?? ""}`.toLowerCase().includes(search.toLowerCase())) return false;
		return true;
	});
	const occupied = (units ?? []).filter((u) => u.status === "occupied").length;
	const total = units?.length ?? 0;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "mx-auto max-w-6xl space-y-6",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
			className: "text-2xl font-semibold tracking-tight",
			children: "Units"
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
			className: "mt-1 text-sm text-muted-foreground",
			children: [
				total,
				" units · ",
				occupied,
				" occupied ·",
				" ",
				total ? Math.round(occupied / total * 100) : 0,
				"% occupancy"
			]
		})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardHeader, {
			className: "flex flex-row flex-wrap items-center gap-2 space-y-0",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
					placeholder: "Search unit or property…",
					value: search,
					onChange: (e) => setSearch(e.target.value),
					className: "h-9 max-w-xs"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
					value: status,
					onValueChange: setStatus,
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, {
						className: "h-9 w-40",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, {})
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SelectContent, { children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
							value: "all",
							children: "All statuses"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
							value: "vacant",
							children: "Vacant"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
							value: "occupied",
							children: "Occupied"
						})
					] })]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardTitle, {
					className: "sr-only",
					children: "Unit list"
				})
			]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardContent, {
			className: "px-0",
			children: isLoading ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "space-y-2 px-6",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "h-10 w-full" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "h-10 w-full" })]
			}) : !rows.length ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				className: "px-6 py-12 text-center text-sm text-muted-foreground",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DoorOpen, { className: "mx-auto mb-3 size-6" }), "No units yet — add unit types to a property and they are generated for you."]
			}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "overflow-x-auto",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Table, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHeader, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TableRow, { children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, { children: "Unit" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, { children: "Property" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, { children: "Type" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, { children: "Rent" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, { children: "Status" }),
					can("unit.edit") && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, {
						className: "text-right",
						children: "Actions"
					})
				] }) }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableBody, { children: rows.map((u) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TableRow, { children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
						className: "font-medium",
						children: u.unit_number
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, { children: u.properties?.name ?? "—" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, { children: u.unit_types?.label ?? "—" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, { children: money(u.rent, currency) }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
						variant: statusTone(u.status),
						children: titleCase(u.status)
					}) }),
					can("unit.edit") && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
						className: "text-right",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
							size: "sm",
							variant: "ghost",
							onClick: () => toggle.mutate(u),
							children: ["Mark ", u.status === "occupied" ? "vacant" : "occupied"]
						})
					})
				] }, u.id)) })] })
			})
		})] })]
	});
}
//#endregion
export { UnitsPage as component };
