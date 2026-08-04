import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { money, shortDate, titleCase } from "@/lib/platform";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Loader2, Printer, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/_authenticated/leases_/$leaseId/statement")({
  component: LeaseStatementPage,
});

function LeaseStatementPage() {
  const { leaseId } = Route.useParams();

  const { data: lease, isLoading } = useQuery({
    queryKey: ["lease-statement", leaseId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("leases")
        .select(`
          *,
          properties(name, company_id),
          units(unit_number),
          profiles:tenant_id(full_name, email, phone)
        `)
        .eq("id", leaseId)
        .single();
      if (error) throw error;
      
      let companyData = null;
      if (data.properties?.company_id) {
        const { data: c } = await supabase
          .from("companies")
          .select("name, email, phone")
          .eq("id", data.properties.company_id)
          .single();
        companyData = c;
      }
        
      return { ...data, company: companyData };
    },
  });

  if (isLoading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <Loader2 className="size-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!lease) {
    return <div className="p-8 text-center text-muted-foreground">Lease not found.</div>;
  }

  const t = lease.profiles as any;
  const p = lease.properties as any;
  const u = lease.units as any;
  const c = lease.company as any;

  return (
    <div className="mx-auto max-w-4xl space-y-8 p-6 print:p-0">
      <div className="flex items-center justify-between print:hidden">
        <Button variant="ghost" onClick={() => history.back()} className="gap-2">
          <ArrowLeft className="size-4" /> Back to Leases
        </Button>
        <Button onClick={() => window.print()} className="gap-2">
          <Printer className="size-4" /> Print Statement
        </Button>
      </div>

      <div className="space-y-6">
        <div className="flex items-start justify-between border-b pb-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{c?.name || "Property Management"}</h1>
            <p className="text-muted-foreground">{c?.email}</p>
            <p className="text-muted-foreground">{c?.phone}</p>
          </div>
          <div className="text-right">
            <h2 className="text-2xl font-semibold text-muted-foreground">Lease Statement</h2>
            <p className="font-mono text-sm mt-1">{lease.id.split('-')[0].toUpperCase()}</p>
            <p className="text-sm text-muted-foreground mt-1">Generated {shortDate(new Date().toISOString())}</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-8">
          <div className="space-y-1">
            <p className="text-sm font-medium text-muted-foreground">Tenant</p>
            <p className="font-medium">{t?.full_name}</p>
            <p className="text-sm text-muted-foreground">{t?.email}</p>
            <p className="text-sm text-muted-foreground">{t?.phone || "—"}</p>
          </div>
          <div className="space-y-1 text-right">
            <p className="text-sm font-medium text-muted-foreground">Property & Unit</p>
            <p className="font-medium">{p?.name}</p>
            <p className="text-sm text-muted-foreground">Unit {u?.unit_number}</p>
          </div>
        </div>

        <Card className="shadow-none border-border">
          <CardHeader className="bg-muted/30 border-b">
            <CardTitle className="text-base">Lease Terms</CardTitle>
            <CardDescription>Status: {titleCase(lease.status)}</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead>Description</TableHead>
                  <TableHead>Start Date</TableHead>
                  <TableHead>End Date</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow className="hover:bg-transparent">
                  <TableCell className="font-medium">Monthly Rent</TableCell>
                  <TableCell>{shortDate(lease.start_date)}</TableCell>
                  <TableCell>{lease.end_date ? shortDate(lease.end_date) : "Indefinite"}</TableCell>
                  <TableCell className="text-right">{money(lease.rent)}</TableCell>
                </TableRow>
                <TableRow className="hover:bg-transparent border-none">
                  <TableCell className="font-medium">Security Deposit</TableCell>
                  <TableCell>—</TableCell>
                  <TableCell>—</TableCell>
                  <TableCell className="text-right">{money(lease.deposit)}</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
