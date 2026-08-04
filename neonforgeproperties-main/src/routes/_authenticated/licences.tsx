import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { KeyRound } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { money, shortDate, statusTone, titleCase } from "@/lib/platform";
import { Button } from "@/components/ui/button";
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

export const Route = createFileRoute("/_authenticated/licences")({
  head: () => ({
    meta: [
      { title: "Licence Management — Neon Forge Properties" },
      { name: "description", content: "Activation licences issued to companies on Neon Forge Properties." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: LicencesPage,
});

type LicenceRow = {
  id: string;
  code: string;
  status: string;
  activation_fee: number;
  issued_at: string;
  company_id: string;
  companies: { name: string; company_type: string } | null;
};

function LicencesPage() {
  const { can } = useAuth();
  const queryClient = useQueryClient();

  const { data: licences, isLoading } = useQuery({
    queryKey: ["licences"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("licences")
        .select("id, code, status, activation_fee, issued_at, company_id, companies(name, company_type)")
        .order("issued_at", { ascending: false });
      if (error) throw error;
      return data as unknown as LicenceRow[];
    },
  });

  const { data: unlicensed } = useQuery({
    queryKey: ["companies-unlicensed"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("companies")
        .select("id, name, activation_status, licences(id)")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data as unknown as { id: string; name: string; licences: { id: string }[] }[]).filter(
        (c) => c.licences.length === 0,
      );
    },
  });

  const issue = useMutation({
    mutationFn: async (companyId: string) => {
      const { data, error } = await supabase.rpc("generate_licence", { _company_id: companyId });
      if (error) throw error;
      return data as string;
    },
    onSuccess: (code) => {
      void queryClient.invalidateQueries();
      toast.success(`Licence issued: ${code}`);
    },
    onError: (error: Error) => toast.error(error.message),
  });

  const revoke = useMutation({
    mutationFn: async ({ id, company_id, status }: { id: string; company_id: string; status: string }) => {
      if (status === "revoked") {
        const { error } = await supabase.from("licences").delete().eq("id", id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("licences").update({ status }).eq("id", id);
        if (error) throw error;
      }
      
      const { error: companyError } = await supabase.from("companies").update({ 
        activation_status: status === "active" ? "active" : "pending_activation" 
      }).eq("id", company_id);
      
      if (companyError) throw companyError;
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["licences"] });
      toast.success("Licence updated");
    },
    onError: (error: Error) => toast.error(error.message),
  });

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Licence management</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          One permanent licence per company, issued after the one-time activation fee.
        </p>
      </div>

      {can("licence.generate") && (unlicensed?.length ?? 0) > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Awaiting licence</CardTitle>
            <CardDescription>
              These companies have no licence yet, so their dashboards stay locked.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-2">
            {unlicensed!.map((c) => (
              <Button
                key={c.id}
                size="sm"
                variant="outline"
                disabled={issue.isPending}
                onClick={() => issue.mutate(c.id)}
              >
                <KeyRound className="size-4" /> {c.name}
              </Button>
            ))}
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Issued licences</CardTitle>
        </CardHeader>
        <CardContent className="px-0">
          {isLoading ? (
            <div className="space-y-2 px-6">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
          ) : !licences?.length ? (
            <p className="px-6 py-12 text-center text-sm text-muted-foreground">
              No licences issued yet.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Licence code</TableHead>
                    <TableHead>Company</TableHead>
                    <TableHead>Activation fee</TableHead>
                    <TableHead>Issued</TableHead>
                    <TableHead>Status</TableHead>
                    {can("licence.revoke") && <TableHead className="text-right">Actions</TableHead>}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {licences.map((l) => (
                    <TableRow key={l.id}>
                      <TableCell className="font-mono text-sm">{l.code}</TableCell>
                      <TableCell>{l.companies?.name ?? "—"}</TableCell>
                      <TableCell>{money(l.activation_fee)}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {shortDate(l.issued_at)}
                      </TableCell>
                      <TableCell>
                        <Badge variant={statusTone(l.status)}>{titleCase(l.status)}</Badge>
                      </TableCell>
                      {can("licence.revoke") && (
                        <TableCell className="text-right">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() =>
                              revoke.mutate({
                                id: l.id,
                                company_id: l.company_id,
                                status: l.status === "active" ? "revoked" : "active",
                              })
                            }
                          >
                            {l.status === "active" ? "Revoke" : "Restore"}
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
