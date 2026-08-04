# MAKAO — Phase 2: Platform layer (Super Admin, companies, licences, subscriptions)

Phase 1 shipped auth, multi-tenant seeding, RBAC and the dashboard. Phase 2 turns MAKAO
into a platform the owner operates, and gives companies a real onboarding path.

Scope is deliberately limited to the foundation the rest of your spec sits on. Payments
(M-Pesa/Paystack), tenants, leases, maintenance and finance reporting come after.

## 1. Company model rework

Replace the implicit "landlord = company" assumption with an explicit company type.

- `companies.company_type`: Individual Landlord, Property Management Agency,
  Real Estate Company, SACCO, Developer, Corporate Housing.
- Verification state: unverified / pending / verified / rejected, plus who verified and when.
- Lifecycle status: pending activation, active, suspended, deleted.
- Agencies additionally get **property owners** (clients) — owners belong to an agency,
  properties belong to an owner. A landlord company owns its own properties directly.

## 2. Licence + activation fee

- One-time activation fee (default KES 20, configurable).
- On payment, a permanent licence code `EST-2026-XXXXXXX` is generated for the company.
- Company stays "pending activation" until the licence exists; dashboard shows an
  activation checklist instead of full data.
- Licence records: code, company, issued date, issued by (self-serve or Super Admin), status.

## 3. Subscription pricing engine

- Pricing rules table keyed by unit type: Single Room 50, Bedsitter/Studio 50, 1BR 100,
  2BR 150, 3BR 200, 4BR 250, each extra bedroom +50, Commercial/Office/Warehouse configurable.
  Super Admin edits these in Pricing Rules.
- Monthly recalculation from current unit counts.
- Billing mode per company: when Automatic Disbursement is ON, the invoice is computed from
  **occupied units that actually paid rent this cycle** and deducted from collected rent
  before disbursement. When OFF, the invoice is issued for manual settlement.
- This phase builds the pricing tables, the calculator and the invoice records. Actual
  money movement waits for the payments phase.

## 4. Properties + units (minimum needed for billing)

- Properties with owner/agency linkage, address, GPS, verification state.
- Unit types per property (label, bedrooms, rent, service charge, deposit, quantity) with
  automatic unit generation.
- Units carry status (vacant/occupied) so the subscription calculator has real inputs.

## 5. Platform roles

- Verification Officer and Support Officer become **platform-level** roles created only by
  Super Admin (no company). Verification Officers get no finance permissions; Support
  Officers can view accounts and trigger password resets but not finances.
- Existing company roles (Manager, Accountant, Caretaker, Technician, Receptionist) stay.

## 6. Navigation rework

Sidebar becomes permission-driven with two shapes:

```text
Super Admin                Company user
PLATFORM                   OVERVIEW
 Dashboard, Analytics,      Dashboard
 Live Activity             PORTFOLIO
BUSINESS                    Properties, Units, Listings
 Landlords, Agencies,      OPERATIONS
 Companies, Subscriptions,  Tenants, Maintenance
 Licences, Pricing Rules   MONEY
PROPERTY                    Finance, Reports
 Properties, Units,        ADMINISTRATION
 Verification Queue         Employees, Roles, Audit, Settings
USERS / FINANCE /
OPERATIONS / SYSTEM
```

Groups render only when the user holds at least one permission inside them, so nothing is
hardcoded per role.

## 7. Super Admin screens (this phase)

Working screens: Companies list (filter by type/status, suspend, verify, view detail),
Company detail with manual registration flow (create company → create login with temporary
password → register property → generate licence → activate), Licence Management, Pricing
Rules, Verification Queue, Platform dashboard with real counts.

Stubbed with clear "coming soon" states: Analytics, Live Activity, Support Tickets,
Transactions/Commissions/Disbursements/Refunds, SMS/Email/Storage/API Keys, Backup.

## 8. Registration workflow

Get Started → account → email verification → KYC → first property → unit configuration →
activation fee quote → payment (stubbed as "mark as paid" until the payments phase) →
licence generated → dashboard activated. Rendered as a resumable stepper that reads the
company's current state, so a user can leave and come back.

## Technical notes

- New tables: `property_owners`, `properties`, `unit_types`, `units`, `licences`,
  `pricing_rules`, `subscription_invoices`, `platform_settings`, `verification_requests`,
  `audit_logs`. Every one gets GRANTs, RLS scoped through `current_company_id()` /
  `is_super_admin()`, and updated_at triggers.
- New permission keys seeded for the platform modules (companies.*, licences.*, pricing.*,
  support.*, system.*) and attached to the Super Admin path via `is_super_admin` bypass in
  `has_permission`.
- Impersonation is implemented as a Super-Admin-only server function that records an audit
  entry and returns a scoped view of the target company — not a real session swap, which
  cannot be done safely from the client.
- Unit generation runs in a database function so counts stay consistent for billing.

## Not in this phase

Real M-Pesa/Paystack integration, tenant/lease records, deposit escrow, payroll, DigiTax
reporting, SMS/email delivery, n8n automations, map view.
