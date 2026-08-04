import { o as __toESM } from "../_runtime.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { p as require_jsx_runtime } from "../_libs/@radix-ui/react-avatar+[...].mjs";
import { a as CardHeader, o as CardTitle, r as CardDescription, t as Card } from "./card-CcQOx-bn.mjs";
import { t as supabase } from "./client-BNXqJcVa.mjs";
import { i as useQueryClient, n as useQuery, t as useMutation } from "../_libs/tanstack__react-query.mjs";
import { n as useAuth } from "./auth-D3Dl5b08.mjs";
import { t as Button } from "./button-Bq5vK6RO.mjs";
import { t as Input } from "./input-B8Q2ztVi.mjs";
import { f as sendEmailFn } from "./platform.functions-BTrKAh3m.mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { H as CirclePlus, m as Search, n as Wrench } from "../_libs/lucide-react.mjs";
import { t as Badge } from "./badge-D1Dupn2y.mjs";
import { t as useServerFn } from "./useServerFn-CrZF2pjq.mjs";
import { a as DialogHeader, i as DialogFooter, n as DialogContent, o as DialogTitle, r as DialogDescription, s as DialogTrigger, t as Dialog } from "./dialog-DIo89e4g.mjs";
import { a as SelectValue, i as SelectTrigger, n as SelectContent, r as SelectItem, t as Select } from "./select-Dg1urBTx.mjs";
import { a as TableHeader, i as TableHead, n as TableBody, o as TableRow, r as TableCell, t as Table } from "./table-C0WYWEQX.mjs";
import { t as Textarea } from "./textarea-kko37XEX.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/maintenance-DknTz5Uy.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function MaintenanceComponent() {
	const { access, user } = useAuth();
	const sendEmail = useServerFn(sendEmailFn);
	const companyId = access?.profile?.company_id ?? null;
	const isSuper = access?.profile?.is_super_admin;
	const queryClient = useQueryClient();
	const [open, setOpen] = (0, import_react.useState)(false);
	const [searchTerm, setSearchTerm] = (0, import_react.useState)("");
	const [title, setTitle] = (0, import_react.useState)("");
	const [description, setDescription] = (0, import_react.useState)("");
	const [priority, setPriority] = (0, import_react.useState)("medium");
	const [propertyId, setPropertyId] = (0, import_react.useState)("");
	const [unitId, setUnitId] = (0, import_react.useState)("");
	const [assignedTo, setAssignedTo] = (0, import_react.useState)("");
	const queryEnabled = Boolean(companyId) || Boolean(isSuper);
	const { data: properties } = useQuery({
		queryKey: ["properties", companyId],
		enabled: Boolean(companyId),
		queryFn: async () => {
			const { data, error } = await supabase.from("properties").select("id, name").eq("company_id", companyId);
			if (error) throw error;
			return data;
		}
	});
	const { data: employees } = useQuery({
		queryKey: ["employees", companyId],
		enabled: Boolean(companyId),
		queryFn: async () => {
			const { data, error } = await supabase.from("profiles").select("id, full_name, email").eq("company_id", companyId);
			if (error) throw error;
			return data;
		}
	});
	const { data: units } = useQuery({
		queryKey: ["units", propertyId],
		enabled: Boolean(propertyId),
		queryFn: async () => {
			const { data, error } = await supabase.from("units").select("id, unit_number").eq("property_id", propertyId);
			if (error) throw error;
			return data;
		}
	});
	const { data: requests, isLoading } = useQuery({
		queryKey: [
			"maintenance_requests",
			companyId,
			isSuper
		],
		enabled: queryEnabled,
		queryFn: async () => {
			let query = supabase.from("maintenance_requests").select(`
          id, title, status, priority, created_at,
          properties (name),
          units (unit_number),
          reported_by (email, full_name)
        `).order("created_at", { ascending: false });
			if (companyId) query = query.eq("company_id", companyId);
			else if (!isSuper) return [];
			const { data, error } = await query;
			if (error) throw error;
			return data;
		}
	});
	const createRequest = useMutation({
		mutationFn: async () => {
			if (!companyId) throw new Error("No company associated.");
			const { data, error } = await supabase.from("maintenance_requests").insert({
				company_id: companyId,
				title,
				description,
				priority,
				property_id: propertyId || null,
				unit_id: unitId || null,
				assigned_to: assignedTo === "unassigned" ? null : assignedTo || null,
				reported_by: access?.profile?.id
			});
			if (error) throw error;
			return data;
		},
		onSuccess: async () => {
			toast.success("Maintenance request submitted");
			if (assignedTo) {
				const assignedEmployee = employees?.find((e) => e.id === assignedTo);
				if (assignedEmployee?.email) await sendEmail({ data: {
					to: assignedEmployee.email,
					subject: "New Maintenance Work Order Assigned",
					htmlContent: `
                <h1>New Work Order: ${title}</h1>
                <p>Hello ${assignedEmployee.full_name},</p>
                <p>A new maintenance request has been assigned to you.</p>
                <p><strong>Priority:</strong> <span style="text-transform: capitalize;">${priority}</span></p>
                <p><strong>Description:</strong> ${description}</p>
                <p>Please log in to the Neon Forge Properties platform to view and update the status.</p>
              `
				} });
			}
			setOpen(false);
			setTitle("");
			setDescription("");
			setPriority("medium");
			setPropertyId("");
			setUnitId("");
			setAssignedTo("");
			queryClient.invalidateQueries({ queryKey: ["maintenance_requests"] });
		},
		onError: (e) => toast.error(e.message)
	});
	const updateStatus = useMutation({
		mutationFn: async ({ id, status, reqInfo }) => {
			const { error } = await supabase.from("maintenance_requests").update({ status }).eq("id", id);
			if (error) throw error;
			return {
				id,
				status,
				reqInfo
			};
		},
		onSuccess: async ({ status, reqInfo }) => {
			toast.success("Status updated");
			queryClient.invalidateQueries({ queryKey: ["maintenance_requests"] });
			if (status === "completed" && reqInfo?.reported_by?.email) await sendEmail({ data: {
				to: reqInfo.reported_by.email,
				subject: `Maintenance Request Resolved: ${reqInfo.title}`,
				htmlContent: `
              <h1>Issue Resolved</h1>
              <p>Hello ${reqInfo.reported_by.full_name},</p>
              <p>Your maintenance request <strong>"${reqInfo.title}"</strong> has been marked as <strong>Resolved</strong>.</p>
              <p>If you have any further issues, please don't hesitate to reach out.</p>
            `
			} });
		}
	});
	const filteredRequests = requests?.filter((r) => r.title.toLowerCase().includes(searchTerm.toLowerCase())) ?? [];
	if (!queryEnabled) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "p-6",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Card, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardHeader, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardTitle, { children: "Maintenance" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardDescription, { children: "You must belong to a company to manage maintenance requests." })] }) })
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "p-6 space-y-6 flex flex-col h-full",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex items-center justify-between",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
				className: "text-2xl font-bold tracking-tight",
				children: "Maintenance"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-muted-foreground",
				children: "Manage and track property work orders."
			})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Dialog, {
				open,
				onOpenChange: setOpen,
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogTrigger, {
					asChild: true,
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CirclePlus, { className: "mr-2 h-4 w-4" }), "New Work Order"] })
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogContent, { children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogHeader, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogTitle, { children: "Create Work Order" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogDescription, { children: "Submit a new maintenance request." })] }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "space-y-4 py-4",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "space-y-2",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
									className: "text-sm font-medium",
									children: "Issue Title"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
									value: title,
									onChange: (e) => setTitle(e.target.value),
									placeholder: "e.g. Leaking Faucet"
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "grid grid-cols-2 gap-4",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "space-y-2",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
										className: "text-sm font-medium",
										children: "Property"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
										value: propertyId,
										onValueChange: setPropertyId,
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, { placeholder: "Select Property" }) }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectContent, { children: properties?.map((p) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
											value: p.id,
											children: p.name
										}, p.id)) })]
									})]
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "space-y-2",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
										className: "text-sm font-medium",
										children: "Unit (Optional)"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
										value: unitId,
										onValueChange: setUnitId,
										disabled: !propertyId,
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, { placeholder: "Select Unit" }) }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectContent, { children: units?.map((u) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
											value: u.id,
											children: u.unit_number
										}, u.id)) })]
									})]
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "space-y-2",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
									className: "text-sm font-medium",
									children: "Priority"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
									value: priority,
									onValueChange: setPriority,
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, {}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SelectContent, { children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
											value: "low",
											children: "Low"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
											value: "medium",
											children: "Medium"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
											value: "high",
											children: "High"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
											value: "urgent",
											children: "Urgent"
										})
									] })]
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "space-y-2",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
									className: "text-sm font-medium",
									children: "Assign To"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
									value: assignedTo,
									onValueChange: setAssignedTo,
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, { placeholder: "Unassigned" }) }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SelectContent, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
										value: "unassigned",
										children: "Unassigned"
									}), employees?.map((e) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
										value: e.id,
										children: e.full_name
									}, e.id))] })]
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "space-y-2",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
									className: "text-sm font-medium",
									children: "Description"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Textarea, {
									value: description,
									onChange: (e) => setDescription(e.target.value),
									placeholder: "Provide details about the issue...",
									className: "min-h-[100px]"
								})]
							})
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogFooter, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						variant: "outline",
						onClick: () => setOpen(false),
						children: "Cancel"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						onClick: () => createRequest.mutate(),
						disabled: createRequest.isPending || !title.trim(),
						children: createRequest.isPending ? "Submitting..." : "Submit Order"
					})] })
				] })]
			})]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
			className: "flex-1",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "p-4 border-b flex items-center gap-4",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "relative w-64",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Search, { className: "absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
						type: "search",
						placeholder: "Search work orders...",
						className: "pl-8",
						value: searchTerm,
						onChange: (e) => setSearchTerm(e.target.value)
					})]
				})
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "relative w-full overflow-auto",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Table, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHeader, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TableRow, { children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, { children: "Issue" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, { children: "Location" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, { children: "Status" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, { children: "Priority" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, { children: "Date" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, {
						className: "text-right",
						children: "Actions"
					})
				] }) }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableBody, { children: isLoading ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableRow, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
					colSpan: 6,
					className: "h-24 text-center",
					children: "Loading requests..."
				}) }) : filteredRequests.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableRow, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TableCell, {
					colSpan: 6,
					className: "h-24 text-center flex flex-col items-center justify-center gap-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Wrench, { className: "h-8 w-8 text-muted-foreground" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: "No maintenance requests found." })]
				}) }) : filteredRequests.map((req) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TableRow, { children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
						className: "font-medium",
						children: req.title
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TableCell, { children: [req.properties?.name, req.units?.unit_number && ` - Unit ${req.units?.unit_number}`] }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
						variant: req.status === "completed" ? "default" : req.status === "pending" ? "secondary" : "default",
						children: req.status
					}) }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
						variant: req.priority === "high" ? "destructive" : req.priority === "medium" ? "default" : "secondary",
						children: req.priority
					}) }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, { children: new Date(req.created_at).toLocaleDateString() }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TableCell, {
						className: "text-right",
						children: [req.status !== "completed" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							variant: "outline",
							size: "sm",
							onClick: () => updateStatus.mutate({
								id: req.id,
								status: "completed",
								reqInfo: req
							}),
							children: "Mark Complete"
						}), req.status === "completed" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							variant: "outline",
							size: "sm",
							onClick: () => updateStatus.mutate({
								id: req.id,
								status: "pending",
								reqInfo: req
							}),
							children: "Reopen"
						})]
					})
				] }, req.id)) })] })
			})]
		})]
	});
}
//#endregion
export { MaintenanceComponent as component };
