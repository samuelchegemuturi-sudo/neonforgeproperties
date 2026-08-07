import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { money } from "@/lib/platform";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";

export const Route = createFileRoute("/_authenticated/plans")({
  head: () => ({
    meta: [
      { title: "Subscription Plans — Neon Forge Properties" },
      { name: "description", content: "Manage SaaS subscription plans." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: PlansPage,
});

type Plan = {
  id: string;
  name: string;
  base_price_monthly: number;
  limits: any;
  features: string[];
};

function PlansPage() {
  const { can, access } = useAuth();
  const queryClient = useQueryClient();
  const editable = access?.profile?.is_super_admin;
  const [draft, setDraft] = useState<Record<string, Partial<Plan>>>({});

  const { data: plans, isLoading } = useQuery({
    queryKey: ["subscription-plans"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("subscription_plans")
        .select("id, name, base_price_monthly, limits, features")
        .order("base_price_monthly");
      if (error) throw error;
      return data as Plan[];
    },
  });

  const savePlan = useMutation({
    mutationFn: async ({ id, payload }: { id: string; payload: Partial<Plan> }) => {
      // Ensure limits and features are parsed as JSON if passed as string in draft
      const updateData: any = { ...payload };
      if (typeof updateData.limits === "string") {
        updateData.limits = JSON.parse(updateData.limits);
      }
      if (typeof updateData.features === "string") {
        updateData.features = JSON.parse(updateData.features);
      }
      const { error } = await supabase
        .from("subscription_plans")
        .update(updateData)
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["subscription-plans"] });
      toast.success("Plan updated");
    },
    onError: (error: Error) => toast.error(error.message),
  });

  const handleDraftChange = (id: string, field: keyof Plan, value: string) => {
    setDraft((prev) => ({
      ...prev,
      [id]: {
        ...prev[id],
        [field]: field === "base_price_monthly" ? Number(value) : value,
      },
    }));
  };

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Subscription Plans</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Manage pricing, limits, and features for the per-property SaaS subscription model.
        </p>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          <Skeleton className="h-48 w-full" />
          <Skeleton className="h-48 w-full" />
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-3">
          {(plans ?? []).map((plan) => {
            const currentDraft = draft[plan.id] || {};
            const isDirty = Object.keys(currentDraft).length > 0;
            return (
              <Card key={plan.id}>
                <CardHeader>
                  <CardTitle className="text-lg">{plan.name}</CardTitle>
                  <CardDescription>
                    {money(plan.base_price_monthly)} / property / month
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium">Monthly Base Price (KES)</label>
                    <Input
                      type="number"
                      disabled={!editable}
                      defaultValue={plan.base_price_monthly}
                      onChange={(e) => handleDraftChange(plan.id, "base_price_monthly", e.target.value)}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium">Limits (JSON)</label>
                    <Textarea
                      className="font-mono text-xs"
                      rows={5}
                      disabled={!editable}
                      defaultValue={JSON.stringify(plan.limits, null, 2)}
                      onChange={(e) => handleDraftChange(plan.id, "limits", e.target.value)}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium">Features (JSON Array)</label>
                    <Textarea
                      className="font-mono text-xs"
                      rows={5}
                      disabled={!editable}
                      defaultValue={JSON.stringify(plan.features, null, 2)}
                      onChange={(e) => handleDraftChange(plan.id, "features", e.target.value)}
                    />
                  </div>
                  {editable && (
                    <Button
                      className="w-full"
                      disabled={!isDirty}
                      onClick={() => {
                        try {
                          savePlan.mutate({ id: plan.id, payload: currentDraft });
                        } catch (e: any) {
                          toast.error("Invalid JSON format");
                        }
                      }}
                    >
                      Save Changes
                    </Button>
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
