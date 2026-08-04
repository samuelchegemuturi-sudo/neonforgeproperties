export const COMPANY_TYPES = [
  { value: "individual_landlord", label: "Individual Landlord" },
  { value: "property_management_agency", label: "Property Management Agency" },
  { value: "airbnb_host", label: "Airbnb Host" },
  { value: "real_estate_company", label: "Real Estate Company" },
  { value: "sacco", label: "SACCO" },
  { value: "developer", label: "Developer" },
  { value: "corporate_housing", label: "Corporate Housing" },
] as const;

export const AGENCY_TYPES = ["property_management_agency", "real_estate_company"];

export function companyTypeLabel(value: string | null | undefined) {
  return COMPANY_TYPES.find((t) => t.value === value)?.label ?? "Unknown";
}

export function money(amount: number | string | null | undefined, currency = "KES") {
  const n = Number(amount ?? 0);
  return `${currency} ${n.toLocaleString("en-KE", { maximumFractionDigits: 0 })}`;
}

export function titleCase(value: string | null | undefined) {
  if (!value) return "—";
  return value
    .split("_")
    .map((p) => p.charAt(0).toUpperCase() + p.slice(1))
    .join(" ");
}

export function statusTone(status: string | null | undefined) {
  switch (status) {
    case "active":
    case "verified":
    case "approved":
    case "paid":
    case "occupied":
      return "default" as const;
    case "pending":
    case "pending_activation":
    case "unverified":
    case "vacant":
      return "secondary" as const;
    case "suspended":
    case "rejected":
    case "overdue":
      return "destructive" as const;
    default:
      return "outline" as const;
  }
}

export type SubscriptionQuote = {
  total: number;
  units: number;
  basis: string;
  breakdown: {
    label: string;
    slug: string;
    qty: number;
    price: number;
    subtotal: number;
  }[];
};

export function shortDate(value: string | null | undefined) {
  if (!value) return "—";
  return new Date(value).toLocaleDateString("en-KE", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}
