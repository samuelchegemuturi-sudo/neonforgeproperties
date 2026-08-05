import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Check, KeyRound, Loader2, Lock } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { money, shortDate } from "@/lib/platform";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import PaystackPop from "@paystack/inline-js";
import { registerCompanyFn, activateTrialSubscriptionFn, renewSubscriptionFn } from "@/lib/platform.functions";

export const Route = createFileRoute("/_authenticated/onboarding")({
  head: () => ({
    meta: [
      { title: "Activate your company — Neon Forge Properties" },
      {
        name: "description",
        content: "Complete KYC, register your first property and activate your Neon Forge Properties licence.",
      },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: Onboarding,
});

type StepState = "done" | "current" | "locked";

function Onboarding() {
  const { access } = useAuth();
  const companyId = access?.profile?.company_id ?? null;
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const currency = access?.company?.currency ?? "KES";
  const [kyc, setKyc] = useState({ registration_no: "", tax_pin: "", contact_phone: "" });
  const [kraPin, setKraPin] = useState("");
  const [idFile, setIdFile] = useState<File | null>(null);
  const [picFile, setPicFile] = useState<File | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ["onboarding", companyId],
    enabled: Boolean(companyId),
    queryFn: async () => {
      const [company, properties, unitTypes, units, licence, fee] = await Promise.all([
        supabase
          .from("companies")
          .select("id, name, kyc_status, activation_status, verification_status, created_at")
          .eq("id", companyId!)
          .maybeSingle(),
        supabase.from("properties").select("id, name, verification_status").eq("company_id", companyId!),
        supabase.from("unit_types").select("id").eq("company_id", companyId!),
        supabase.from("units").select("id", { count: "exact", head: true }).eq("company_id", companyId!),
        supabase.from("licences").select("code, issued_at, activation_fee").eq("company_id", companyId!).maybeSingle(),
        supabase.from("platform_settings").select("key, value").in("key", ["activation_fee", "pg_paystack_public_key"]),
      ]);
      const settings = fee.data ?? [];
      const activationFee = settings.find((s) => s.key === "activation_fee")?.value ?? "20";
      const paystackKey = settings.find((s) => s.key === "pg_paystack_public_key")?.value ?? "";
      
      const propertiesList = properties.data ?? [];
      const verifiedProperties = propertiesList.filter(p => p.verification_status !== 'pending');
      
      let isFirstMonth = company.data?.activation_status === "pending_activation";
      let finalFee = isFirstMonth ? 20 : (verifiedProperties.length || 0) * 500;

      return {
        company: company.data,
        properties: propertiesList,
        verifiedPropertiesCount: verifiedProperties.length,
        unitTypes: unitTypes.data ?? [],
        unitCount: units.count ?? 0,
        licence: licence.data,
        fee: finalFee,
        isFirstMonth,
        paystackKey: String(paystackKey).replace(/^"|"$/g, ''),
      };
    },
  });

  // Removed automatic redirect to allow users to renew their subscription from this tab

  const saveKyc = useMutation({
    mutationFn: async () => {
      let id_document_url = null;
      let profile_picture_url = null;
      
      if (idFile) {
        const ext = idFile.name.split('.').pop();
        const path = `${access?.profile?.id}/id_${Date.now()}.${ext}`;
        const { error } = await supabase.storage.from("kyc_documents").upload(path, idFile);
        if (error) throw error;
        id_document_url = path;
      }
      
      if (picFile) {
        const ext = picFile.name.split('.').pop();
        const path = `${access?.profile?.id}/pic_${Date.now()}.${ext}`;
        const { error } = await supabase.storage.from("kyc_documents").upload(path, picFile);
        if (error) throw error;
        profile_picture_url = path;
      }

      const { error } = await supabase
        .from("companies")
        .update({ 
          kyc_status: "submitted", 
          kyc_details: kyc,
          kra_pin: kraPin,
          ...(id_document_url && { id_document_url }),
          ...(profile_picture_url && { profile_picture_url })
        } as any)
        .eq("id", companyId!);
      if (error) throw error;
      
      // Submit to verification queue
      const coords = await new Promise<{ lat: number | null; lng: number | null }>((resolve) => {
        if (!navigator.geolocation) return resolve({ lat: null, lng: null });
        navigator.geolocation.getCurrentPosition(
          (p) => resolve({ lat: p.coords.latitude, lng: p.coords.longitude }),
          () => resolve({ lat: null, lng: null }),
          { timeout: 4000 },
        );
      });
      
      await supabase.from("verification_requests").insert({
        company_id: companyId,
        target_type: "company",
        latitude: coords.lat,
        longitude: coords.lng
      });
    },
    onSuccess: () => {
      toast.success("KYC details submitted for verification");
      void queryClient.invalidateQueries({ queryKey: ["onboarding", companyId] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const activate = useMutation({
    mutationFn: async (reference?: string) => {
      // In a real app, you would verify the reference on the server here.
      if (data?.company?.activation_status === "pending_activation") {
        await activateTrialSubscriptionFn({ data: { company_id: companyId! } });
        return "Trial Activated";
      } else {
        await renewSubscriptionFn({ data: { company_id: companyId! } });
        return "Subscription Renewed";
      }
    },
    onSuccess: (msg) => {
      toast.success(msg);
      void queryClient.invalidateQueries();
      navigate({ to: "/dashboard", replace: true });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const payWithPaystack = () => {
    if (!data?.paystackKey || data.paystackKey === "pk_test_placeholder") {
      toast.error("Paystack public key is not configured in Integrations settings.");
      return;
    }
    
    const paystack = new PaystackPop();
    paystack.newTransaction({
      key: data.paystackKey,
      email: access?.profile?.email ?? "billing@neonforgeproperties.com",
      amount: data.fee * 100, // Paystack expects amount in lowest denomination (kobo/cents)
      currency: currency,
      metadata: {
        custom_fields: [
          { display_name: "Company ID", variable_name: "company_id", value: companyId! }
        ]
      },
      onSuccess: (transaction: any) => {
        toast.success("Payment successful! Activating your account...");
        activate.mutate(transaction.reference);
      },
      onCancel: () => {
        toast.info("Payment window closed.");
      },
    });
  };

  const registerCompany = useMutation({
    mutationFn: async (vars: { company_name: string; phone: string }) => {
      const res = await registerCompanyFn({
        data: vars,
      });
      return res;
    },
    onSuccess: () => {
      toast.success("Company created successfully!");
      // Reload page to re-fetch session and access which now has company
      window.location.reload();
    },
    onError: (e: Error) => toast.error(e.message),
  });

  if (!companyId) {
    return (
      <div className="mx-auto max-w-sm mt-12">
        <Card>
          <CardHeader>
            <CardTitle>Create your company</CardTitle>
            <CardDescription>
              Tell us about your property management company to get started.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={(e) => {
              e.preventDefault();
              const form = new FormData(e.currentTarget);
              registerCompany.mutate({
                company_name: String(form.get("company_name")),
                phone: String(form.get("phone")),
                company_type: String(form.get("company_type")),
              } as any);
            }} className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="company_name">Company Name</Label>
                <Input id="company_name" name="company_name" required />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="phone">Phone Number</Label>
                <Input id="phone" name="phone" required />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="company_type">Company Type</Label>
                <select 
                  id="company_type" 
                  name="company_type" 
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  required
                >
                  <option value="individual_landlord">Individual Landlord</option>
                  <option value="property_management_agency">Property Management Agency</option>
                  <option value="bnb_host">AirBnB / Short Term Host</option>
                </select>
              </div>
              <Button type="submit" className="w-full" disabled={registerCompany.isPending}>
                {registerCompany.isPending && <Loader2 className="mr-2 size-4 animate-spin" />}
                Create Company
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isLoading || !data) {
    return (
      <div className="mx-auto max-w-3xl space-y-4">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-40 w-full" />
        <Skeleton className="h-40 w-full" />
      </div>
    );
  }

  const kycDone = ["submitted", "verified", "approved"].includes(data.company?.kyc_status ?? "");
  const isPendingActivation = data.company?.activation_status === "pending_activation";

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">
          {isPendingActivation ? `Activate ${data.company?.name}` : `Company Settings for ${data.company?.name}`}
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {isPendingActivation 
            ? "Get started with your Neon Forge Properties licence by activating a 30-day trial."
            : "Manage your company KYC and subscription renewal."}
        </p>
      </div>

      {isPendingActivation ? (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Start your 30-day trial</CardTitle>
            <CardDescription>
              One-time activation fee of {money(20, currency)} for your first 30 days. After 30 days, standard billing applies (KES 500 per property).
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm text-muted-foreground">
              Pay securely with Paystack to instantly activate your account and start managing your properties.
            </p>
            <Button
              disabled={activate.isPending}
              onClick={() => {
                // Temporary override for fee during trial activation
                data.fee = 20;
                payWithPaystack();
              }}
            >
              {activate.isPending && <Loader2 className="mr-2 size-4 animate-spin" />}
              Pay {money(20, currency)} & Activate Trial
            </Button>
          </CardContent>
        </Card>
      ) : (
        <>
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Company KYC</CardTitle>
              <CardDescription>
                Registration and tax details used on invoices and disbursements.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {kycDone ? (
                <Badge variant="secondary">Submitted — {data.company?.kyc_status}</Badge>
              ) : (
                <form
                  className="grid gap-3 sm:grid-cols-3"
                  onSubmit={(e) => {
                    e.preventDefault();
                    saveKyc.mutate();
                  }}
                >
                  <div className="space-y-1.5">
                    <Label htmlFor="reg">Registration no. (Optional)</Label>
                    <Input
                      id="reg"
                      value={kyc.registration_no}
                      onChange={(e) => setKyc({ ...kyc, registration_no: e.target.value })}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="pin">KRA PIN</Label>
                    <Input
                      id="pin"
                      value={kraPin}
                      onChange={(e) => setKraPin(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="phone">Contact phone</Label>
                    <Input
                      id="phone"
                      value={kyc.contact_phone}
                      onChange={(e) => setKyc({ ...kyc, contact_phone: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-1.5 sm:col-span-3">
                    <Label htmlFor="idDoc">ID Document (PDF or Image)</Label>
                    <Input
                      id="idDoc"
                      type="file"
                      accept="image/*,application/pdf"
                      onChange={(e) => setIdFile(e.target.files?.[0] ?? null)}
                      required
                    />
                  </div>
                  <div className="space-y-1.5 sm:col-span-3">
                    <Label htmlFor="picFile">Profile Picture / Selfie</Label>
                    <Input
                      id="picFile"
                      type="file"
                      accept="image/*"
                      onChange={(e) => setPicFile(e.target.files?.[0] ?? null)}
                      required
                    />
                  </div>
                  <div className="sm:col-span-3">
                    <Button type="submit" disabled={saveKyc.isPending}>
                      {saveKyc.isPending && <Loader2 className="mr-2 size-4 animate-spin" />}
                      Submit KYC Documents
                    </Button>
                  </div>
                </form>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Subscription & Renewal</CardTitle>
              <CardDescription>
                Standard billing of {money(500, currency)} per registered property.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {data.properties.length === 0 ? (
                <>
                  <p className="text-sm text-muted-foreground">
                    You currently have 0 properties registered. Please add a property first to calculate your renewal fee.
                  </p>
                  <Button onClick={() => navigate({ to: "/properties" })}>
                    Add Properties
                  </Button>
                </>
              ) : (
                <>
                  <p className="text-sm text-muted-foreground">
                    Your current renewal fee based on {data.verifiedPropertiesCount} verified properties is {money(data.fee, currency)}.
                  </p>
                  <Button
                    disabled={activate.isPending}
                    onClick={payWithPaystack}
                  >
                    {activate.isPending && <Loader2 className="mr-2 size-4 animate-spin" />}
                    Pay {money(data.fee, currency)} to Renew
                  </Button>
                </>
              )}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
