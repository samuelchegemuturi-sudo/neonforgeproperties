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
import { H as CirclePlus, m as Search } from "../_libs/lucide-react.mjs";
import { t as Badge } from "./badge-D1Dupn2y.mjs";
import { t as useServerFn } from "./useServerFn-CrZF2pjq.mjs";
import { a as DialogHeader, i as DialogFooter, n as DialogContent, o as DialogTitle, r as DialogDescription, s as DialogTrigger, t as Dialog } from "./dialog-DIo89e4g.mjs";
import { a as SelectValue, i as SelectTrigger, n as SelectContent, r as SelectItem, t as Select } from "./select-Dg1urBTx.mjs";
import { a as TableHeader, i as TableHead, n as TableBody, o as TableRow, r as TableCell, t as Table } from "./table-C0WYWEQX.mjs";
import { t as Textarea } from "./textarea-kko37XEX.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/support-D9Ohu_2E.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function SupportComponent() {
	const { access, user } = useAuth();
	const sendEmail = useServerFn(sendEmailFn);
	const companyId = access?.profile?.company_id ?? null;
	const isSuper = access?.profile?.is_super_admin;
	const queryClient = useQueryClient();
	const [open, setOpen] = (0, import_react.useState)(false);
	const [searchTerm, setSearchTerm] = (0, import_react.useState)("");
	const [subject, setSubject] = (0, import_react.useState)("");
	const [body, setBody] = (0, import_react.useState)("");
	const [priority, setPriority] = (0, import_react.useState)("normal");
	const queryEnabled = Boolean(companyId) || Boolean(isSuper);
	const { data: tickets, isLoading } = useQuery({
		queryKey: [
			"support_tickets",
			companyId,
			isSuper
		],
		enabled: queryEnabled,
		queryFn: async () => {
			let query = supabase.from("support_tickets").select("id, subject, status, priority, created_at, body").order("created_at", { ascending: false });
			if (companyId) query = query.eq("company_id", companyId);
			else if (!isSuper) return [];
			const { data, error } = await query;
			if (error) throw error;
			return data;
		}
	});
	const createTicket = useMutation({
		mutationFn: async () => {
			if (!companyId && !isSuper) throw new Error("No company associated.");
			const { error } = await supabase.from("support_tickets").insert({
				company_id: companyId,
				subject,
				body,
				priority,
				created_by: access?.profile?.id ?? null
			});
			if (error) throw error;
			return {
				subject,
				body
			};
		},
		onSuccess: async () => {
			toast.success("Support ticket created successfully");
			await sendEmail({ data: {
				to: "support@neonforgeproperties.com",
				subject: `New Support Ticket from ${access?.company?.name || "Company"}`,
				htmlContent: `
            <h1>New Support Ticket</h1>
            <p><strong>Company:</strong> ${access?.company?.name || "Unknown"}</p>
            <p><strong>Subject:</strong> ${subject}</p>
            <p><strong>Priority:</strong> <span style="text-transform: capitalize;">${priority}</span></p>
            <p><strong>Details:</strong></p>
            <p>${body}</p>
          `
			} });
			setOpen(false);
			setSubject("");
			setBody("");
			setPriority("normal");
			queryClient.invalidateQueries({ queryKey: ["support_tickets"] });
		},
		onError: (e) => toast.error(e.message)
	});
	const updateStatus = useMutation({
		mutationFn: async ({ id, status }) => {
			const { error } = await supabase.from("support_tickets").update({ status }).eq("id", id);
			if (error) throw error;
		},
		onSuccess: () => {
			toast.success("Status updated");
			queryClient.invalidateQueries({ queryKey: ["support_tickets"] });
		}
	});
	const filteredTickets = tickets?.filter((t) => t.subject.toLowerCase().includes(searchTerm.toLowerCase())) ?? [];
	if (!queryEnabled) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "p-6",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Card, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardHeader, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardTitle, { children: "Support" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardDescription, { children: "You must belong to a company to view support tickets." })] }) })
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "p-6 space-y-6 flex flex-col h-full",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex items-center justify-between",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
				className: "text-2xl font-bold tracking-tight",
				children: "Support Tickets"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-muted-foreground",
				children: "Manage and track your support requests."
			})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Dialog, {
				open,
				onOpenChange: setOpen,
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogTrigger, {
					asChild: true,
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CirclePlus, { className: "mr-2 h-4 w-4" }), "New Ticket"] })
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogContent, { children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogHeader, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogTitle, { children: "Create Support Ticket" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogDescription, { children: "Submit a new issue to our support team." })] }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "space-y-4 py-4",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "space-y-2",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
									className: "text-sm font-medium",
									children: "Subject"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
									value: subject,
									onChange: (e) => setSubject(e.target.value),
									placeholder: "Brief description of the issue"
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
											value: "normal",
											children: "Normal"
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
									children: "Details"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Textarea, {
									value: body,
									onChange: (e) => setBody(e.target.value),
									placeholder: "Please provide as much detail as possible...",
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
						onClick: () => createTicket.mutate(),
						disabled: createTicket.isPending || !subject.trim(),
						children: createTicket.isPending ? "Submitting..." : "Submit Ticket"
					})] })
				] })]
			})]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
			className: "flex-1",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "p-4 border-b",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "relative w-64",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Search, { className: "absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
						type: "search",
						placeholder: "Search tickets...",
						className: "pl-8",
						value: searchTerm,
						onChange: (e) => setSearchTerm(e.target.value)
					})]
				})
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "relative w-full overflow-auto",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Table, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHeader, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TableRow, { children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, { children: "Subject" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, { children: "Status" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, { children: "Priority" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, { children: "Created" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, {
						className: "text-right",
						children: "Actions"
					})
				] }) }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableBody, { children: isLoading ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableRow, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
					colSpan: 5,
					className: "h-24 text-center",
					children: "Loading tickets..."
				}) }) : filteredTickets.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableRow, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
					colSpan: 5,
					className: "h-24 text-center",
					children: "No tickets found."
				}) }) : filteredTickets.map((ticket) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TableRow, { children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
						className: "font-medium",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex flex-col",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: ticket.subject }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "text-xs text-muted-foreground truncate max-w-[300px]",
								children: ticket.body
							})]
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
						variant: ticket.status === "closed" ? "secondary" : ticket.status === "in_progress" ? "default" : "outline",
						children: ticket.status.replace("_", " ").toUpperCase()
					}) }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
						variant: ticket.priority === "urgent" || ticket.priority === "high" ? "destructive" : "secondary",
						children: ticket.priority.toUpperCase()
					}) }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, { children: new Date(ticket.created_at).toLocaleDateString() }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
						className: "text-right",
						children: isSuper && ticket.status !== "closed" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							variant: "ghost",
							size: "sm",
							onClick: () => updateStatus.mutate({
								id: ticket.id,
								status: "closed"
							}),
							children: "Close"
						})
					})
				] }, ticket.id)) })] })
			})]
		})]
	});
}
//#endregion
export { SupportComponent as component };
