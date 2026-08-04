import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { money, titleCase } from "@/lib/platform";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export const Route = createFileRoute("/_authenticated/pricing")({
  head: () => ({
    meta: [
      { title: "Pricing Rules — Neon Forge Properties" },
      { name: "description", content: "Per-unit subscription pricing and platform fees on Neon Forge Properties." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: PricingPage,
});

type Rule = {
  id: string;
  slug: string;
  label: string;
  bedrooms: number | null;
  price_per_unit: number;
  category: string;
  is_configurable: boolean;
  sort_order: number;
};

type Setting = { key: string; value: unknown; label: string; category: string };

function PricingPage() {
  const { can } = useAuth();
  const queryClient = useQueryClient();
  const editable = can("pricing.edit");
  const [draft, setDraft] = useState<Record<string, string>>({});

  const { data: rules, isLoading } = useQuery({
    queryKey: ["pricing-rules"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("pricing_rules")
        .select("id, slug, label, bedrooms, price_per_unit, category, is_configurable, sort_order")
        .order("sort_order");
      if (error) throw error;
      return data as Rule[];
    },
  });

  const { data: settings } = useQuery({
    queryKey: ["platform-settings"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("platform_settings")
        .select("key, value, label, category")
        .order("key");
      if (error) throw error;
      return data as Setting[];
    },
  });

  const savePrice = useMutation({
    mutationFn: async ({ id, price }: { id: string; price: number }) => {
      const { error } = await supabase
        .from("pricing_rules")
        .update({ price_per_unit: price })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["pricing-rules"] });
      toast.success("Price updated");
    },
    onError: (error: Error) => toast.error(error.message),
  });

  const saveSetting = useMutation({
    mutationFn: async ({ key, value }: { key: string; value: string | number }) => {
      const { error } = await supabase.from("platform_settings").update({ value }).eq("key", key);
      if (error) throw error;
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["platform-settings"] });
      toast.success("Setting saved");
    },
    onError: (error: Error) => toast.error(error.message),
  });

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Pricing rules</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Monthly subscription is recalculated every cycle from these per-unit prices.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Platform fees</CardTitle>
          <CardDescription>Activation, commission and verification charges.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          {(settings ?? []).map((s) => (
            <div key={s.key} className="grid gap-1.5">
              <Label htmlFor={s.key}>{s.label}</Label>
              <div className="flex gap-2">
                <Input
                  id={s.key}
                  defaultValue={String(s.value).replace(/"/g, "")}
                  disabled={!editable}
                  onChange={(e) => setDraft((d) => ({ ...d, [s.key]: e.target.value }))}
                />
                {editable && (
                  <Button
                    variant="outline"
                    disabled={draft[s.key] === undefined}
                    onClick={() => {
                      const raw = draft[s.key]!;
                      const value = Number.isNaN(Number(raw)) ? raw : Number(raw);
                      saveSetting.mutate({ key: s.key, value });
                    }}
                  >
                    Save
                  </Button>
                )}
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Per-unit subscription pricing</CardTitle>
          <CardDescription>
            Each additional bedroom adds KES 50 by default — adjust any row directly.
          </CardDescription>
        </CardHeader>
        <CardContent className="px-0">
          {isLoading ? (
            <div className="space-y-2 px-6">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Unit type</TableHead>
                    <TableHead>Bedrooms</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Price / unit / month</TableHead>
                    {editable && <TableHead className="text-right">Save</TableHead>}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {(rules ?? []).map((r) => (
                    <TableRow key={r.id}>
                      <TableCell className="font-medium">{r.label}</TableCell>
                      <TableCell>{r.bedrooms ?? "—"}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{titleCase(r.category)}</Badge>
                      </TableCell>
                      <TableCell className="w-44">
                        {editable ? (
                          <Input
                            type="number"
                            min={0}
                            defaultValue={r.price_per_unit}
                            onChange={(e) => setDraft((d) => ({ ...d, [r.id]: e.target.value }))}
                          />
                        ) : (
                          money(r.price_per_unit)
                        )}
                      </TableCell>
                      {editable && (
                        <TableCell className="text-right">
                          <Button
                            size="sm"
                            variant="outline"
                            disabled={draft[r.id] === undefined}
                            onClick={() =>
                              savePrice.mutate({ id: r.id, price: Number(draft[r.id]) })
                            }
                          >
                            Save
                          </Button>
                        </TableCell>
                      )}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
