import { createFileRoute } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/terms")({
  head: () => ({
    meta: [
      { title: "Terms and Conditions — Neon Forge Properties" },
      { name: "description", content: "Terms and Conditions for Neon Forge Properties." },
    ],
  }),
  component: TermsPage,
});

function TermsPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="sticky top-4 z-40 px-4 sm:px-6 mb-4 transition-all duration-300">
        <header className="mx-auto flex h-16 max-w-4xl items-center justify-between rounded-full border border-border/40 bg-background/60 px-6 shadow-[0_8px_30px_rgb(0,0,0,0.08)] backdrop-blur-2xl saturate-[1.8]">
          <div className="flex items-center gap-3">
            <span className="text-lg font-semibold tracking-tight">Neon Forge Properties</span>
          </div>
          <div className="flex items-center gap-3">
            <Button asChild variant="ghost" size="sm" className="rounded-full px-5 hover:bg-muted/60">
              <Link to="/">
                <ArrowLeft className="mr-2 h-4 w-4" /> Back to Home
              </Link>
            </Button>
          </div>
        </header>
      </div>

      <main className="mx-auto max-w-4xl px-5 py-12">
        <div className="prose prose-slate dark:prose-invert max-w-none">
          <h1>TERMS AND CONDITIONS</h1>
          <p><strong>Effective Date:</strong> [Insert Date]</p>

          <p>Welcome to Neon Forge Properties, a cloud-based Property Management and Real Estate ERP developed by Neon Forge Creation.</p>
          <p>By creating an account or using our platform, you agree to these Terms and Conditions. If you do not agree, you must not use the Service.</p>

          <h2>1. Definitions</h2>
          <p>Throughout these Terms:</p>
          <ul>
            <li><strong>Platform</strong> means Neon Forge Properties.</li>
            <li><strong>Company</strong> means Neon Forge Creation.</li>
            <li><strong>User</strong> means any individual or organization using the platform.</li>
            <li><strong>Organization</strong> includes landlords, agencies, developers, SACCOs, corporate housing providers, Airbnb hosts, verification officers, and any other registered business.</li>
            <li><strong>Tenant</strong> means an individual renting or applying to rent a property.</li>
            <li><strong>Subscription</strong> means any paid plan offered by the platform.</li>
          </ul>

          <h2>2. Eligibility</h2>
          <p>Users must:</p>
          <ul>
            <li>Be at least 18 years old.</li>
            <li>Provide accurate registration information.</li>
            <li>Maintain updated account details.</li>
            <li>Be legally authorized to use the services in their country.</li>
          </ul>

          <h2>3. User Accounts</h2>
          <p>Each organization is responsible for:</p>
          <ul>
            <li>Keeping login credentials secure.</li>
            <li>Managing employee access.</li>
            <li>Updating organization information.</li>
            <li>All activities performed under their account.</li>
          </ul>
          <p>The Company is not liable for losses caused by compromised credentials.</p>

          <h2>4. Subscription Plans</h2>
          <p>Neon Forge Properties currently offers:</p>
          <ul>
            <li>Basic</li>
            <li>Pro</li>
            <li>Premium</li>
          </ul>
          <p>Subscription fees are charged per registered property.</p>
          <p>Billing cycles include: Monthly, Quarterly, Semi-Annual, Annual.</p>
          <p>Discounts apply according to the selected billing period.</p>
          <p>Subscriptions automatically expire unless renewed.</p>

          <h2>5. Free Trial</h2>
          <p>New organizations receive:</p>
          <ul>
            <li>30-day trial</li>
            <li>One-time activation fee (KES 20)</li>
          </ul>
          <p>At the end of the trial, continued access requires an active subscription.</p>

          <h2>6. Payment Processing</h2>
          <p>Neon Forge Properties primarily manages subscription payments.</p>
          <p>Where users connect their own payment gateways (such as M-Pesa, Stripe, or Paystack), those transactions occur between the organization and its customers.</p>
          <p>The Company is not responsible for:</p>
          <ul>
            <li>Failed tenant payments</li>
            <li>Chargebacks</li>
            <li>Bank delays</li>
            <li>Mobile money outages</li>
            <li>Third-party payment failures</li>
          </ul>

          <h2>7. Connected Payment Gateways</h2>
          <p>Organizations may connect their own: M-Pesa, Stripe, Paystack.</p>
          <p>Credentials remain the responsibility of the organization.</p>
          <p>The Company never shares API credentials between organizations.</p>

          <h2>8. DigiTax and eTIMS</h2>
          <p>Where DigiTax/eTIMS integration is enabled:</p>
          <p>Each organization connects: Its own KRA PIN, DigiTax credentials, Branch certificates, API keys.</p>
          <p>Invoices and tax records belong solely to that organization.</p>
          <p>Neon Forge Properties does not assume tax liability on behalf of any organization.</p>

          <h2>9. Property Listings</h2>
          <p>Organizations are solely responsible for: Listing accuracy, Pricing, Availability, Images, Amenities, Property descriptions.</p>
          <p>Listings containing misleading information may be removed.</p>

          <h2>10. Tenant Applications</h2>
          <p>The platform only facilitates: Viewing listings, Scheduling visits, Rental applications.</p>
          <p>Approval remains entirely at the discretion of the property owner or manager.</p>

          <h2>11. Rental Agreements</h2>
          <p>Lease agreements are contracts between: Property Owner, Tenant.</p>
          <p>Neon Forge Properties is not a party to any tenancy agreement.</p>

          <h2>12. Maintenance Requests</h2>
          <p>The platform records and manages maintenance requests.</p>
          <p>Completion of maintenance remains the responsibility of the property owner or assigned staff.</p>

          <h2>13. Smart Meter Integrations</h2>
          <p>Where enabled, utility information is obtained from connected providers.</p>
          <p>The Company does not guarantee: Meter accuracy, Utility provider uptime, Third-party API availability.</p>

          <h2>14. AI Features</h2>
          <p>AI assistants provide recommendations and automation.</p>
          <p>Users remain responsible for verifying: Financial calculations, Legal compliance, Tax submissions, Rental decisions, Business decisions.</p>
          <p>AI outputs should not be considered legal or financial advice.</p>

          <h2>15. Availability</h2>
          <p>We aim for 99.9% uptime.</p>
          <p>Temporary interruptions may occur due to: Maintenance, Security updates, Infrastructure failures, Third-party outages.</p>

          <h2>16. Suspension</h2>
          <p>The Company may suspend or terminate accounts that:</p>
          <ul>
            <li>Violate these Terms.</li>
            <li>Engage in fraud.</li>
            <li>Attempt unauthorized access.</li>
            <li>Abuse the platform.</li>
            <li>Distribute malware.</li>
            <li>Use the service illegally.</li>
          </ul>

          <h2>17. Intellectual Property</h2>
          <p>All software, branding, source code, interfaces, documentation, and AI systems remain the exclusive property of Neon Forge Creation.</p>
          <p>Users receive only a limited license to use the platform.</p>

          <h2>18. Limitation of Liability</h2>
          <p>Neon Forge Creation shall not be liable for: Loss of profits, Business interruption, Data loss caused by user actions, Third-party failures, Tax penalties arising from incorrect user information, Incorrect payment gateway configuration, Incorrect API credentials.</p>
          <p>Maximum liability shall not exceed the subscription fees paid during the previous twelve months.</p>

          <h2>19. Changes</h2>
          <p>The Company may update these Terms.</p>
          <p>Users will be notified through: Email, Dashboard notifications, Platform announcements.</p>
          <p>Continued use constitutes acceptance of updated Terms.</p>

          <h2>20. Governing Law</h2>
          <p>These Terms shall be governed by the laws of the Republic of Kenya, unless mandatory local laws require otherwise.</p>
        </div>
      </main>
      
      <footer className="border-t border-border mt-12">
        <div className="mx-auto max-w-4xl px-5 py-8 text-sm text-muted-foreground text-center">
          &copy; {new Date().getFullYear()} Neon Forge Creation. All rights reserved.
        </div>
      </footer>
    </div>
  );
}
