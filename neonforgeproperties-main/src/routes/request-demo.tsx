import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { Loader2, Home, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useServerFn } from "@tanstack/react-start";
import { createDemoRequestFn } from "@/lib/platform.functions";

export const Route = createFileRoute("/request-demo")({
  head: () => ({
    meta: [
      { title: "Request Demo — Neon Forge Properties" },
      { name: "description", content: "Request a demo to get started with Neon Forge Properties." },
    ],
  }),
  component: RequestDemoPage,
});

function RequestDemoPage() {
  const [busy, setBusy] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [tempPassword, setTempPassword] = useState("");
  const createDemoRequest = useServerFn(createDemoRequestFn);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    setBusy(true);
    
    const fullName = String(form.get("full_name"));
    const email = String(form.get("email"));
    const phone = String(form.get("phone"));
    const company = String(form.get("company_name"));
    const units = String(form.get("units") || "Not specified");

    try {
      const res = await createDemoRequest({
        data: {
          full_name: fullName,
          email,
          phone,
          company_name: company,
          estimated_units: units,
        }
      });

      if (res.password) {
        setTempPassword(res.password);
      }
      setSubmitted(true);
    } catch (error: any) {
      toast.error(error.message || "Failed to submit request. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <div className="surface-grid hidden flex-col justify-between border-r border-border p-12 lg:flex">
        <Link to="/" className="flex items-center gap-2.5">
          <div className="flex size-8 items-center justify-center rounded-md bg-primary text-primary-foreground">
            <Home className="size-4" />
          </div>
          <span className="text-lg font-semibold tracking-tight">Neon Forge Properties</span>
        </Link>
        <div className="max-w-md">
          <h2 className="text-3xl font-semibold tracking-tight">
            See how it works for your portfolio.
          </h2>
          <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
            Request a demo and we'll set up a tailored workspace for your properties and staff. You'll get temporary credentials to explore the platform hands-on.
          </p>
        </div>
        <p className="text-xs text-muted-foreground">Multi-tenant · Role-based · Audit ready</p>
      </div>

      <div className="flex items-center justify-center px-5 py-12">
        <div className="w-full max-w-sm">
          {submitted ? (
            <div className="text-center space-y-4">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-500">
                <CheckCircle2 className="h-8 w-8" />
              </div>
              <h2 className="text-2xl font-semibold tracking-tight">Your Demo is Ready</h2>
              <p className="text-sm text-muted-foreground">
                Your workspace has been created. You can log in immediately to explore the platform with your temporary credentials.
              </p>
              
              <div className="mt-4 rounded-lg bg-muted p-4 text-left border border-border space-y-2">
                <div>
                  <div className="text-xs text-muted-foreground">Email</div>
                  <div className="font-mono text-sm">{String(new FormData(document.querySelector("form") || undefined).get("email") || "")}</div>
                </div>
                <div>
                  <div className="text-xs text-muted-foreground">Temporary Password</div>
                  <div className="font-mono text-sm font-semibold text-primary">{tempPassword}</div>
                </div>
              </div>

              <div className="flex flex-col gap-2 mt-6">
                <Button asChild className="w-full">
                  <Link to="/auth">Login Now</Link>
                </Button>
                <Button asChild variant="outline" className="w-full">
                  <Link to="/">Return to Home</Link>
                </Button>
              </div>
            </div>
          ) : (
            <>
              <h1 className="text-2xl font-semibold tracking-tight">Request a Demo</h1>
              <p className="mt-1 text-sm text-muted-foreground mb-8">
                Tell us about your portfolio to get started.
              </p>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-1.5">
                  <Label htmlFor="full_name">Full name</Label>
                  <Input id="full_name" name="full_name" required autoComplete="name" />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="email">Work email</Label>
                  <Input id="email" name="email" type="email" required autoComplete="email" />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="phone">Phone number</Label>
                  <Input id="phone" name="phone" type="tel" required autoComplete="tel" />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="company_name">Company / Portfolio name</Label>
                  <Input id="company_name" name="company_name" required />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="units">Estimated units</Label>
                  <Input id="units" name="units" type="number" placeholder="e.g. 50" />
                </div>
                <Button type="submit" className="w-full mt-4" disabled={busy}>
                  {busy && <Loader2 className="mr-2 size-4 animate-spin" />} Submit Request
                </Button>
              </form>
              <p className="mt-8 text-center text-xs text-muted-foreground">
                <Link to="/" className="underline-offset-4 hover:underline">
                  Back to home
                </Link>
                {" · "}
                <Link to="/auth" className="underline-offset-4 hover:underline">
                  Sign in instead
                </Link>
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
