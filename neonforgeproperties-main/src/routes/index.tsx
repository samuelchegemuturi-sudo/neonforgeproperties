import { createFileRoute, Link } from "@tanstack/react-router";
import { Building2, ShieldCheck, Wallet, Users, ArrowRight, Home } from "lucide-react";
import { Button } from "@/components/ui/button";
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
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-30 border-b border-border/70 bg-background/85 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-5">
          <div className="flex items-center gap-2.5">
            <div className="flex size-8 items-center justify-center rounded-md bg-primary text-primary-foreground">
              <Home className="size-4" />
            </div>
            <span className="text-lg font-semibold tracking-tight">Neon Forge Properties</span>
          </div>
          <div className="flex items-center gap-2">
            {session ? (
              <Button asChild size="sm">
                <Link to="/dashboard">Open dashboard</Link>
              </Button>
            ) : (
              <>
                <Button asChild variant="ghost" size="sm">
                  <Link to="/auth">Sign in</Link>
                </Button>
                <Button asChild size="sm">
                  <Link to="/auth" search={{ mode: "signup" }}>
                    Start Free Trial
                  </Link>
                </Button>
              </>
            )}
          </div>
        </div>
      </header>

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

        <section className="mx-auto max-w-6xl px-5 py-20">
          <div className="grid gap-5 sm:grid-cols-2">
            {FEATURES.map((f) => (
              <div
                key={f.title}
                className="rounded-xl border border-border bg-card p-6 shadow-[var(--shadow-card)]"
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
      </main>

      <footer className="border-t border-border">
        <div className="mx-auto max-w-6xl px-5 py-8 text-sm text-muted-foreground">
          Neon Forge Properties — property management platform.
        </div>
      </footer>
    </div>
  );
}
