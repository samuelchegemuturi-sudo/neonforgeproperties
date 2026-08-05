import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Building2, MapPin, Plus, BadgeCheck } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { money, shortDate, statusTone, titleCase } from "@/lib/platform";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export const Route = createFileRoute("/_authenticated/properties")({
  head: () => ({
    meta: [
      { title: "Properties — Neon Forge Properties" },
      { name: "description", content: "Register properties and configure their unit types in Neon Forge Properties." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: PropertiesPage,
});

type PropertyRow = {
  id: string;
  name: string;
  property_type: string;
  address: string | null;
  city: string | null;
  latitude: number | null;
  longitude: number | null;
  status: string;
  verification_status: string;
  created_at: string;
  company_id: string;
  units: { count: number }[];
};

function PropertiesPage() {
  const { access, can } = useAuth();
  const queryClient = useQueryClient();
  const companyId = access?.profile?.company_id ?? null;
  const [open, setOpen] = useState(false);
  const [detail, setDetail] = useState<PropertyRow | null>(null);

  const { data: clientLandlords } = useQuery({
    queryKey: ["client-landlords", companyId],
    enabled: Boolean(companyId),
    queryFn: async () => {
      const { data, error } = await supabase
        .from("user_roles")
        .select("user_id, profiles(id, full_name, email), roles!inner(slug)")
        .eq("company_id", companyId!)
        .eq("roles.slug", "client_landlord");
      if (error) throw error;
      return (data.map((d: any) => d.profiles) || []) as { id: string; full_name: string; email: string }[];
    },
  });

  const { data: properties, isLoading } = useQuery({
    queryKey: ["properties", access?.roles?.some(r => r.slug === "client_landlord") ? "client_landlord" : "all"],
    queryFn: async () => {
      let q = supabase
        .from("properties")
        .select(
          "id, name, property_type, address, city, latitude, longitude, status, verification_status, created_at, company_id, owner_id, units(count)",
        );
      
      if (access?.roles?.some(r => r.slug === "client_landlord") && access?.profile?.id) {
        q = q.eq("owner_id", access.profile.id);
      }

      const { data, error } = await q.order("created_at", { ascending: false });
      if (error) throw error;
      return data as unknown as PropertyRow[];
    },
  });

  const createProperty = useMutation({
    mutationFn: async (input: Record<string, string>) => {
      if (!companyId) throw new Error("You are not attached to a company");
      const { error } = await supabase.from("properties").insert({
        company_id: companyId,
        name: input['name']!,
        property_type: input['property_type']!,
        address: input['address'] || null,
        city: input['city'] || null,
        latitude: input['latitude'] ? Number(input['latitude']) : null,
        longitude: input['longitude'] ? Number(input['longitude']) : null,
        owner_id: input['owner_id'] && input['owner_id'] !== 'none' ? input['owner_id'] : null,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      setOpen(false);
      void queryClient.invalidateQueries({ queryKey: ["properties"] });
      toast.success("Property registered");
    },
    onError: (error: Error) => toast.error(error.message),
  });

  const requestVerification = useMutation({
    mutationFn: async (property: PropertyRow) => {
      const { error } = await supabase.from("verification_requests").insert({
        company_id: property.company_id,
        property_id: property.id,
        target_type: "property",
        latitude: property.latitude,
        longitude: property.longitude,
      });
      if (error) throw error;
      await supabase
        .from("properties")
        .update({ verification_status: "pending" })
        .eq("id", property.id);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries();
      toast.success("Sent to the verification queue");
    },
    onError: (error: Error) => toast.error(error.message),
  });

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Properties</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Register a property, then configure unit types — units are generated automatically.
          </p>
        </div>
        {can("property.create") && (
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="size-4" /> Register property
              </Button>
            </DialogTrigger>
            <DialogContent>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  const form = new FormData(e.currentTarget);
                  createProperty.mutate(Object.fromEntries(form) as Record<string, string>);
                }}
              >
                <DialogHeader>
                  <DialogTitle>Register a property</DialogTitle>
                  <DialogDescription>Location details feed the verification workflow.</DialogDescription>
                </DialogHeader>
                <div className="grid gap-3 py-4">
                  <div className="grid gap-1.5">
                    <Label htmlFor="p-name">Property name</Label>
                    <Input id="p-name" name="name" required placeholder="Riverside Court" />
                  </div>
                  <div className="grid gap-1.5">
                    <Label htmlFor="p-type">Type</Label>
                    <Select name="property_type" defaultValue="residential">
                      <SelectTrigger id="p-type">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="residential">Residential</SelectItem>
                        <SelectItem value="commercial">Commercial</SelectItem>
                        <SelectItem value="mixed">Mixed use</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  {clientLandlords && clientLandlords.length > 0 && (
                    <div className="grid gap-1.5">
                      <Label htmlFor="p-owner">Property Owner (Client Landlord)</Label>
                      <Select name="owner_id">
                        <SelectTrigger id="p-owner">
                          <SelectValue placeholder="Select an owner (optional)" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">None (Agency owned)</SelectItem>
                          {clientLandlords.map((cl) => (
                            <SelectItem key={cl.id} value={cl.id}>
                              {cl.full_name} ({cl.email})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                  <div className="grid gap-1.5">
                    <Label htmlFor="p-address">Address</Label>
                    <Input id="p-address" name="address" placeholder="Ngong Road" />
                  </div>
                  <div className="grid gap-1.5">
                    <Label htmlFor="p-city">City / town</Label>
                    <Input id="p-city" name="city" placeholder="Nairobi" />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="grid gap-1.5">
                      <Label htmlFor="p-lat">Latitude</Label>
                      <Input id="p-lat" name="latitude" type="number" step="any" />
                    </div>
                    <div className="grid gap-1.5">
                      <Label htmlFor="p-lng">Longitude</Label>
                      <Input id="p-lng" name="longitude" type="number" step="any" />
                    </div>
                  </div>
                </div>
                <DialogFooter>
                  <Button type="submit" disabled={createProperty.isPending}>
                    {createProperty.isPending ? "Saving…" : "Register property"}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <Skeleton className="h-40" />
          <Skeleton className="h-40" />
          <Skeleton className="h-40" />
        </div>
      ) : !properties?.length ? (
        <Card>
          <CardContent className="py-14 text-center text-sm text-muted-foreground">
            <Building2 className="mx-auto mb-3 size-6" />
            No properties yet. Register your first one to unlock units and billing.
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {properties.map((p) => (
            <Card key={p.id} className="flex flex-col">
              <CardHeader>
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <CardTitle className="text-base">{p.name}</CardTitle>
                    <CardDescription>{titleCase(p.property_type)}</CardDescription>
                  </div>
                  <Badge variant={statusTone(p.status)}>{titleCase(p.status)}</Badge>
                </div>
              </CardHeader>
              <CardContent className="flex-1 space-y-2 text-sm">
                <p className="flex items-center gap-1.5 text-muted-foreground">
                  <MapPin className="size-3.5" /> {p.address ?? "No address"}
                  {p.city ? `, ${p.city}` : ""}
                </p>
                <p className="text-muted-foreground">
                  {p.units?.[0]?.count ?? 0} units · added {shortDate(p.created_at)}
                </p>
                <div className="flex flex-wrap items-center gap-2 pt-1">
                  <Badge variant={statusTone(p.verification_status)}>
                    <BadgeCheck className="mr-1 size-3" />
                    {titleCase(p.verification_status)}
                  </Badge>
                </div>
              </CardContent>
              <CardContent className="flex gap-2 pt-0">
                <Button 
                  size="sm" 
                  variant="outline" 
                  onClick={() => setDetail(p)}
                  disabled={p.verification_status !== "verified"}
                >
                  Unit types
                </Button>
                {can("property.edit") && p.verification_status === "unverified" && (
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => requestVerification.mutate(p)}
                    disabled={requestVerification.isPending}
                  >
                    Request verification
                  </Button>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <UnitTypesDialog property={detail} onClose={() => setDetail(null)} />
    </div>
  );
}

type UnitType = {
  id: string;
  label: string;
  pricing_slug: string;
  bedrooms: number;
  quantity: number;
  rent: number;
  service_charge: number;
  deposit: number;
};

function UnitTypesDialog({
  property,
  onClose,
}: {
  property: PropertyRow | null;
  onClose: () => void;
}) {
  const queryClient = useQueryClient();
  const { access } = useAuth();
  const currency = access?.company?.currency ?? "KES";

  const { data: rules } = useQuery({
    queryKey: ["pricing-rules"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("pricing_rules")
        .select("slug, label, bedrooms, price_per_unit")
        .order("sort_order");
      if (error) throw error;
      return data;
    },
  });

  const { data: unitTypes } = useQuery({
    queryKey: ["unit-types", property?.id],
    enabled: Boolean(property),
    queryFn: async () => {
      const { data, error } = await supabase
        .from("unit_types")
        .select("id, label, pricing_slug, bedrooms, quantity, rent, service_charge, deposit")
        .eq("property_id", property!.id)
        .order("created_at");
      if (error) throw error;
      return data as UnitType[];
    },
  });

  const addType = useMutation({
    mutationFn: async (form: Record<string, string>) => {
      const rule = rules?.find((r) => r.slug === form['pricing_slug']);
      const { error } = await supabase.from("unit_types").insert({
        company_id: property!.company_id,
        property_id: property!.id,
        pricing_slug: form['pricing_slug']!,
        label: rule?.label ?? form['pricing_slug']!,
        bedrooms: rule?.bedrooms ?? 0,
        quantity: Number(form['quantity'] ?? 0),
        rent: Number(form['rent'] ?? 0),
        service_charge: Number(form['service_charge'] ?? 0),
        deposit: Number(form['deposit'] ?? 0),
      });
      if (error) throw error;
    },
    onSuccess: () => {
      void queryClient.invalidateQueries();
      toast.success("Units generated");
    },
    onError: (error: Error) => toast.error(error.message),
  });

  return (
    <Dialog open={Boolean(property)} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{property?.name} — unit configuration</DialogTitle>
          <DialogDescription>
            Units are created automatically from the quantity you enter.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-2">
          {(unitTypes ?? []).map((t) => (
            <div
              key={t.id}
              className="flex items-center justify-between rounded-md border border-border px-3 py-2 text-sm"
            >
              <div>
                <p className="font-medium">{t.label}</p>
                <p className="text-xs text-muted-foreground">
                  {t.quantity} units · rent {money(t.rent, currency)} · deposit{" "}
                  {money(t.deposit, currency)}
                </p>
              </div>
              <Badge variant="outline">{t.bedrooms} bd</Badge>
            </div>
          ))}
          {!unitTypes?.length && (
            <p className="text-sm text-muted-foreground">No unit types configured yet.</p>
          )}
        </div>

        <form
          className="grid gap-3 border-t border-border pt-4"
          onSubmit={(e) => {
            e.preventDefault();
            const form = new FormData(e.currentTarget);
            addType.mutate(Object.fromEntries(form) as Record<string, string>);
            e.currentTarget.reset();
          }}
        >
          <div className="grid gap-1.5">
            <Label htmlFor="ut-slug">Unit type</Label>
            <Select name="pricing_slug" defaultValue="bedsitter">
              <SelectTrigger id="ut-slug">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {(rules ?? []).map((r) => (
                  <SelectItem key={r.slug} value={r.slug}>
                    {r.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <div className="grid gap-1.5">
              <Label htmlFor="ut-qty">Quantity</Label>
              <Input id="ut-qty" name="quantity" type="number" min={1} defaultValue={1} required />
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="ut-rent">Rent</Label>
              <Input id="ut-rent" name="rent" type="number" min={0} defaultValue={0} />
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="ut-sc">Service charge</Label>
              <Input id="ut-sc" name="service_charge" type="number" min={0} defaultValue={0} />
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="ut-dep">Deposit</Label>
              <Input id="ut-dep" name="deposit" type="number" min={0} defaultValue={0} />
            </div>
          </div>
          <DialogFooter>
            <Button type="submit" disabled={addType.isPending}>
              {addType.isPending ? "Generating…" : "Add unit type"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
