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
        supabase.from("properties").select("id, name").eq("company_id", companyId!),
        supabase.from("unit_types").select("id").eq("company_id", companyId!),
        supabase.from("units").select("id", { count: "exact", head: true }).eq("company_id", companyId!),
        supabase.from("licences").select("code, issued_at, activation_fee").eq("company_id", companyId!).maybeSingle(),
        supabase.from("platform_settings").select("key, value").in("key", ["activation_fee", "pg_paystack_public_key"]),
      ]);
      const settings = fee.data ?? [];
      const activationFee = settings.find((s) => s.key === "activation_fee")?.value ?? "20";
      const paystackKey = settings.find((s) => s.key === "pg_paystack_public_key")?.value ?? "";
      
      let finalFee = Number(activationFee);
      let isFirstMonth = true;
      if (company.data?.created_at) {
        const daysOld = (new Date().getTime() - new Date(company.data.created_at).getTime()) / (1000 * 60 * 60 * 24);
        if (daysOld > 30) {
          isFirstMonth = false;
          const { data: calculatedFee } = await supabase.rpc("calculate_subscription_amount" as any, { c_id: companyId! });
          if (calculatedFee !== null && calculatedFee !== undefined) {
             finalFee = Number(calculatedFee);
          } else {
             finalFee = (properties.data?.length || 1) * 500;
          }
        }
      }

      return {
        company: company.data,
        properties: properties.data ?? [],
        unitTypes: unitTypes.data ?? [],
        unitCount: units.count ?? 0,
        licence: licence.data,
        fee: finalFee,
        isFirstMonth,
        paystackKey: String(paystackKey).replace(/^"|"$/g, ''),
      };
    },
  });

  useEffect(() => {
    if (data?.company?.activation_status === "active") {
      navigate({ to: "/dashboard", replace: true });
    }
  }, [data?.company?.activation_status, navigate]);

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
          kra_pin: kraPin as any,
          ...(id_document_url && { id_document_url }),
          ...(profile_picture_url && { profile_picture_url })
        })
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
      const { data: code, error } = await supabase.rpc("generate_licence", {
        _company_id: companyId!,
      });
      if (error) throw error;
      
      // Update activation status to active
      await supabase.from("companies").update({ activation_status: "active" }).eq("id", companyId!);
      
      return code as string;
    },
    onSuccess: (code) => {
      toast.success(`Licence issued — ${code}`);
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

  if (!companyId) {
    return (
      <div className="mx-auto max-w-3xl">
        <Card>
          <CardContent className="py-12 text-center text-sm text-muted-foreground">
            Your account is not attached to a company, so there is nothing to activate.
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
  const licenceDone = Boolean(data.licence);

  const steps = [
    { key: "kyc", title: "Company KYC", done: kycDone },
    { key: "licence", title: "Activation fee & licence", done: licenceDone },
  ];
  const currentIndex = steps.findIndex((s) => !s.done);

  const stateOf = (i: number): StepState =>
    steps[i]!.done ? "done" : currentIndex === i ? "current" : "locked";

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Activate {data.company?.name}</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Get started with your Neon Forge Properties licence. You can leave and come back — progress is read from
          your account.
        </p>
      </div>

      <ol className="grid gap-2 sm:grid-cols-4">
        {steps.map((s, i) => {
          const state = stateOf(i);
          return (
            <li
              key={s.key}
              className={`rounded-lg border p-3 text-xs ${
                state === "current" ? "border-primary bg-primary/5" : "border-border"
              }`}
            >
              <span className="flex items-center gap-1.5 font-medium">
                {state === "done" ? (
                  <Check className="size-3.5 text-primary" />
                ) : state === "locked" ? (
                  <Lock className="size-3.5 text-muted-foreground" />
                ) : (
                  <span className="size-3.5 rounded-full border-2 border-primary" />
                )}
                {s.title}
              </span>
              <span className="mt-1 block text-muted-foreground">
                {state === "done" ? "Complete" : state === "current" ? "In progress" : "Locked"}
              </span>
            </li>
          );
        })}
      </ol>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">1. Company KYC</CardTitle>
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
          <CardTitle className="text-base">2. Activation fee & licence</CardTitle>
          <CardDescription>
            {data.isFirstMonth 
              ? `One-time activation fee of ${money(data.fee, currency)} for your first 30 days. After 30 days, standard billing applies.` 
              : `Standard activation fee of ${money(data.fee, currency)} based on your registered properties.`}
            {" "}Once settled, a permanent licence code is issued and your portfolio goes live.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {licenceDone ? (
            <div className="flex flex-wrap items-center gap-3 rounded-lg border bg-muted/40 p-3">
              <KeyRound className="size-4 text-primary" />
              <span className="font-mono text-sm font-semibold">{data.licence!.code}</span>
              <span className="text-xs text-muted-foreground">
                issued {shortDate(data.licence!.issued_at)} ·{" "}
                {money(data.licence!.activation_fee, currency)}
              </span>
            </div>
          ) : (
            <>
              <p className="text-sm text-muted-foreground">
                {kycDone
                  ? "Pay securely with Paystack to instantly activate your account and start managing your properties."
                  : "Finish the KYC step above to unlock activation."}
              </p>
              <Button
                disabled={!kycDone || activate.isPending}
                onClick={payWithPaystack}
              >
                {activate.isPending && <Loader2 className="mr-2 size-4 animate-spin" />}
                Pay {money(data.fee, currency)} & Activate
              </Button>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
