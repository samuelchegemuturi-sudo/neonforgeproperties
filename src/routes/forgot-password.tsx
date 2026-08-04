import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { Loader2, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useServerFn } from "@tanstack/react-start";
import { requestPasswordReset } from "@/lib/platform.functions";

export const Route = createFileRoute("/forgot-password")({
  component: ForgotPasswordPage,
});

function ForgotPasswordPage() {
  const [busy, setBusy] = useState(false);
  const [email, setEmail] = useState("");
  const [success, setSuccess] = useState(false);
  
  const resetPassword = useServerFn(requestPasswordReset);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!email) return;

    setBusy(true);
    try {
      await resetPassword({ data: { email } });
      setSuccess(true);
      toast.success("Password reset instructions sent");
    } catch (error: any) {
      toast.error(error.message || "Failed to request password reset");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex min-h-[100dvh] w-full flex-col items-center justify-center bg-muted/30 p-4 md:p-8">
      <div className="mx-auto flex w-full max-w-sm flex-col gap-6">
        <div className="flex flex-col items-center gap-2 text-center">
          <Link to="/" className="flex items-center gap-2 font-bold tracking-tight text-xl">
            Neon Forge Properties
          </Link>
          <p className="text-balance text-sm text-muted-foreground">
            Enter your email to receive a password reset link.
          </p>
        </div>
        
        <Card className="border-muted bg-background/60 shadow-lg backdrop-blur-xl">
          <CardHeader>
            <CardTitle>Forgot Password</CardTitle>
            <CardDescription>
              We'll send you an email with a link to reset your password.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {success ? (
              <div className="flex flex-col space-y-4 text-center">
                <p className="text-sm text-muted-foreground">
                  If an account exists with that email, we've sent password reset instructions.
                </p>
                <Button asChild variant="outline">
                  <Link to="/auth">Return to Sign in</Link>
                </Button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="grid gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="you@example.com"
                    required
                    disabled={busy}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
                <Button type="submit" className="w-full" disabled={busy}>
                  {busy ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                  Send Reset Link
                </Button>
              </form>
            )}
          </CardContent>
        </Card>

        <div className="text-center text-sm">
          Remembered your password?{" "}
          <Link to="/auth" className="underline underline-offset-4 hover:text-primary">
            Sign in
          </Link>
        </div>
      </div>
    </div>
  );
}
