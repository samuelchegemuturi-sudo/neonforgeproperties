import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { companyTypeLabel, money, statusTone, titleCase, type SubscriptionQuote } from "@/lib/platform";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export const Route = createFileRoute("/_authenticated/subscriptions")({
  head: () => ({
    meta: [
      { title: "Subscriptions — Neon Forge Properties" },
      { name: "description", content: "Monthly per-unit subscription charges across Neon Forge Properties companies." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: SubscriptionsPage,
});

type CompanyRow = {
  id: string;
  name: string;
  company_type: string;
  activation_status: string;
  auto_disbursement: boolean;
  currency: string;
};

function SubscriptionsPage() {
  const { access } = useAuth();
  const isSuper = access?.profile?.is_super_admin ?? false;

  const { data: companies, isLoading } = useQuery({
    queryKey: ["subscription-companies"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("companies")
        .select("id, name, company_type, activation_status, auto_disbursement, currency")
        .order("name");
      if (error) throw error;
      return data as CompanyRow[];
    },
  });

  const { data: quotes } = useQuery({
    queryKey: ["subscription-quotes", companies?.map((c) => c.id).join(",")],
    enabled: Boolean(companies?.length),
    queryFn: async () => {
      const entries = await Promise.all(
        companies!.map(async (c) => {
          const { data } = await supabase.rpc("calculate_subscription", {
            _company_id: c.id,
            _paid_only: c.auto_disbursement,
          });
          return [c.id, data as unknown as SubscriptionQuote] as const;
        }),
      );
      return Object.fromEntries(entries);
    },
  });

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Subscriptions</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {isSuper
            ? "Recalculated every cycle from live unit counts."
            : "Your monthly platform charge, recalculated from your live unit counts."}{" "}
          With automatic disbursement on, only occupied units that paid rent are billed.
        </p>
      </div>

      {isLoading ? (
        <Skeleton className="h-48 w-full" />
      ) : (
        <div className="space-y-4">
          {(companies ?? []).map((c) => {
            const quote = quotes?.[c.id];
            return (
              <Card key={c.id}>
                <CardHeader>
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div>
                      <CardTitle className="text-base">{c.name}</CardTitle>
                      <CardDescription>
                        {companyTypeLabel(c.company_type)} ·{" "}
                        {c.auto_disbursement ? "Automatic disbursement on" : "Manual settlement"}
                      </CardDescription>
                    </div>
                    <div className="text-right">
                      <p className="text-xl font-semibold">
                        {money(quote?.total ?? 0, c.currency)}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {quote?.units ?? 0} billable units ·{" "}
                        {titleCase(quote?.basis ?? "registered_units")}
                      </p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-1.5">
                  <Badge variant={statusTone(c.activation_status)}>
                    {titleCase(c.activation_status)}
                  </Badge>
                  {quote?.breakdown?.length ? (
                    <div className="pt-2 text-sm">
                      {quote.breakdown.map((b) => (
                        <div
                          key={b.slug}
                          className="flex justify-between border-b border-border py-1 last:border-0"
                        >
                          <span className="text-muted-foreground">
                            {b.qty} × {b.label} @ {money(b.price, c.currency)}
                          </span>
                          <span>{money(b.subtotal, c.currency)}</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="pt-2 text-sm text-muted-foreground">
                      No billable units this cycle.
                    </p>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
