-- WARNING: This will delete ALL transactional data in the system and start fresh.
TRUNCATE TABLE 
  auth.users,
  public.user_roles,
  public.theme_preferences,
  public.commissions,
  public.profiles,
  public.roles,
  public.role_permissions,
  public.companies,
  public.property_owners,
  public.properties,
  public.unit_types,
  public.units,
  public.licences,
  public.subscription_invoices,
  public.verification_requests,
  public.audit_logs,
  public.support_tickets,
  public.tenants,
  public.leases,
  public.maintenance_requests,
  public.announcements,
  public.transactions
CASCADE;

-- WE DO NOT TRUNCATE permissions, pricing_rules, or platform_settings as those are seeded configuration tables.
