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
  MessageSquare,
  Mail,
  HardDrive,
  Plug,
  DatabaseBackup,
  FileText,
  type LucideIcon,
} from "lucide-react";

export type NavItem = {
  label: string;
  to: string;
  icon: LucideIcon;
  permission: string;
  group: string;
  soon?: boolean;
  featureFlag?: string;
  superAdminOnly?: boolean;
};

/** The sidebar is generated from this list, filtered by the user's permissions. */
export const NAV_ITEMS: NavItem[] = [
  // PLATFORM
  { label: "Dashboard", to: "/dashboard", icon: LayoutDashboard, permission: "dashboard.view", group: "Platform", featureFlag: "feature_dashboard" },
  { label: "Activation", to: "/onboarding", icon: BadgeCheck, permission: "dashboard.view", group: "Platform", featureFlag: "feature_activation" },
  { label: "Analytics", to: "/analytics", icon: BarChart3, permission: "reports.view", group: "Platform", featureFlag: "feature_analytics" },
  { label: "Live Activity", to: "/activity", icon: Activity, permission: "system.logs", group: "Platform", featureFlag: "feature_activity" },

  // BUSINESS
  { label: "Companies", to: "/companies", icon: Briefcase, permission: "companies.view", group: "Business", featureFlag: "feature_business" },
  { label: "Demo Requests", to: "/leads", icon: Contact, permission: "dashboard.view", group: "Business", superAdminOnly: true, featureFlag: "feature_business" },
  { label: "Subscriptions", to: "/subscriptions", icon: CreditCard, permission: "subscriptions.view", group: "Business", featureFlag: "feature_business" },
  { label: "Licences", to: "/licences", icon: KeyRound, permission: "licence.view", group: "Business", featureFlag: "feature_business" },
  { label: "Pricing Rules", to: "/pricing", icon: Tags, permission: "pricing.view", group: "Business", featureFlag: "feature_business" },

  // PROPERTY
  { label: "Properties", to: "/properties", icon: Building2, permission: "property.view", group: "Property", featureFlag: "feature_properties" },
  { label: "Units", to: "/units", icon: DoorOpen, permission: "unit.view", group: "Property", featureFlag: "feature_properties" },
  { label: "Verification Queue", to: "/verification", icon: BadgeCheck, permission: "verification.view", group: "Property", superAdminOnly: true, featureFlag: "feature_verification" },
  { label: "Listings", to: "/listings", icon: Megaphone, permission: "listing.view", group: "Property", featureFlag: "feature_listings" },
  { label: "Map View", to: "/map", icon: Map, permission: "property.view", group: "Property", featureFlag: "feature_map" },

  // USERS
  { label: "Employees", to: "/employees", icon: UserCog, permission: "employees.view", group: "Users", featureFlag: "feature_users" },
  { label: "Tenants", to: "/tenants", icon: Users, permission: "tenant.view", group: "Users", featureFlag: "feature_users" },
  { label: "Leases", to: "/leases", icon: FileText, permission: "tenant.view", group: "Users", featureFlag: "feature_users" },
  { label: "Roles & Permissions", to: "/roles", icon: ShieldCheck, permission: "roles.view", group: "Users", featureFlag: "feature_users" },

  // FINANCE
  { label: "Finance", to: "/finance", icon: Wallet, permission: "finance.view", group: "Finance", featureFlag: "feature_finance" },
  { label: "Transactions", to: "/transactions", icon: ArrowLeftRight, permission: "finance.view", group: "Finance", featureFlag: "feature_finance" },
  { label: "Commissions", to: "/commissions", icon: Percent, permission: "finance.view", group: "Finance", featureFlag: "feature_finance" },
  { label: "Disbursements", to: "/disbursements", icon: Send, permission: "finance.view", group: "Finance", featureFlag: "feature_finance" },
  { label: "Refunds", to: "/refunds", icon: Undo2, permission: "finance.refund", group: "Finance", featureFlag: "feature_finance" },
  { label: "Revenue Reports", to: "/reports", icon: BarChart3, permission: "reports.view", group: "Finance", featureFlag: "feature_finance" },

  // OPERATIONS
  { label: "Support Tickets", to: "/support", icon: LifeBuoy, permission: "support.view", group: "Operations", featureFlag: "feature_operations" },
  { label: "Maintenance", to: "/maintenance", icon: Wrench, permission: "maintenance.view", group: "Operations", featureFlag: "feature_operations" },
  { label: "Audit Logs", to: "/audit", icon: ScrollText, permission: "audit.view", group: "Operations", featureFlag: "feature_audit" },

  // SYSTEM
  { label: "Settings", to: "/settings", icon: Settings, permission: "settings.view", group: "System" },
  { label: "Integrations", to: "/integrations", icon: Plug, permission: "system.settings", group: "System", featureFlag: "feature_system" },
  { label: "Backup & Restore", to: "/backup", icon: DatabaseBackup, permission: "system.settings", group: "System", featureFlag: "feature_system" },
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
