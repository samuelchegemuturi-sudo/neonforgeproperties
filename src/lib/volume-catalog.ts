export type VolumeStatus = "available" | "partial" | "planned";

export type VolumeCapability = {
  name: string;
  status: VolumeStatus;
  note: string;
};

export type ProductVolume = {
  id: number;
  title: string;
  summary: string;
  portal: "Foundation" | "Super Admin" | "Organization" | "Tenant" | "Marketplace" | "Platform";
  capabilities: VolumeCapability[];
};

export const STATUS_LABELS: Record<VolumeStatus, string> = {
  available: "Available",
  partial: "Partially built",
  planned: "Missing / planned",
};

export const STATUS_TONES: Record<VolumeStatus, "default" | "secondary" | "outline"> = {
  available: "default",
  partial: "secondary",
  planned: "outline",
};

export const PRODUCT_VOLUMES: ProductVolume[] = [
  {
    id: 1,
    title: "Project Foundation",
    portal: "Foundation",
    summary:
      "Core SaaS, tenancy, RBAC, subscriptions, licensing, modules, security, and standards.",
    capabilities: [
      {
        name: "Multi-tenant Supabase/PostgreSQL",
        status: "available",
        note: "Company-scoped tables and RLS migrations exist.",
      },
      {
        name: "RBAC and permissions",
        status: "available",
        note: "Roles, permissions, and route guards are implemented.",
      },
      {
        name: "Dynamic module engine",
        status: "partial",
        note: "Company enabled_modules gates navigation; richer module metadata is still needed.",
      },
      {
        name: "Country/currency engines",
        status: "planned",
        note: "Not yet represented as first-class settings.",
      },
      {
        name: "AI and notification engines",
        status: "planned",
        note: "Configuration placeholders exist, but no shared runtime engine yet.",
      },
    ],
  },
  {
    id: 2,
    title: "Super Admin Portal",
    portal: "Super Admin",
    summary:
      "SaaS owner controls for organizations, subscriptions, licensing, settings, reports, and operations.",
    capabilities: [
      {
        name: "Companies and activation",
        status: "available",
        note: "Company registration, activation, and verification screens exist.",
      },
      {
        name: "Subscriptions, licences, pricing",
        status: "available",
        note: "Admin routes and server functions exist.",
      },
      {
        name: "Integrations and backup",
        status: "partial",
        note: "Settings and export tooling exist; monitoring/security center are still missing.",
      },
      {
        name: "Country, currency, AI, messaging management",
        status: "planned",
        note: "Need dedicated admin screens and tables.",
      },
    ],
  },
  {
    id: 3,
    title: "Organization Portal",
    portal: "Organization",
    summary:
      "Shared workspace for landlords, agencies, developers, SACCOs, corporate housing, real estate, and Airbnb hosts.",
    capabilities: [
      {
        name: "Properties, units, tenants, leases",
        status: "available",
        note: "Core property operations are present.",
      },
      {
        name: "Maintenance, branches, staff, roles",
        status: "available",
        note: "Operational routes exist.",
      },
      {
        name: "Buildings, blocks, floors, amenities, tours",
        status: "planned",
        note: "Detailed property hierarchy/media modules are not yet built.",
      },
      {
        name: "Visitors, applications, inspections, inventory",
        status: "planned",
        note: "These workflows need database and UI coverage.",
      },
    ],
  },
  {
    id: 4,
    title: "Tenant Mobile App",
    portal: "Tenant",
    summary:
      "Mobile tenant experience for search, applications, leases, documents, maintenance, messaging, and offline support.",
    capabilities: [
      {
        name: "Tenant records",
        status: "partial",
        note: "Tenant management exists inside the organization portal.",
      },
      {
        name: "Dedicated mobile app shell",
        status: "planned",
        note: "No mobile-specific app, offline support, or tenant navigation yet.",
      },
      {
        name: "Messages, announcements, visitor management",
        status: "planned",
        note: "Tenant-facing communication workflows are missing.",
      },
    ],
  },
  {
    id: 5,
    title: "Property Marketplace",
    portal: "Marketplace",
    summary:
      "Public marketplace for rentals, sales, short stay, projects, leads, reviews, SEO, and AI descriptions.",
    capabilities: [
      { name: "Listings", status: "partial", note: "Internal listings route exists." },
      {
        name: "Public marketplace and SEO",
        status: "planned",
        note: "No dedicated public marketplace routes yet.",
      },
      {
        name: "Reviews, ratings, lead capture",
        status: "planned",
        note: "CRM exists, but public lead capture is missing.",
      },
    ],
  },
  {
    id: 6,
    title: "Business Type Modules",
    portal: "Platform",
    summary:
      "Configurable modules for landlords, agencies, real estate, developers, SACCOs, corporate housing, and Airbnb hosts.",
    capabilities: [
      {
        name: "Business type list",
        status: "available",
        note: "Supported company types are defined in platform helpers.",
      },
      {
        name: "Module-gated navigation",
        status: "available",
        note: "Sidebar uses enabled_modules.",
      },
      {
        name: "Dynamic dashboards per type",
        status: "partial",
        note: "Dashboard exists but needs richer per-type widgets.",
      },
    ],
  },
  {
    id: 7,
    title: "Financial Engine",
    portal: "Platform",
    summary:
      "Subscriptions, invoices, receipts, multi-currency, taxes, payments, expenses, commissions, and DigiTax/eTIMS.",
    capabilities: [
      {
        name: "Invoices, transactions, commissions",
        status: "available",
        note: "Finance routes and hooks exist.",
      },
      {
        name: "Paystack activation",
        status: "partial",
        note: "Paystack is wired for activation; tenant-isolated gateway setup needs expansion.",
      },
      {
        name: "Multi-currency, exchange rates, budgeting",
        status: "planned",
        note: "Not yet first-class modules.",
      },
    ],
  },
  {
    id: 8,
    title: "Integrations",
    portal: "Platform",
    summary:
      "Supabase, Stripe, Paystack, M-Pesa, DigiTax/eTIMS, maps, calendar, messaging, storage, exchange rates, and AI providers.",
    capabilities: [
      { name: "Supabase", status: "available", note: "Client and server integrations exist." },
      {
        name: "Paystack and DigiTax settings",
        status: "partial",
        note: "Settings exist; provider-specific workflows need hardening.",
      },
      {
        name: "Stripe, M-Pesa, WhatsApp, calendar, plugin marketplace",
        status: "planned",
        note: "Still missing dedicated integrations.",
      },
    ],
  },
  {
    id: 9,
    title: "AI System",
    portal: "Platform",
    summary:
      "AI copilots for properties, tenants, agencies, development, sales, maintenance, accounting, security, and market intelligence.",
    capabilities: [
      {
        name: "AI configuration",
        status: "planned",
        note: "No provider abstraction or AI workflows are implemented yet.",
      },
    ],
  },
  {
    id: 10,
    title: "Automation Engine",
    portal: "Platform",
    summary:
      "No-code workflows, triggers, conditions, actions, approvals, scheduled jobs, recurring tasks, and escalations.",
    capabilities: [
      {
        name: "Scheduled database jobs",
        status: "partial",
        note: "Some migrations include recurring/data-retention behavior.",
      },
      {
        name: "No-code workflow builder",
        status: "planned",
        note: "Needs workflow schema, UI, and execution engine.",
      },
    ],
  },
  {
    id: 11,
    title: "Analytics",
    portal: "Platform",
    summary:
      "Revenue, occupancy, vacancy, sales, projects, construction, maintenance, expenses, profitability, growth, forecasting, and AI insights.",
    capabilities: [
      {
        name: "Analytics dashboards",
        status: "partial",
        note: "Analytics and reports routes exist with baseline metrics.",
      },
      {
        name: "Forecasting and AI insights",
        status: "planned",
        note: "Predictive analytics are not yet implemented.",
      },
    ],
  },
  {
    id: 12,
    title: "Security",
    portal: "Platform",
    summary:
      "Auth, RBAC, RLS, encryption, audit logs, 2FA, session management, threat detection, rate limiting, backups, and recovery.",
    capabilities: [
      {
        name: "Auth, RBAC, RLS, audit logs",
        status: "available",
        note: "Core security foundations exist.",
      },
      {
        name: "Backups",
        status: "partial",
        note: "CSV export exists; full disaster recovery workflows are missing.",
      },
      {
        name: "2FA, threat detection, rate limiting",
        status: "planned",
        note: "Needs product and infrastructure implementation.",
      },
    ],
  },
  {
    id: 13,
    title: "UI/UX",
    portal: "Platform",
    summary:
      "Design system, components, themes, dark mode, accessibility, responsive UI, tables, forms, charts, maps, calendars, and navigation.",
    capabilities: [
      {
        name: "Component library and theming",
        status: "available",
        note: "Shared UI components and theme customizer exist.",
      },
      {
        name: "Maps and charts",
        status: "partial",
        note: "Baseline routes exist; accessibility polish is ongoing.",
      },
    ],
  },
  {
    id: 14,
    title: "Database",
    portal: "Foundation",
    summary:
      "Complete schema, indexes, foreign keys, triggers, functions, views, policies, seed data, migrations, and ER diagrams.",
    capabilities: [
      { name: "Migrations", status: "partial", note: "Many Supabase migrations exist." },
      {
        name: "ER diagrams and full schema docs",
        status: "planned",
        note: "Documentation artifacts are missing.",
      },
    ],
  },
  {
    id: 15,
    title: "API",
    portal: "Platform",
    summary:
      "REST, realtime, edge functions, webhooks, OpenAPI, versioning, rate limits, SDK, and testing.",
    capabilities: [
      {
        name: "Supabase realtime/API foundation",
        status: "partial",
        note: "Supabase clients exist; formal API surface is missing.",
      },
      {
        name: "OpenAPI, SDK, webhooks",
        status: "planned",
        note: "Needs dedicated API package/docs.",
      },
    ],
  },
  {
    id: 16,
    title: "Deployment",
    portal: "Platform",
    summary:
      "Development, testing, production, Docker, Hatchable, Vercel, CI/CD, monitoring, logging, health checks, and scaling.",
    capabilities: [
      { name: "Vercel/Nitro build", status: "available", note: "Vite/Nitro build targets Vercel." },
      {
        name: "Docker, CI/CD, monitoring, health checks",
        status: "planned",
        note: "Deployment operations need dedicated setup.",
      },
    ],
  },
  {
    id: 17,
    title: "Documentation",
    portal: "Foundation",
    summary:
      "Administrator, organization, tenant, API, developer, installation, deployment, backup, recovery, and troubleshooting guides.",
    capabilities: [
      { name: "Route README", status: "partial", note: "Some developer notes exist." },
      {
        name: "Complete user/developer documentation",
        status: "planned",
        note: "Most guidebooks are missing.",
      },
    ],
  },
];

export function getVolumeSummary() {
  const capabilities = PRODUCT_VOLUMES.flatMap((volume) => volume.capabilities);
  return {
    totalVolumes: PRODUCT_VOLUMES.length,
    available: capabilities.filter((capability) => capability.status === "available").length,
    partial: capabilities.filter((capability) => capability.status === "partial").length,
    planned: capabilities.filter((capability) => capability.status === "planned").length,
  };
}
