import { i as __toESM } from "../_runtime.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { p as require_jsx_runtime } from "../_libs/@radix-ui/react-avatar+[...].mjs";
import { a as CardHeader, n as CardContent, o as CardTitle, r as CardDescription, t as Card } from "./card-BfBj_YIE.mjs";
import { t as supabase } from "./client-BNXqJcVa.mjs";
import { i as useQueryClient, n as useQuery, t as useMutation } from "../_libs/tanstack__react-query.mjs";
import { n as useAuth } from "./auth-D3Dl5b08.mjs";
import { t as Button } from "./button-Bq5vK6RO.mjs";
import { t as Input } from "./input-B8Q2ztVi.mjs";
import { t as Label } from "./label-DBD1bRRP.mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { D as MapPin, X as Building2, et as BadgeCheck, v as Plus } from "../_libs/lucide-react.mjs";
import { t as Skeleton } from "./skeleton-D9W9wFsj.mjs";
import { t as Badge } from "./badge-D1Dupn2y.mjs";
import { a as statusTone, i as shortDate, o as titleCase, r as money } from "./platform-Df7WJh8D.mjs";
import { a as DialogHeader, i as DialogFooter, n as DialogContent, o as DialogTitle, r as DialogDescription, s as DialogTrigger, t as Dialog } from "./dialog-DIo89e4g.mjs";
import { a as SelectValue, i as SelectTrigger, n as SelectContent, r as SelectItem, t as Select } from "./select-Dg1urBTx.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/properties-ClAFhJhY.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function PropertiesPage() {
	const { access, can } = useAuth();
	const queryClient = useQueryClient();
	const companyId = access?.profile?.company_id ?? null;
	const [open, setOpen] = (0, import_react.useState)(false);
	const [detail, setDetail] = (0, import_react.useState)(null);
	const { data: properties, isLoading } = useQuery({
		queryKey: ["properties"],
		queryFn: async () => {
			const { data, error } = await supabase.from("properties").select("id, name, property_type, address, city, latitude, longitude, status, verification_status, created_at, company_id, units(count)").order("created_at", { ascending: false });
			if (error) throw error;
			return data;
		}
	});
	const createProperty = useMutation({
		mutationFn: async (input) => {
			if (!companyId) throw new Error("You are not attached to a company");
			const { error } = await supabase.from("properties").insert({
				company_id: companyId,
				name: input["name"],
				property_type: input["property_type"],
				address: input["address"] || null,
				city: input["city"] || null,
				latitude: input["latitude"] ? Number(input["latitude"]) : null,
				longitude: input["longitude"] ? Number(input["longitude"]) : null
			});
			if (error) throw error;
		},
		onSuccess: () => {
			setOpen(false);
			queryClient.invalidateQueries({ queryKey: ["properties"] });
			toast.success("Property registered");
		},
		onError: (error) => toast.error(error.message)
	});
	const requestVerification = useMutation({
		mutationFn: async (property) => {
			const { error } = await supabase.from("verification_requests").insert({
				company_id: property.company_id,
				property_id: property.id,
				target_type: "property",
				latitude: property.latitude,
				longitude: property.longitude
			});
			if (error) throw error;
			await supabase.from("properties").update({ verification_status: "pending" }).eq("id", property.id);
		},
		onSuccess: () => {
			queryClient.invalidateQueries();
			toast.success("Sent to the verification queue");
		},
		onError: (error) => toast.error(error.message)
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "mx-auto max-w-7xl space-y-6",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex flex-wrap items-end justify-between gap-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
					className: "text-2xl font-semibold tracking-tight",
					children: "Properties"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-1 text-sm text-muted-foreground",
					children: "Register a property, then configure unit types — units are generated automatically."
				})] }), can("property.create") && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Dialog, {
					open,
					onOpenChange: setOpen,
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogTrigger, {
						asChild: true,
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, { className: "size-4" }), " Register property"] })
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogContent, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
						onSubmit: (e) => {
							e.preventDefault();
							const form = new FormData(e.currentTarget);
							createProperty.mutate(Object.fromEntries(form));
						},
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogHeader, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogTitle, { children: "Register a property" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogDescription, { children: "Location details feed the verification workflow." })] }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "grid gap-3 py-4",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "grid gap-1.5",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
											htmlFor: "p-name",
											children: "Property name"
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
											id: "p-name",
											name: "name",
											required: true,
											placeholder: "Riverside Court"
										})]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "grid gap-1.5",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
											htmlFor: "p-type",
											children: "Type"
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
											name: "property_type",
											defaultValue: "residential",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, {
												id: "p-type",
												children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, {})
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SelectContent, { children: [
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
													value: "residential",
													children: "Residential"
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
													value: "commercial",
													children: "Commercial"
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
													value: "mixed",
													children: "Mixed use"
												})
											] })]
										})]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "grid gap-1.5",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
											htmlFor: "p-address",
											children: "Address"
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
											id: "p-address",
											name: "address",
											placeholder: "Ngong Road"
										})]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "grid gap-1.5",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
											htmlFor: "p-city",
											children: "City / town"
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
											id: "p-city",
											name: "city",
											placeholder: "Nairobi"
										})]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "grid grid-cols-2 gap-3",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "grid gap-1.5",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
												htmlFor: "p-lat",
												children: "Latitude"
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
												id: "p-lat",
												name: "latitude",
												type: "number",
												step: "any"
											})]
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "grid gap-1.5",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
												htmlFor: "p-lng",
												children: "Longitude"
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
												id: "p-lng",
												name: "longitude",
												type: "number",
												step: "any"
											})]
										})]
									})
								]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogFooter, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								type: "submit",
								disabled: createProperty.isPending,
								children: createProperty.isPending ? "Saving…" : "Register property"
							}) })
						]
					}) })]
				})]
			}),
			isLoading ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid gap-4 sm:grid-cols-2 lg:grid-cols-3",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "h-40" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "h-40" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "h-40" })
				]
			}) : !properties?.length ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Card, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardContent, {
				className: "py-14 text-center text-sm text-muted-foreground",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Building2, { className: "mx-auto mb-3 size-6" }), "No properties yet. Register your first one to unlock units and billing."]
			}) }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "grid gap-4 sm:grid-cols-2 lg:grid-cols-3",
				children: properties.map((p) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
					className: "flex flex-col",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardHeader, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-start justify-between gap-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardTitle, {
								className: "text-base",
								children: p.name
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardDescription, { children: titleCase(p.property_type) })] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
								variant: statusTone(p.status),
								children: titleCase(p.status)
							})]
						}) }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardContent, {
							className: "flex-1 space-y-2 text-sm",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
									className: "flex items-center gap-1.5 text-muted-foreground",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MapPin, { className: "size-3.5" }),
										" ",
										p.address ?? "No address",
										p.city ? `, ${p.city}` : ""
									]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
									className: "text-muted-foreground",
									children: [
										p.units?.[0]?.count ?? 0,
										" units · added ",
										shortDate(p.created_at)
									]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "flex flex-wrap items-center gap-2 pt-1",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Badge, {
										variant: statusTone(p.verification_status),
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(BadgeCheck, { className: "mr-1 size-3" }), titleCase(p.verification_status)]
									})
								})
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardContent, {
							className: "flex gap-2 pt-0",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								size: "sm",
								variant: "outline",
								onClick: () => setDetail(p),
								disabled: p.verification_status !== "verified",
								children: "Unit types"
							}), can("property.edit") && p.verification_status === "unverified" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								size: "sm",
								variant: "ghost",
								onClick: () => requestVerification.mutate(p),
								disabled: requestVerification.isPending,
								children: "Request verification"
							})]
						})
					]
				}, p.id))
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(UnitTypesDialog, {
				property: detail,
				onClose: () => setDetail(null)
			})
		]
	});
}
function UnitTypesDialog({ property, onClose }) {
	const queryClient = useQueryClient();
	const { access } = useAuth();
	const currency = access?.company?.currency ?? "KES";
	const { data: rules } = useQuery({
		queryKey: ["pricing-rules"],
		queryFn: async () => {
			const { data, error } = await supabase.from("pricing_rules").select("slug, label, bedrooms, price_per_unit").order("sort_order");
			if (error) throw error;
			return data;
		}
	});
	const { data: unitTypes } = useQuery({
		queryKey: ["unit-types", property?.id],
		enabled: Boolean(property),
		queryFn: async () => {
			const { data, error } = await supabase.from("unit_types").select("id, label, pricing_slug, bedrooms, quantity, rent, service_charge, deposit").eq("property_id", property.id).order("created_at");
			if (error) throw error;
			return data;
		}
	});
	const addType = useMutation({
		mutationFn: async (form) => {
			const rule = rules?.find((r) => r.slug === form["pricing_slug"]);
			const { error } = await supabase.from("unit_types").insert({
				company_id: property.company_id,
				property_id: property.id,
				pricing_slug: form["pricing_slug"],
				label: rule?.label ?? form["pricing_slug"],
				bedrooms: rule?.bedrooms ?? 0,
				quantity: Number(form["quantity"] ?? 0),
				rent: Number(form["rent"] ?? 0),
				service_charge: Number(form["service_charge"] ?? 0),
				deposit: Number(form["deposit"] ?? 0)
			});
			if (error) throw error;
		},
		onSuccess: () => {
			queryClient.invalidateQueries();
			toast.success("Units generated");
		},
		onError: (error) => toast.error(error.message)
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Dialog, {
		open: Boolean(property),
		onOpenChange: (v) => !v && onClose(),
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogContent, {
			className: "max-w-2xl",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogHeader, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogTitle, { children: [property?.name, " — unit configuration"] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogDescription, { children: "Units are created automatically from the quantity you enter." })] }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "space-y-2",
					children: [(unitTypes ?? []).map((t) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-center justify-between rounded-md border border-border px-3 py-2 text-sm",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "font-medium",
							children: t.label
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "text-xs text-muted-foreground",
							children: [
								t.quantity,
								" units · rent ",
								money(t.rent, currency),
								" · deposit",
								" ",
								money(t.deposit, currency)
							]
						})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Badge, {
							variant: "outline",
							children: [t.bedrooms, " bd"]
						})]
					}, t.id)), !unitTypes?.length && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-sm text-muted-foreground",
						children: "No unit types configured yet."
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
					className: "grid gap-3 border-t border-border pt-4",
					onSubmit: (e) => {
						e.preventDefault();
						const form = new FormData(e.currentTarget);
						addType.mutate(Object.fromEntries(form));
						e.currentTarget.reset();
					},
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "grid gap-1.5",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
								htmlFor: "ut-slug",
								children: "Unit type"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
								name: "pricing_slug",
								defaultValue: "bedsitter",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, {
									id: "ut-slug",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, {})
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectContent, { children: (rules ?? []).map((r) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SelectItem, {
									value: r.slug,
									children: [
										r.label,
										" — ",
										money(r.price_per_unit),
										"/unit"
									]
								}, r.slug)) })]
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "grid grid-cols-2 gap-3 sm:grid-cols-4",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "grid gap-1.5",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
										htmlFor: "ut-qty",
										children: "Quantity"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
										id: "ut-qty",
										name: "quantity",
										type: "number",
										min: 1,
										defaultValue: 1,
										required: true
									})]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "grid gap-1.5",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
										htmlFor: "ut-rent",
										children: "Rent"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
										id: "ut-rent",
										name: "rent",
										type: "number",
										min: 0,
										defaultValue: 0
									})]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "grid gap-1.5",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
										htmlFor: "ut-sc",
										children: "Service charge"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
										id: "ut-sc",
										name: "service_charge",
										type: "number",
										min: 0,
										defaultValue: 0
									})]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "grid gap-1.5",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
										htmlFor: "ut-dep",
										children: "Deposit"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
										id: "ut-dep",
										name: "deposit",
										type: "number",
										min: 0,
										defaultValue: 0
									})]
								})
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogFooter, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							type: "submit",
							disabled: addType.isPending,
							children: addType.isPending ? "Generating…" : "Add unit type"
						}) })
					]
				})
			]
		})
	});
}
//#endregion
export { PropertiesPage as component };
