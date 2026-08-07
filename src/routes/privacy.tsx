import { createFileRoute } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/privacy")({
  head: () => ({
    meta: [
      { title: "Privacy Policy — Neon Forge Properties" },
      { name: "description", content: "Privacy Policy for Neon Forge Properties." },
    ],
  }),
  component: PrivacyPage,
});

function PrivacyPage() {
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
          <h1>PRIVACY POLICY</h1>
          <p><strong>Effective Date:</strong> [Insert Date]</p>

          <p>Neon Forge Creation values your privacy.</p>
          <p>This Privacy Policy explains how we collect, store, use, and protect your information.</p>

          <h2>Information We Collect</h2>

          <h3>Personal Information</h3>
          <ul>
            <li>Name</li>
            <li>Email address</li>
            <li>Phone number</li>
            <li>Company name</li>
            <li>Business registration details</li>
            <li>KRA PIN (where applicable)</li>
          </ul>

          <h3>Property Information</h3>
          <ul>
            <li>Property details</li>
            <li>Unit information</li>
            <li>Amenities</li>
            <li>Photos</li>
            <li>Maintenance records</li>
          </ul>

          <h3>Tenant Information</h3>
          <ul>
            <li>Names</li>
            <li>Contact information</li>
            <li>Identification documents</li>
            <li>Lease agreements</li>
            <li>Emergency contacts</li>
          </ul>

          <h3>Financial Information</h3>
          <p>The platform may store:</p>
          <ul>
            <li>Rent records</li>
            <li>Expenses</li>
            <li>Invoices</li>
            <li>Subscription payments</li>
          </ul>
          <p>Payment card details are never stored by Neon Forge Properties.</p>

          <h3>API Credentials</h3>
          <p>Organizations may connect:</p>
          <ul>
            <li>Stripe</li>
            <li>M-Pesa</li>
            <li>Paystack</li>
            <li>DigiTax</li>
            <li>eTIMS</li>
            <li>SMTP</li>
            <li>SMS providers</li>
            <li>WhatsApp</li>
          </ul>
          <p>API credentials are encrypted at rest and are accessible only to the owning organization.</p>

          <h3>Usage Information</h3>
          <p>We automatically collect:</p>
          <ul>
            <li>Login timestamps</li>
            <li>Device information</li>
            <li>Browser type</li>
            <li>Operating system</li>
            <li>IP address</li>
            <li>Error logs</li>
            <li>Security events</li>
          </ul>

          <h2>How We Use Information</h2>
          <p>We use data to:</p>
          <ul>
            <li>Operate the platform.</li>
            <li>Process subscriptions.</li>
            <li>Deliver notifications.</li>
            <li>Generate reports.</li>
            <li>Improve features.</li>
            <li>Detect fraud.</li>
            <li>Maintain security.</li>
            <li>Provide customer support.</li>
          </ul>

          <h2>Tenant Data</h2>
          <p>Tenant information belongs to the organization that collected it.</p>
          <p>Neon Forge Properties processes tenant data only to provide the requested services.</p>

          <h2>DigiTax & eTIMS Data</h2>
          <p>Each organization's tax credentials remain isolated.</p>
          <p>No organization can access another organization's tax information.</p>
          <p>The Company does not use customer tax information for any purpose other than requested tax integrations.</p>

          <h2>Security</h2>
          <p>We implement:</p>
          <ul>
            <li>TLS/SSL encryption</li>
            <li>Database encryption</li>
            <li>Role-based access control</li>
            <li>Two-factor authentication (optional)</li>
            <li>Audit logs</li>
            <li>Secure backups</li>
            <li>API key encryption</li>
            <li>Continuous security monitoring</li>
          </ul>

          <h2>Data Retention</h2>
          <p>We retain information while accounts remain active.</p>
          <p>After account closure:</p>
          <ul>
            <li>Subscription records may be retained to meet legal and accounting obligations.</li>
            <li>Other data may be deleted or anonymized in accordance with applicable laws and operational needs.</li>
          </ul>

          <h2>Cookies</h2>
          <p>We use cookies for:</p>
          <ul>
            <li>Authentication</li>
            <li>Preferences</li>
            <li>Security</li>
            <li>Analytics</li>
            <li>Performance</li>
          </ul>
          <p>Users can manage cookies through their browser settings, although some features may not function correctly if cookies are disabled.</p>

          <h2>User Rights</h2>
          <p>Depending on applicable law, users may have the right to:</p>
          <ul>
            <li>Access their personal data.</li>
            <li>Correct inaccurate information.</li>
            <li>Request deletion where legally permitted.</li>
            <li>Export their data.</li>
            <li>Withdraw consent for optional processing.</li>
            <li>Object to certain processing activities.</li>
          </ul>

          <h2>International Users</h2>
          <p>Because Neon Forge Properties supports multiple countries, user information may be processed in jurisdictions other than the user's country, subject to appropriate safeguards and applicable data protection laws.</p>

          <h2>Children's Privacy</h2>
          <p>The platform is intended for adults and organizations. It is not designed for children under the age required by applicable law to create an account.</p>

          <h2>Contact</h2>
          <p>For legal, privacy, or data protection inquiries:</p>
          <p><strong>Neon Forge Creation</strong></p>
          <p>Email: admin@neonforgecreation.co.ke</p>

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
