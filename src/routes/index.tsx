import { createFileRoute, Link } from "@tanstack/react-router";
import { Building2, ShieldCheck, Wallet, Users, ArrowRight, Home } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { useAuth } from "@/lib/auth";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Neon Forge Properties — Multi-tenant Property Management for Kenya" },
      {
        name: "description",
        content:
          "Run properties, staff, rent and compliance from one platform. Role-based dashboards for landlords, managers, accountants and caretakers.",
      },
      { property: "og:title", content: "Neon Forge Properties — Multi-tenant Property Management" },
      {
        property: "og:description",
        content:
          "One platform for properties, units, employees, rent collection and disbursements — with permissions for every role.",
      },
    ],
  }),
  component: Landing,
});

const FEATURES = [
  {
    icon: ShieldCheck,
    title: "Role-based by design",
    body: "Unlimited roles with a permission matrix. Every menu, page and action follows what the signed-in user is allowed to do.",
  },
  {
    icon: Building2,
    title: "Properties and units",
    body: "Register properties, define unit types once and generate every unit automatically with rent, deposit and service charge.",
  },
  {
    icon: Wallet,
    title: "Money that reconciles",
    body: "Rent collection, platform and employee commission, held deposits and landlord payouts — calculated on every transaction.",
  },
  {
    icon: Users,
    title: "Your whole team",
    body: "Managers, accountants, caretakers, technicians, and receptionists in one isolated company workspace.",
  },
];

function Landing() {
  const { session } = useAuth();

  return (
    <div className="min-h-screen bg-transparent">
      <div className="sticky top-4 z-40 px-4 sm:px-6 mb-4 transition-all duration-300">
        <header className="mx-auto flex h-16 max-w-6xl items-center justify-between rounded-full border border-border/40 bg-background/60 px-6 shadow-[0_8px_30px_rgb(0,0,0,0.08)] backdrop-blur-2xl saturate-[1.8]">
          <div className="flex items-center gap-3">
            <div className="flex size-9 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-sm">
              <Home className="size-5" />
            </div>
            <span className="text-lg font-semibold tracking-tight hidden sm:inline-block">Neon Forge Properties</span>
          </div>

          <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-muted-foreground">
            <a href="#features" className="hover:text-foreground transition-colors">Features</a>
            <a href="#pricing" className="hover:text-foreground transition-colors">Pricing</a>
            <a href="#about" className="hover:text-foreground transition-colors">About Us</a>
            <a href="#contact" className="hover:text-foreground transition-colors">Contact Us</a>
          </nav>

          <div className="flex items-center gap-3">
            {session ? (
              <Button asChild size="sm" className="rounded-full px-5">
                <Link to="/dashboard">Open dashboard</Link>
              </Button>
            ) : (
              <>
                <Button asChild variant="ghost" size="sm" className="rounded-full px-5 hover:bg-muted/60">
                  <Link to="/auth">Sign in</Link>
                </Button>
                <Button asChild size="sm" className="rounded-full px-5">
                  <Link to="/auth" search={{ mode: "signup" }}>
                    Start Free Trial
                  </Link>
                </Button>
              </>
            )}
          </div>
        </header>
      </div>

      <main>
        <section className="surface-grid border-b border-border">
          <div className="mx-auto max-w-6xl px-5 py-24 text-center">
            <p className="mx-auto mb-5 w-fit rounded-full border border-border bg-card px-3 py-1 text-xs font-medium text-muted-foreground">
              Enterprise property management · Kenya-first
            </p>
            <h1 className="mx-auto max-w-3xl text-4xl font-semibold tracking-tight text-foreground sm:text-6xl">
              One platform for every person who runs your buildings
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-base text-muted-foreground sm:text-lg">
              Neon Forge Properties gives landlords, property managers, accountants and caretakers a single workspace — with data isolated per company and a dashboard generated
              from each user's permissions.
            </p>
            <div className="mt-9 flex flex-wrap justify-center gap-3">
              <Button asChild size="lg">
                <Link to="/auth" search={{ mode: "signup" }}>
                  Start Free Trial <ArrowRight className="size-4" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline">
                <Link to="/auth">I already have an account</Link>
              </Button>
            </div>
          </div>
        </section>

        <section id="features" className="mx-auto max-w-6xl px-5 py-20">
          <div className="grid gap-5 sm:grid-cols-2">
            {FEATURES.map((f) => (
              <div
                key={f.title}
                className="rounded-xl border border-white/40 dark:border-white/10 bg-card/40 dark:bg-card/40 backdrop-blur-xl p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)]"
              >
                <div className="flex size-10 items-center justify-center rounded-lg bg-accent text-accent-foreground">
                  <f.icon className="size-5" />
                </div>
                <h2 className="mt-4 text-lg font-semibold tracking-tight">{f.title}</h2>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{f.body}</p>
              </div>
            ))}
          </div>
        </section>
        <section id="pricing" className="mx-auto max-w-6xl px-5 py-20 border-t border-border">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-semibold tracking-tight">Simple, transparent pricing</h2>
            <p className="mt-4 text-muted-foreground">Pay per property, not per unit. All features included based on your scale.</p>
          </div>
          <div className="grid gap-8 md:grid-cols-3">
            {[
              { name: "Basic", price: "KES 999", properties: "Up to 5", target: "Small landlords & hosts" },
              { name: "Pro", price: "KES 1,500", properties: "Up to 50", target: "Growing agencies" },
              { name: "Premium", price: "KES 2,500", properties: "Unlimited", target: "Enterprise & SACCOs" }
            ].map(plan => (
              <div key={plan.name} className="flex flex-col rounded-2xl border border-border bg-card p-8 shadow-sm">
                <h3 className="text-xl font-semibold">{plan.name}</h3>
                <div className="mt-4 flex items-baseline text-3xl font-bold">
                  {plan.price}
                  <span className="ml-1 text-sm font-medium text-muted-foreground">/mo</span>
                </div>
                <p className="mt-4 text-sm text-muted-foreground">{plan.target}</p>
                <ul className="mt-6 flex-1 space-y-3 text-sm text-muted-foreground">
                  <li className="flex items-center gap-3">
                    <ShieldCheck className="size-4 text-primary" /> {plan.properties} properties
                  </li>
                  <li className="flex items-center gap-3">
                    <ShieldCheck className="size-4 text-primary" /> Core accounting
                  </li>
                </ul>
                <Button asChild className="mt-8 w-full" variant={plan.name === "Pro" ? "default" : "outline"}>
                  <Link to="/auth" search={{ mode: "signup" }}>Start free trial</Link>
                </Button>
              </div>
            ))}
          </div>
        </section>

        <section id="about" className="mx-auto max-w-4xl px-5 py-20 text-center border-t border-border">
          <h2 className="text-3xl font-semibold tracking-tight mb-6">About Neon Forge Creation</h2>
          <p className="text-lg text-muted-foreground leading-relaxed">
            We build modern operating systems for African real estate. 
            Our mission is to bring transparency, efficiency, and automated compliance to 
            property managers, landlords, and SACCOs across the continent.
          </p>
        </section>

        <section id="contact" className="border-t border-border bg-[#0f1115] text-white">
          <div className="mx-auto max-w-7xl px-5 py-20">
            <h2 className="text-center text-3xl font-bold text-orange-500 mb-12 tracking-wide uppercase">Get In Touch</h2>
            
            <div className="grid gap-12 lg:grid-cols-2">
              {/* Left Side: Map */}
              <div className="h-[400px] w-full rounded-lg overflow-hidden bg-muted">
                <iframe 
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1m2!1s0x182f1172d84d49a7%3A0xf7cf0254b297924c!2sNairobi%2C%20Kenya!5e0!3m2!1sen!2sus!4v1714470389332!5m2!1sen!2sus" 
                  width="100%" 
                  height="100%" 
                  style={{ border: 0 }} 
                  allowFullScreen={false} 
                  loading="lazy" 
                  referrerPolicy="no-referrer-when-downgrade"
                  title="Neon Forge Creation Location"
                ></iframe>
              </div>

              {/* Right Side: Contact Form */}
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName" className="text-orange-500">First Name *</Label>
                    <Input id="firstName" placeholder="Enter Your First Name" className="bg-white text-black border-none h-11" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName" className="text-orange-500">Last Name *</Label>
                    <Input id="lastName" placeholder="Enter Your Last Name" className="bg-white text-black border-none h-11" />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email" className="text-orange-500">Email *</Label>
                  <Input id="email" type="email" placeholder="Email Address" className="bg-white text-black border-none h-11" />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="country" className="text-orange-500">Country *</Label>
                  <select id="country" className="flex h-11 w-full rounded-md bg-white px-3 py-2 text-sm text-black border-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
                    <option>Select Country</option>
                    <option>Kenya</option>
                    <option>Uganda</option>
                    <option>Tanzania</option>
                    <option>Rwanda</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone" className="text-orange-500">phone/whatsapp number *</Label>
                  <Input id="phone" type="tel" className="bg-white text-black border-none h-11" />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="service" className="text-orange-500">Which Services Would Like to Inquire *</Label>
                  <select id="service" className="flex h-11 w-full rounded-md bg-white px-3 py-2 text-sm text-black border-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
                    <option>- Select -</option>
                    <option>Property Management Software</option>
                    <option>Real Estate CRM</option>
                    <option>Custom Development</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="details" className="text-orange-500">Details</Label>
                  <Textarea id="details" rows={4} className="bg-white text-black border-none" />
                </div>

                <div className="flex items-center space-x-2 pt-2">
                  <Checkbox id="terms" className="border-white data-[state=checked]:bg-orange-500 data-[state=checked]:border-orange-500" />
                  <label htmlFor="terms" className="text-sm text-gray-300">
                    I have read and agree to the <Link to="/terms" className="text-orange-500 hover:underline">Terms and Conditions</Link> and <Link to="/privacy" className="text-orange-500 hover:underline">Privacy Policy</Link>
                  </label>
                </div>

                <Button className="bg-[#1a56db] hover:bg-[#1a56db]/90 text-white px-8 mt-2">
                  Submit form
                </Button>
              </div>
            </div>
          </div>
          
          {/* Footer Contacts Banner */}
          <div className="bg-white text-black py-6 mt-8">
            <div className="mx-auto max-w-7xl px-5 grid grid-cols-1 md:grid-cols-3 gap-8 text-sm">
              <div className="flex items-start gap-3">
                <div className="mt-1">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>
                </div>
                <div>
                  <h4 className="font-semibold text-orange-500 text-base mb-2">Physical Address</h4>
                  <p>Nairobi, South</p>
                  <p>Nairobi, Kenya</p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <div className="mt-1">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>
                </div>
                <div>
                  <h4 className="font-semibold text-orange-500 text-base mb-2">Email Address</h4>
                  <p><a href="mailto:admin@neonforgecreation.co.ke" className="hover:underline">admin@neonforgecreation.co.ke</a></p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <div className="mt-1">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
                </div>
                <div>
                  <h4 className="font-semibold text-orange-500 text-base mb-2">Phone Numbers</h4>
                  <p>+254 712 345 678</p>
                  <p>+254 789 012 345</p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-border mt-20 bg-muted/20">
        <div className="mx-auto max-w-6xl px-5 py-16">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="col-span-2 md:col-span-1">
              <div className="flex items-center gap-3 mb-6">
                <div className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-sm">
                  <Home className="size-4" />
                </div>
                <span className="text-lg font-semibold tracking-tight">Neon Forge Properties</span>
              </div>
              <p className="text-sm text-muted-foreground mb-6">
                The operating system for African real estate. One platform for collections, accounting, tenant experience, and compliance.
              </p>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4">Product</h3>
              <ul className="space-y-3 text-sm text-muted-foreground">
                <li><a href="#features" className="hover:text-primary transition-colors">Features</a></li>
                <li><a href="#pricing" className="hover:text-primary transition-colors">Pricing</a></li>
                <li><Link to="/auth" className="hover:text-primary transition-colors">Login</Link></li>
                <li><Link to="/auth" search={{ mode: "signup" }} className="hover:text-primary transition-colors">Start Free Trial</Link></li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4">Company</h3>
              <ul className="space-y-3 text-sm text-muted-foreground">
                <li><a href="#contact" className="hover:text-primary transition-colors">Contact Us</a></li>
                <li><a href="#about" className="hover:text-primary transition-colors">About Us</a></li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4">Legal</h3>
              <ul className="space-y-3 text-sm text-muted-foreground">
                <li><Link to="/terms" className="hover:text-primary transition-colors">Terms and Conditions</Link></li>
                <li><Link to="/privacy" className="hover:text-primary transition-colors">Privacy Policy</Link></li>
              </ul>
            </div>
          </div>
          
          <div className="mt-16 pt-8 border-t border-border flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-muted-foreground">
            <div>
              &copy; {new Date().getFullYear()} Neon Forge Creation. All rights reserved.
            </div>
            <div className="flex items-center gap-4">
              <Link to="/terms" className="hover:text-primary transition-colors">Terms</Link>
              <Link to="/privacy" className="hover:text-primary transition-colors">Privacy</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
