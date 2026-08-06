import { o as __toESM } from "../_runtime.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { p as require_jsx_runtime } from "../_libs/@radix-ui/react-avatar+[...].mjs";
import { a as CardHeader, n as CardContent, o as CardTitle, r as CardDescription, t as Card } from "./card-CcQOx-bn.mjs";
import { t as supabase } from "./client-BNXqJcVa.mjs";
import { i as useQueryClient, n as useQuery, t as useMutation } from "../_libs/tanstack__react-query.mjs";
import { i as useAuth } from "./auth-BCmnXUlU.mjs";
import { t as Button } from "./button-Bq5vK6RO.mjs";
import { t as Input } from "./input-B8Q2ztVi.mjs";
import { t as Label } from "./label-DBD1bRRP.mjs";
import { _ as useNavigate } from "../_libs/@tanstack/react-router+[...].mjs";
import { c as registerCompanyFn, t as activateTrialSubscriptionFn, u as renewSubscriptionFn } from "./platform.functions-BWY0p-Ku.mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { A as LoaderCircle } from "../_libs/lucide-react.mjs";
import { t as Badge } from "./badge-D1Dupn2y.mjs";
import { t as Skeleton } from "./skeleton-D9W9wFsj.mjs";
import { r as money } from "./platform-Df7WJh8D.mjs";
import { t as ie } from "../_libs/paystack__inline-js.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/onboarding-lzw75mjr.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function Onboarding() {
	const { access } = useAuth();
	const companyId = access?.profile?.company_id ?? null;
	const navigate = useNavigate();
	const queryClient = useQueryClient();
	const currency = access?.company?.currency ?? "KES";
	const [kyc, setKyc] = (0, import_react.useState)({
		registration_no: "",
		tax_pin: "",
		contact_phone: ""
	});
	const [kraPin, setKraPin] = (0, import_react.useState)("");
	const [idFile, setIdFile] = (0, import_react.useState)(null);
	const [picFile, setPicFile] = (0, import_react.useState)(null);
	const { data, isLoading } = useQuery({
		queryKey: ["onboarding", companyId],
		enabled: Boolean(companyId),
		queryFn: async () => {
			const [company, properties, unitTypes, units, licence, fee] = await Promise.all([
				supabase.from("companies").select("id, name, kyc_status, activation_status, verification_status, created_at").eq("id", companyId).maybeSingle(),
				supabase.from("properties").select("id, name, verification_status").eq("company_id", companyId),
				supabase.from("unit_types").select("id").eq("company_id", companyId),
				supabase.from("units").select("id", {
					count: "exact",
					head: true
				}).eq("company_id", companyId),
				supabase.from("licences").select("code, issued_at, activation_fee").eq("company_id", companyId).maybeSingle(),
				supabase.from("platform_settings").select("key, value").in("key", ["activation_fee", "pg_paystack_public_key"])
			]);
			const settings = fee.data ?? [];
			settings.find((s) => s.key === "activation_fee")?.value;
			const paystackKey = settings.find((s) => s.key === "pg_paystack_public_key")?.value ?? "";
			const propertiesList = properties.data ?? [];
			const verifiedProperties = propertiesList.filter((p) => p.verification_status !== "pending");
			let isFirstMonth = company.data?.activation_status === "pending_activation";
			let finalFee = isFirstMonth ? 20 : (verifiedProperties.length || 0) * 500;
			return {
				company: company.data,
				properties: propertiesList,
				verifiedPropertiesCount: verifiedProperties.length,
				unitTypes: unitTypes.data ?? [],
				unitCount: units.count ?? 0,
				licence: licence.data,
				fee: finalFee,
				isFirstMonth,
				paystackKey: String(paystackKey).replace(/^"|"$/g, "")
			};
		}
	});
	const saveKyc = useMutation({
		mutationFn: async () => {
			let id_document_url = null;
			let profile_picture_url = null;
			if (idFile) {
				const ext = idFile.name.split(".").pop();
				const path = `${access?.profile?.id}/id_${Date.now()}.${ext}`;
				const { error } = await supabase.storage.from("kyc_documents").upload(path, idFile);
				if (error) throw error;
				id_document_url = path;
			}
			if (picFile) {
				const ext = picFile.name.split(".").pop();
				const path = `${access?.profile?.id}/pic_${Date.now()}.${ext}`;
				const { error } = await supabase.storage.from("kyc_documents").upload(path, picFile);
				if (error) throw error;
				profile_picture_url = path;
			}
			const { error } = await supabase.from("companies").update({
				kyc_status: "submitted",
				kyc_details: kyc,
				kra_pin: kraPin,
				...id_document_url && { id_document_url },
				...profile_picture_url && { profile_picture_url }
			}).eq("id", companyId);
			if (error) throw error;
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
			await supabase.from("verification_requests").insert({
				company_id: companyId,
				target_type: "company",
				latitude: coords.lat,
				longitude: coords.lng
			});
		},
		onSuccess: () => {
			toast.success("KYC details submitted for verification");
			queryClient.invalidateQueries({ queryKey: ["onboarding", companyId] });
		},
		onError: (e) => toast.error(e.message)
	});
	const activate = useMutation({
		mutationFn: async (reference) => {
			if (data?.company?.activation_status === "pending_activation") {
				await activateTrialSubscriptionFn({ data: { company_id: companyId } });
				return "Trial Activated";
			} else {
				await renewSubscriptionFn({ data: { company_id: companyId } });
				return "Subscription Renewed";
			}
		},
		onSuccess: (msg) => {
			toast.success(msg);
			queryClient.invalidateQueries();
			navigate({
				to: "/dashboard",
				replace: true
			});
		},
		onError: (e) => toast.error(e.message)
	});
	const payWithPaystack = () => {
		if (!data?.paystackKey || data.paystackKey === "pk_test_placeholder") {
			toast.error("Paystack public key is not configured in Integrations settings.");
			return;
		}
		new ie().newTransaction({
			key: data.paystackKey,
			email: access?.profile?.email ?? "billing@neonforgeproperties.com",
			amount: data.fee * 100,
			currency,
			metadata: { custom_fields: [{
				display_name: "Company ID",
				variable_name: "company_id",
				value: companyId
			}] },
			onSuccess: (transaction) => {
				toast.success("Payment successful! Activating your account...");
				activate.mutate(transaction.reference);
			},
			onCancel: () => {
				toast.info("Payment window closed.");
			}
		});
	};
	const registerCompany = useMutation({
		mutationFn: async (vars) => {
			return await registerCompanyFn({ data: vars });
		},
		onSuccess: () => {
			toast.success("Company created successfully!");
			window.location.reload();
		},
		onError: (e) => toast.error(e.message)
	});
	if (!companyId) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "mx-auto max-w-sm mt-12",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardHeader, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardTitle, { children: "Create your company" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardDescription, { children: "Tell us about your property management company to get started." })] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardContent, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
			onSubmit: (e) => {
				e.preventDefault();
				const form = new FormData(e.currentTarget);
				registerCompany.mutate({
					company_name: String(form.get("company_name")),
					phone: String(form.get("phone")),
					company_type: String(form.get("company_type"))
				});
			},
			className: "space-y-4",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "space-y-1.5",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
						htmlFor: "company_name",
						children: "Company Name"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
						id: "company_name",
						name: "company_name",
						required: true
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "space-y-1.5",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
						htmlFor: "phone",
						children: "Phone Number"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
						id: "phone",
						name: "phone",
						required: true
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "space-y-1.5",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
						htmlFor: "company_type",
						children: "Company Type"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("select", {
						id: "company_type",
						name: "company_type",
						className: "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
						required: true,
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
								value: "individual_landlord",
								children: "Individual Landlord"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
								value: "property_management_agency",
								children: "Property Management Agency"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
								value: "bnb_host",
								children: "AirBnB / Short Term Host"
							})
						]
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
					type: "submit",
					className: "w-full",
					disabled: registerCompany.isPending,
					children: [registerCompany.isPending && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "mr-2 size-4 animate-spin" }), "Create Company"]
				})
			]
		}) })] })
	});
	if (isLoading || !data) return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "mx-auto max-w-3xl space-y-4",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "h-10 w-64" }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "h-40 w-full" }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "h-40 w-full" })
		]
	});
	const kycDone = [
		"submitted",
		"verified",
		"approved"
	].includes(data.company?.kyc_status ?? "");
	const isPendingActivation = data.company?.activation_status === "pending_activation";
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "mx-auto max-w-3xl space-y-6",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
			className: "text-2xl font-semibold tracking-tight",
			children: isPendingActivation ? `Activate ${data.company?.name}` : `Company Settings for ${data.company?.name}`
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "mt-1 text-sm text-muted-foreground",
			children: isPendingActivation ? "Get started with your Neon Forge Properties licence by activating a 30-day trial." : "Manage your company KYC and subscription renewal."
		})] }), isPendingActivation ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardHeader, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardTitle, {
			className: "text-base",
			children: "Start your 30-day trial"
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardDescription, { children: [
			"One-time activation fee of ",
			money(20, currency),
			" for your first 30 days. After 30 days, standard billing applies (KES 500 per property)."
		] })] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardContent, {
			className: "space-y-3",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-sm text-muted-foreground",
				children: "Pay securely with Paystack to instantly activate your account and start managing your properties."
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
				disabled: activate.isPending,
				onClick: () => {
					data.fee = 20;
					payWithPaystack();
				},
				children: [
					activate.isPending && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "mr-2 size-4 animate-spin" }),
					"Pay ",
					money(20, currency),
					" & Activate Trial"
				]
			})]
		})] }) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardHeader, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardTitle, {
			className: "text-base",
			children: "Company KYC"
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardDescription, { children: "Registration and tax details used on invoices and disbursements." })] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardContent, { children: kycDone ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Badge, {
			variant: "secondary",
			children: ["Submitted — ", data.company?.kyc_status]
		}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
			className: "grid gap-3 sm:grid-cols-3",
			onSubmit: (e) => {
				e.preventDefault();
				saveKyc.mutate();
			},
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "space-y-1.5",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
						htmlFor: "reg",
						children: "Registration no. (Optional)"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
						id: "reg",
						value: kyc.registration_no,
						onChange: (e) => setKyc({
							...kyc,
							registration_no: e.target.value
						})
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "space-y-1.5",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
						htmlFor: "pin",
						children: "KRA PIN"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
						id: "pin",
						value: kraPin,
						onChange: (e) => setKraPin(e.target.value),
						required: true
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "space-y-1.5",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
						htmlFor: "phone",
						children: "Contact phone"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
						id: "phone",
						value: kyc.contact_phone,
						onChange: (e) => setKyc({
							...kyc,
							contact_phone: e.target.value
						}),
						required: true
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "space-y-1.5 sm:col-span-3",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
						htmlFor: "idDoc",
						children: "ID Document (PDF or Image)"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
						id: "idDoc",
						type: "file",
						accept: "image/*,application/pdf",
						onChange: (e) => setIdFile(e.target.files?.[0] ?? null),
						required: true
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "space-y-1.5 sm:col-span-3",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
						htmlFor: "picFile",
						children: "Profile Picture / Selfie"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
						id: "picFile",
						type: "file",
						accept: "image/*",
						onChange: (e) => setPicFile(e.target.files?.[0] ?? null),
						required: true
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "sm:col-span-3",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
						type: "submit",
						disabled: saveKyc.isPending,
						children: [saveKyc.isPending && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "mr-2 size-4 animate-spin" }), "Submit KYC Documents"]
					})
				})
			]
		}) })] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardHeader, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardTitle, {
			className: "text-base",
			children: "Subscription & Renewal"
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardDescription, { children: [
			"Standard billing of ",
			money(500, currency),
			" per registered property."
		] })] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardContent, {
			className: "space-y-3",
			children: data.properties.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-sm text-muted-foreground",
				children: "You currently have 0 properties registered. Please add a property first to calculate your renewal fee."
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
				onClick: () => navigate({ to: "/properties" }),
				children: "Add Properties"
			})] }) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				className: "text-sm text-muted-foreground",
				children: [
					"Your current renewal fee based on ",
					data.verifiedPropertiesCount,
					" verified properties is ",
					money(data.fee, currency),
					"."
				]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
				disabled: activate.isPending,
				onClick: payWithPaystack,
				children: [
					activate.isPending && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "mr-2 size-4 animate-spin" }),
					"Pay ",
					money(data.fee, currency),
					" to Renew"
				]
			})] })
		})] })] })]
	});
}
//#endregion
export { Onboarding as component };
