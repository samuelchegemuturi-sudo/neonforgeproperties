import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { BadgeCheck, MapPin, Check, Loader2, X } from "lucide-react";
import { useServerFn } from "@tanstack/react-start";
import { sendEmailFn } from "@/lib/platform.functions";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { shortDate, statusTone, titleCase } from "@/lib/platform";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { useState, useEffect } from "react";

function SignedUrlLink({ path, label }: { path: string; label: string }) {
  const [url, setUrl] = useState<string>("");
  useEffect(() => {
    supabase.storage.from("kyc_documents").createSignedUrl(path, 3600).then(({ data }) => {
      if (data?.signedUrl) setUrl(data.signedUrl);
    });
  }, [path]);
  
  if (!url) return <span className="text-xs text-muted-foreground animate-pulse">Loading...</span>;
  return (
    <a href={url} target="_blank" rel="noreferrer" className="text-primary hover:underline text-xs">
      {label}
    </a>
  );
}

export const Route = createFileRoute("/_authenticated/verification")({
  head: () => ({
    meta: [
      { title: "Verification Queue — Neon Forge Properties" },
      { name: "description", content: "Field verification of properties, landlords and agencies." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: VerificationPage,
});

type RequestRow = {
  id: string;
  target_type: string;
  status: string;
  latitude: number | null;
  longitude: number | null;
  report: string | null;
  created_at: string;
  company_id: string | null;
  property_id: string | null;
  properties: { name: string; address: string | null } | null;
  companies: { 
    name: string; 
    kra_pin: string | null; 
    id_document_url: string | null; 
    profile_picture_url: string | null;
  } | null;
};

export function VerificationPage() {
  const { can, user } = useAuth();
  const sendEmail = useServerFn(sendEmailFn);
  const queryClient = useQueryClient();
  const [reports, setReports] = useState<Record<string, string>>({});

  const { data: requests, isLoading } = useQuery({
    queryKey: ["verification-requests"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("verification_requests")
        .select(
          "id, target_type, status, latitude, longitude, report, created_at, company_id, property_id, properties(name, address), companies(name, kra_pin, id_document_url, profile_picture_url)",
        )
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as unknown as RequestRow[];
    },
  });

  const decide = useMutation({
    mutationFn: async ({
      row,
      status,
    }: {
      row: RequestRow;
      status: "approved" | "rejected";
    }) => {
      const coords = await new Promise<{ lat: number | null; lng: number | null }>((resolve) => {
        if (!navigator.geolocation) return resolve({ lat: null, lng: null });
        navigator.geolocation.getCurrentPosition(
          (p) => resolve({ lat: p.coords.latitude, lng: p.coords.longitude }),
          () => resolve({ lat: null, lng: null }),
          { timeout: 4000 },
        );
      });

      const { error } = await supabase
        .from("verification_requests")
        .update({
          status,
          report: reports[row.id] ?? row.report,
          decision_at: new Date().toISOString(),
          decided_by: user?.id ?? null,
          latitude: coords.lat ?? row.latitude,
          longitude: coords.lng ?? row.longitude,
        })
        .eq("id", row.id);
      if (error) throw error;

      if (row.target_type === "company" && row.company_id) {
        await supabase
          .from("companies")
          .update({
            kyc_status: status === "approved" ? "approved" : "rejected",
          })
          .eq("id", row.company_id);
      } else if (row.property_id) {
        await supabase
          .from("properties")
          .update({
            verification_status: status === "approved" ? "verified" : "rejected",
            verified_at: new Date().toISOString(),
            verified_by: user?.id ?? null,
          })
          .eq("id", row.property_id);
      }
    },
    onSuccess: () => {
      void queryClient.invalidateQueries();
      toast.success("Verification recorded");
    },
    onError: (error: Error) => toast.error(error.message),
  });

  const manualActivate = useMutation({
    mutationFn: async (companyId: string) => {
      const { error } = await supabase
        .from("companies")
        .update({ activation_status: "active" })
        .eq("id", companyId);
      if (error) throw error;
      
      const { error: rpcError } = await supabase.rpc("generate_licence", {
        _company_id: companyId,
      });
      if (rpcError) throw rpcError;
      
      const trialEnd = new Date();
      trialEnd.setDate(trialEnd.getDate() + 30);
      await supabase.from("platform_subscriptions").insert({
        company_id: companyId,
        status: "trialing",
        trial_ends_at: trialEnd.toISOString(),
        current_period_end: trialEnd.toISOString(),
      });
      
      // Try to send email
      const { data: profiles } = await supabase.from("profiles").select("email").eq("company_id", companyId).limit(1);
      if (profiles && profiles.length > 0) {
        await sendEmail({
          data: {
            to: profiles[0].email,
            subject: 'Account Activated - Welcome to Neon Forge Properties!',
            htmlContent: '<h1>Welcome to Neon Forge Properties!</h1><p>Your account has been manually activated by an administrator. You can now start adding properties and units to your dashboard.</p>'
          }
        });
      }
    },
    onSuccess: () => {
      toast.success("Company manually activated");
      void queryClient.invalidateQueries();
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const pending = (requests ?? []).filter((r) => r.status === "pending");
  const done = (requests ?? []).filter((r) => r.status !== "pending");

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Verification queue</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Confirm ownership on the ground, capture GPS, then approve or reject.
        </p>
      </div>

      {isLoading ? (
        <Skeleton className="h-40 w-full" />
      ) : !requests?.length ? (
        <Card>
          <CardContent className="py-14 text-center text-sm text-muted-foreground">
            <BadgeCheck className="mx-auto mb-3 size-6" />
            Nothing in the queue. Requests appear here when a company submits a property for
            verification.
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {pending.map((r) => (
            <Card key={r.id}>
              <CardHeader>
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <CardTitle className="text-base">
                      {r.properties?.name ?? r.companies?.name ?? titleCase(r.target_type)}
                    </CardTitle>
                    <CardDescription>
                      {r.companies?.name} · {r.properties?.address ?? "No address"} ·{" "}
                      {shortDate(r.created_at)}
                    </CardDescription>
                  </div>
                  <Badge variant={statusTone(r.status)}>{titleCase(r.status)}</Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                {r.latitude && r.longitude && (
                  <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <MapPin className="size-3.5" /> {r.latitude}, {r.longitude}
                  </p>
                )}
                {r.companies && (r.companies.kra_pin || r.companies.id_document_url || r.companies.profile_picture_url) && (
                  <div className="rounded-md border p-3 bg-muted/20 text-sm space-y-2 mb-3">
                    <p className="font-medium text-xs text-muted-foreground uppercase tracking-wider">KYC Documents</p>
                    {r.companies.kra_pin && <p><strong>KRA PIN:</strong> {r.companies.kra_pin}</p>}
                    <div className="flex gap-4 mt-2">
                      {r.companies.id_document_url && (
                        <SignedUrlLink path={r.companies.id_document_url} label="View ID Document" />
                      )}
                      {r.companies.profile_picture_url && (
                        <SignedUrlLink path={r.companies.profile_picture_url} label="View Profile Picture" />
                      )}
                    </div>
                  </div>
                )}
                {can("verification.approve") && (
                  <>
                    <Textarea
                      placeholder="Verification report — what you saw on site, documents checked…"
                      defaultValue={r.report ?? ""}
                      onChange={(e) => setReports((s) => ({ ...s, [r.id]: e.target.value }))}
                    />
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        disabled={decide.isPending}
                        onClick={() => decide.mutate({ row: r, status: "approved" })}
                      >
                        Approve
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        disabled={decide.isPending}
                        onClick={() => decide.mutate({ row: r, status: "rejected" })}
                      >
                        Reject
                      </Button>
                      {r.target_type === "company" && r.company_id && (
                        <Button
                          size="sm"
                          variant="outline"
                          disabled={manualActivate.isPending}
                          onClick={() => manualActivate.mutate(r.company_id!)}
                        >
                          {manualActivate.isPending ? "Activating..." : "Manually Activate"}
                        </Button>
                      )}
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          ))}

          {done.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Completed</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {done.map((r) => (
                  <div
                    key={r.id}
                    className="flex items-center justify-between border-b border-border py-2 text-sm last:border-0"
                  >
                    <span>{r.properties?.name ?? r.companies?.name ?? "—"}</span>
                    <div className="flex items-center gap-3">
                      <Badge variant={statusTone(r.status)}>{titleCase(r.status)}</Badge>
                      {r.status === "rejected" && can("verification.approve") && (
                        <Button 
                          size="sm" 
                          variant="outline"
                          disabled={decide.isPending}
                          onClick={() => decide.mutate({ row: r, status: "approved" })}
                        >
                          Approve
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}
