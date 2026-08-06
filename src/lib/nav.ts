import {
  LayoutDashboard,
  Building2,
  DoorOpen,
  Users,
  Wallet,
  Wrench,
  UserCog,
  ShieldCheck,
  BadgeCheck,
  Megaphone,
  BarChart3,
  Settings,
  ScrollText,
  Activity,
  Briefcase,
  Contact,
  KeyRound,
  Tags,
  CreditCard,
  Map,
  LifeBuoy,
  ArrowLeftRight,
  Percent,
  Send,
  Undo2,
  HardDrive,
  Plug,
  DatabaseBackup,
  FileText,
  Receipt,
  CalendarDays,
  TrendingUp,
  PackageOpen,
  Handshake,
  ClipboardList,
  type LucideIcon,
} from "lucide-react";

export type NavItem = {
  label: string;
  to: string;
  icon: LucideIcon;
  permission: string;
  group: string;
  soon?: boolean;
  /** If set, item only appears when company has this module enabled */
  module?: string;
  superAdminOnly?: boolean;
  hideFromSuperAdmin?: boolean;
};

/**
 * Sidebar nav definition.
 *
 * DEDUP RULE: Items with the same `to` but different `module` are
 * intentionally module-gated aliases. The sidebar component deduplicates
 * by `to` ONLY for Super Admin (who bypasses module checks), so Super
 * Admin always sees each route exactly once — using the first occurrence.
 *
 * For company users, the module gate ensures only the relevant alias is visible.
 */
export const NAV_ITEMS: NavItem[] = [
  // ── PLATFORM ────────────────────────────────────────────────────────────
  { label: "Dashboard",      to: "/dashboard",  icon: LayoutDashboard, permission: "dashboard.view", group: "Platform" },
  { label: "Activation",     to: "/onboarding", icon: BadgeCheck,       permission: "dashboard.view", group: "Platform", hideFromSuperAdmin: true },
  { label: "Analytics",      to: "/analytics",  icon: BarChart3,        permission: "reports.view",   group: "Platform", superAdminOnly: true },
  { label: "Live Activity",  to: "/activity",   icon: Activity,         permission: "system.logs",    group: "Platform", superAdminOnly: true },

  // ── BUSINESS (Super Admin only) ──────────────────────────────────────────
  { label: "Companies",      to: "/companies",     icon: Briefcase,  permission: "companies.view",     group: "Business", superAdminOnly: true },
  { label: "Subscriptions",  to: "/subscriptions", icon: CreditCard, permission: "subscriptions.view", group: "Business", superAdminOnly: true },
  { label: "Licences",       to: "/licences",      icon: KeyRound,   permission: "licence.view",       group: "Business", superAdminOnly: true },
  { label: "Pricing Rules",  to: "/pricing",       icon: Tags,       permission: "pricing.view",       group: "Business", superAdminOnly: true },

  // ── PROPERTY ─────────────────────────────────────────────────────────────
  { label: "Properties",          to: "/properties",   icon: Building2,    permission: "property.view",    group: "Property", module: "properties" },
  { label: "Units",               to: "/units",        icon: DoorOpen,     permission: "unit.view",        group: "Property", module: "properties" },
  { label: "Rent Roll",           to: "/reports",      icon: ClipboardList,permission: "reports.view",     group: "Property", module: "tenants", hideFromSuperAdmin: true },
  { label: "Verification Queue",  to: "/verification", icon: BadgeCheck,   permission: "verification.view",group: "Property", superAdminOnly: true },
  { label: "Listings",            to: "/listings",     icon: Megaphone,    permission: "listing.view",     group: "Property", module: "properties" },
  { label: "Map View",            to: "/map",          icon: Map,          permission: "property.view",    group: "Property", module: "properties" },
  { label: "Booking Calendar",    to: "/airbnb",       icon: CalendarDays, permission: "property.view",    group: "Property", module: "airbnb", hideFromSuperAdmin: true },
  { label: "Projects (Off-plan)", to: "/construction", icon: HardDrive,    permission: "property.view",    group: "Property", module: "construction", hideFromSuperAdmin: true },
  { label: "Sales",               to: "/sales",        icon: Tags,         permission: "property.view",    group: "Property", module: "sales", hideFromSuperAdmin: true },

  // ── USERS ─────────────────────────────────────────────────────────────────
  { label: "Employees",           to: "/employees", icon: UserCog,    permission: "employees.view", group: "Users" },
  // Tenants — label adapts per module (only one will show per company type)
  { label: "Tenants",             to: "/tenants",   icon: Users,      permission: "tenant.view",   group: "Users", module: "tenants" },
  { label: "Guests",              to: "/tenants",   icon: Users,      permission: "tenant.view",   group: "Users", module: "airbnb", hideFromSuperAdmin: true },
  { label: "Buyers / Investors",  to: "/tenants",   icon: Users,      permission: "tenant.view",   group: "Users", module: "construction", hideFromSuperAdmin: true },
  { label: "Leases",              to: "/leases",    icon: FileText,   permission: "tenant.view",   group: "Users", module: "tenants" },
  { label: "Leads / CRM",         to: "/crm",       icon: Contact,    permission: "tenant.view",   group: "Users", module: "crm" },
  { label: "Members",             to: "/members",   icon: Users,      permission: "tenant.view",   group: "Users", module: "members", hideFromSuperAdmin: true },
  { label: "Documents",           to: "/documents", icon: FileText,   permission: "tenant.view",   group: "Users", module: "properties" },
  { label: "Roles & Permissions", to: "/roles",     icon: ShieldCheck,permission: "roles.view",    group: "Users" },

  // ── FINANCE ───────────────────────────────────────────────────────────────
  { label: "Finance Overview",  to: "/finance",       icon: Wallet,         permission: "finance.view",   group: "Finance", module: "accounting" },
  // Invoices — first occurrence wins for super admin dedup; company users see via module gate
  { label: "Invoices (eTIMS)",  to: "/invoices",      icon: Receipt,        permission: "finance.view",   group: "Finance", module: "accounting" },
  { label: "Transactions",      to: "/transactions",  icon: ArrowLeftRight, permission: "finance.view",   group: "Finance", module: "accounting" },
  { label: "Commissions",       to: "/commissions",   icon: Percent,        permission: "finance.view",   group: "Finance", module: "accounting" },
  { label: "Disbursements",     to: "/disbursements", icon: Send,           permission: "finance.view",   group: "Finance", module: "accounting" },
  { label: "Refunds",           to: "/refunds",       icon: Undo2,          permission: "finance.refund", group: "Finance", module: "accounting" },
  { label: "Revenue Reports",   to: "/reports",       icon: BarChart3,      permission: "reports.view",   group: "Finance", module: "accounting" },
  // Module-specific aliases (hidden from super admin — they already see the canonical routes above)
  { label: "Invoices (eTIMS)",  to: "/invoices",      icon: Receipt,        permission: "finance.view",   group: "Finance", module: "airbnb",       hideFromSuperAdmin: true },
  { label: "Invoices (eTIMS)",  to: "/invoices",      icon: Receipt,        permission: "finance.view",   group: "Finance", module: "construction",  hideFromSuperAdmin: true },
  { label: "RevPAR Reports",    to: "/airbnb",        icon: TrendingUp,     permission: "reports.view",   group: "Finance", module: "airbnb",         hideFromSuperAdmin: true },
  { label: "Earned Commissions",to: "/commissions",   icon: Percent,        permission: "finance.view",   group: "Finance", module: "crm",            hideFromSuperAdmin: true },
  { label: "Mgmt Fee Statements",to: "/commissions",  icon: Handshake,      permission: "finance.view",   group: "Finance", module: "tenants",         hideFromSuperAdmin: true },

  // ── OPERATIONS ────────────────────────────────────────────────────────────
  { label: "Support Tickets",      to: "/support",     icon: LifeBuoy,    permission: "support.view",    group: "Operations" },
  { label: "Maintenance",          to: "/maintenance", icon: Wrench,      permission: "maintenance.view", group: "Operations", module: "maintenance" },
  { label: "Snagging / DLP",       to: "/maintenance", icon: Wrench,      permission: "maintenance.view", group: "Operations", module: "construction", hideFromSuperAdmin: true },
  { label: "Handover Tool",        to: "/construction",icon: PackageOpen, permission: "property.view",    group: "Operations", module: "construction", hideFromSuperAdmin: true },
  { label: "Audit Logs",           to: "/audit",       icon: ScrollText,  permission: "audit.view",       group: "Operations" },

  // ── SYSTEM ────────────────────────────────────────────────────────────────
  { label: "Settings",         to: "/settings",     icon: Settings,      permission: "settings.view",   group: "System" },
  { label: "Integrations",     to: "/integrations", icon: Plug,          permission: "system.settings", group: "System", superAdminOnly: true },
  { label: "Backup & Restore", to: "/backup",       icon: DatabaseBackup,permission: "system.settings", group: "System", superAdminOnly: true },
];

export const NAV_GROUP_ORDER = [
  "Platform",
  "Business",
  "Property",
  "Users",
  "Finance",
  "Operations",
  "System",
];
