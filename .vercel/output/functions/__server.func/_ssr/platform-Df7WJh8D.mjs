//#region node_modules/.nitro/vite/services/ssr/assets/platform-Df7WJh8D.js
var COMPANY_TYPES = [
	{
		value: "individual_landlord",
		label: "Individual Landlord"
	},
	{
		value: "property_management_agency",
		label: "Property Management Agency"
	},
	{
		value: "airbnb_host",
		label: "Airbnb Host"
	},
	{
		value: "real_estate_company",
		label: "Real Estate Company"
	},
	{
		value: "sacco",
		label: "SACCO"
	},
	{
		value: "developer",
		label: "Developer"
	},
	{
		value: "corporate_housing",
		label: "Corporate Housing"
	}
];
function companyTypeLabel(value) {
	return COMPANY_TYPES.find((t) => t.value === value)?.label ?? "Unknown";
}
function money(amount, currency = "KES") {
	return `${currency} ${Number(amount ?? 0).toLocaleString("en-KE", { maximumFractionDigits: 0 })}`;
}
function titleCase(value) {
	if (!value) return "—";
	return value.split("_").map((p) => p.charAt(0).toUpperCase() + p.slice(1)).join(" ");
}
function statusTone(status) {
	switch (status) {
		case "active":
		case "verified":
		case "approved":
		case "paid":
		case "occupied": return "default";
		case "pending":
		case "pending_activation":
		case "unverified":
		case "vacant": return "secondary";
		case "suspended":
		case "rejected":
		case "overdue": return "destructive";
		default: return "outline";
	}
}
function shortDate(value) {
	if (!value) return "—";
	return new Date(value).toLocaleDateString("en-KE", {
		year: "numeric",
		month: "short",
		day: "numeric"
	});
}
//#endregion
export { statusTone as a, shortDate as i, companyTypeLabel as n, titleCase as o, money as r, COMPANY_TYPES as t };
