import { o as __toESM } from "../_runtime.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { p as require_jsx_runtime } from "../_libs/@radix-ui/react-avatar+[...].mjs";
import { a as CardHeader, n as CardContent, o as CardTitle, r as CardDescription, t as Card } from "./card-CcQOx-bn.mjs";
import { t as supabase } from "./client-BNXqJcVa.mjs";
import { i as useQueryClient, n as useQuery, t as useMutation } from "../_libs/tanstack__react-query.mjs";
import { i as useAuth } from "./auth-BCmnXUlU.mjs";
import { t as Button } from "./button-Bq5vK6RO.mjs";
import { t as Input } from "./input-B8Q2ztVi.mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { U as CirclePlus, m as Search } from "../_libs/lucide-react.mjs";
import { a as TableHeader, i as TableHead, n as TableBody, o as TableRow, r as TableCell, t as Table } from "./table-C0WYWEQX.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/branches-B3O_1V0T.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function BranchesComponent() {
	const { access, can } = useAuth();
	const companyId = access?.profile?.company_id;
	const queryClient = useQueryClient();
	const [isCreating, setIsCreating] = (0, import_react.useState)(false);
	const [newBranchName, setNewBranchName] = (0, import_react.useState)("");
	const [searchTerm, setSearchTerm] = (0, import_react.useState)("");
	const { data: branches, isLoading } = useQuery({
		queryKey: ["branches", companyId],
		enabled: Boolean(companyId),
		queryFn: async () => {
			const { data, error } = await supabase.from("branches").select("*").eq("company_id", companyId).order("name");
			if (error) throw error;
			return data;
		}
	});
	const createBranch = useMutation({
		mutationFn: async (name) => {
			const { data, error } = await supabase.from("branches").insert({
				company_id: companyId,
				name
			}).select().single();
			if (error) throw error;
			return data;
		},
		onSuccess: () => {
			toast.success("Branch created");
			setNewBranchName("");
			setIsCreating(false);
			queryClient.invalidateQueries({ queryKey: ["branches"] });
		},
		onError: (e) => toast.error(e.message)
	});
	const deleteBranch = useMutation({
		mutationFn: async (id) => {
			await supabase.from("properties").update({ branch_id: null }).eq("branch_id", id);
			const { error } = await supabase.from("branches").delete().eq("id", id);
			if (error) throw error;
		},
		onSuccess: () => {
			toast.success("Branch deleted");
			queryClient.invalidateQueries({ queryKey: ["branches"] });
		},
		onError: (e) => toast.error(e.message)
	});
	if (!companyId) return null;
	const filteredBranches = branches?.filter((b) => b.name.toLowerCase().includes(searchTerm.toLowerCase())) || [];
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "p-6 space-y-6",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-center justify-between",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
					className: "text-2xl font-bold tracking-tight",
					children: "Branches / Regions"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-muted-foreground",
					children: "Manage your property portfolios, regions, or branches."
				})] }), can("property.manage") && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
					onClick: () => setIsCreating(!isCreating),
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CirclePlus, { className: "mr-2 h-4 w-4" }), "New Branch"]
				})]
			}),
			isCreating && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Card, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardContent, {
				className: "pt-6 flex gap-4",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
						placeholder: "e.g. Nairobi Region",
						value: newBranchName,
						onChange: (e) => setNewBranchName(e.target.value),
						onKeyDown: (e) => e.key === "Enter" && createBranch.mutate(newBranchName)
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						onClick: () => createBranch.mutate(newBranchName),
						disabled: !newBranchName.trim() || createBranch.isPending,
						children: "Save"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						variant: "outline",
						onClick: () => setIsCreating(false),
						children: "Cancel"
					})
				]
			}) }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardHeader, {
				className: "flex flex-row items-center justify-between",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardTitle, { children: "Existing Branches" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardDescription, { children: "Group properties to filter reports and dashboard metrics." })] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "w-64",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "relative",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Search, { className: "absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
							placeholder: "Search branches...",
							className: "pl-8",
							value: searchTerm,
							onChange: (e) => setSearchTerm(e.target.value)
						})]
					})
				})]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardContent, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Table, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHeader, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TableRow, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, { children: "Branch Name" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, {
				className: "w-[100px] text-right",
				children: "Actions"
			})] }) }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableBody, { children: isLoading ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableRow, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
				colSpan: 2,
				className: "text-center",
				children: "Loading..."
			}) }) : filteredBranches.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableRow, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
				colSpan: 2,
				className: "text-center text-muted-foreground py-8",
				children: "No branches found."
			}) }) : filteredBranches.map((branch) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TableRow, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
				className: "font-medium",
				children: branch.name
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
				className: "text-right",
				children: can("property.manage") && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					variant: "ghost",
					className: "text-destructive hover:text-destructive",
					size: "sm",
					onClick: () => {
						if (confirm("Are you sure? Any properties assigned to this branch will become unassigned.")) deleteBranch.mutate(branch.id);
					},
					children: "Delete"
				})
			})] }, branch.id)) })] }) })] })
		]
	});
}
//#endregion
export { BranchesComponent as component };
