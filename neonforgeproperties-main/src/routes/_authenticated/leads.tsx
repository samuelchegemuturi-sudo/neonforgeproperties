import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { toast } from "sonner";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { shortDate } from "@/lib/platform";
import { CheckCircle2, UserPlus } from "lucide-react";
import { Link } from "@tanstack/react-router";

export const Route = createFileRoute("/_authenticated/leads")({
  head: () => ({
    meta: [{ title: "Demo Requests (Leads)" }],
  }),
  component: LeadsPage,
});

function LeadsPage() {
  const { access } = useAuth();
  const isSuper = access?.profile?.is_super_admin;
  const queryClient = useQueryClient();

  const { data: leads, isLoading } = useQuery({
    queryKey: ["leads"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("companies")
        .select("*")
        .eq("activation_status", "pending_demo")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!isSuper,
  });

  const markContacted = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("companies")
        .update({ activation_status: "demo_contacted" })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Lead marked as contacted");
      queryClient.invalidateQueries({ queryKey: ["leads"] });
    },
  });

  if (!isSuper) {
    return (
      <div className="flex h-40 items-center justify-center">
        <p className="text-muted-foreground">You do not have permission to view leads.</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Demo Requests</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          People who have requested a demo via the landing page.
        </p>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle>Incoming Leads</CardTitle>
          <CardDescription>Review and manage demo requests</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="h-20 animate-pulse rounded-md bg-muted" />
          ) : leads?.length === 0 ? (
            <div className="flex h-32 flex-col items-center justify-center gap-2 text-muted-foreground border rounded-md border-dashed">
              <CheckCircle2 className="size-8 opacity-20" />
              <p>No pending demo requests</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Company</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>Units</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {leads?.map((lead) => (
                  <TableRow key={lead.id}>
                    <TableCell className="whitespace-nowrap">
                      {shortDate(lead.created_at)}
                    </TableCell>
                    <TableCell className="font-medium">{lead.name}</TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="font-medium">
                          {(lead.kyc_details as any)?.full_name || "Unknown"}
                        </span>
                        <a href={`mailto:${lead.email}`} className="text-sm text-muted-foreground hover:underline">
                          {lead.email}
                        </a>
                        <a href={`tel:${lead.phone}`} className="text-sm text-muted-foreground hover:underline">
                          {lead.phone}
                        </a>
                      </div>
                    </TableCell>
                    <TableCell>
                      {(lead.kyc_details as any)?.estimated_units || "Not specified"}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="bg-amber-50 text-amber-600 border-amber-200">
                        Pending Demo
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => markContacted.mutate(lead.id)}
                        >
                          Mark Contacted
                        </Button>
                        <Button size="sm" asChild>
                          <Link to="/companies">
                            <UserPlus className="size-4 mr-2" />
                            Register
                          </Link>
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
