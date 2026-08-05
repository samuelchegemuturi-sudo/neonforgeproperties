import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { CheckCircle2, FileKey, ShieldAlert, XCircle, Search, Download, Users, KeyRound, Building2, Server, Trash2, Copy, Plus, ShieldCheck, Ban } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { adminCreateCompany, adminResetTemporaryPassword, adminDeleteCompany, sendEmailFn } from "@/lib/platform.functions";
import { COMPANY_TYPES, companyTypeLabel, shortDate, statusTone, titleCase } from "@/lib/platform";
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export const Route = createFileRoute("/_authenticated/companies")({
  head: () => ({
    meta: [
      { title: "Companies — Neon Forge Properties" },
      { name: "description", content: "Landlords, agencies and every company on the Neon Forge Properties platform." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: CompaniesPage,
});

type CompanyRow = {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  company_type: string;
  status: string;
  activation_status: string;
  verification_status: string;
  currency: string;
  created_at: string;
};

function CompaniesPage() {
  const { can } = useAuth();
  const queryClient = useQueryClient();
  const sendEmail = useServerFn(sendEmailFn);
  const [typeFilter, setTypeFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);
  const [credentials, setCredentials] = useState<{ email: string; temporaryPassword: string } | null>(
    null,
  );

  const { data: companies, isLoading } = useQuery({
    queryKey: ["companies"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("companies")
        .select(
          "id, name, email, phone, company_type, status, activation_status, verification_status, currency, created_at",
        )
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as CompanyRow[];
    },
  });

  const createFn = useServerFn(adminCreateCompany);
  const createCompany = useMutation({
    mutationFn: (input: {
      name: string;
      company_type: string;
      email: string;
      phone: string;
      owner_name: string;
    }) => createFn({ data: input }),
    onSuccess: async (result, variables) => {
      setCredentials({ email: result.email, temporaryPassword: result.temporaryPassword });
      setOpen(false);
      void queryClient.invalidateQueries({ queryKey: ["companies"] });
      toast.success("Company registered");
      
      try {
        const emailRes = await sendEmail({
          data: {
            to: result.email,
            subject: 'Welcome to Neon Forge Properties - Company Admin Account',
            htmlContent: `
              <h1>Welcome to Neon Forge Properties!</h1>
              <p>Hello ${variables.owner_name},</p>
              <p>Your company <strong>${variables.name}</strong> has been registered. You can log in as the owner using this email address and the following temporary password:</p>
              <p><strong>${result.temporaryPassword}</strong></p>
              <p>Please log in and change your password immediately.</p>
            `
          }
        });
        if (emailRes.success) {
          toast.success("Welcome email sent to " + result.email);
        } else {
          toast.error("Welcome email failed: " + emailRes.error);
        }
      } catch (err: any) {
        toast.error("Welcome email fetch failed: " + err.message);
      }
    },
    onError: (error: Error) => toast.error(error.message),
  });

  const updateCompany = useMutation({
    mutationFn: async ({ id, patch }: { id: string; patch: Partial<CompanyRow> }) => {
      const { error } = await supabase.from("companies").update(patch).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["companies"] });
      toast.success("Company updated");
    },
    onError: (error: Error) => toast.error(error.message),
  });

  const generateLicence = useMutation({
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

  const resetPasswordFn = useServerFn(adminResetTemporaryPassword);
  const resetPassword = useMutation({
    mutationFn: (email: string) => resetPasswordFn({ data: { email } }),
    onSuccess: async (result, email) => {
      setCredentials({ email, temporaryPassword: result.temporaryPassword });
      toast.success("Temporary password generated");
      
      try {
        const emailRes = await sendEmail({
          data: {
            to: email,
            subject: 'Your Password Has Been Reset',
            htmlContent: `
              <h1>Password Reset</h1>
              <p>Your temporary password is: <strong>${result.temporaryPassword}</strong></p>
              <p>Please log in and change your password immediately.</p>
            `
          }
        });
        if (emailRes.success) {
          toast.success("Email sent to " + email);
        } else {
          toast.error("Email failed: " + emailRes.error);
        }
      } catch (err: any) {
        toast.error("Email fetch failed: " + err.message);
      }
    },
    onError: (error: Error) => toast.error(error.message),
  });

  const deleteCompanyFn = useServerFn(adminDeleteCompany);
  const deleteCompany = useMutation({
    mutationFn: async (id: string) => {
      // Clean up KYC documents if any
      const { data: files } = await supabase.storage.from("kyc_documents").list(id);
      if (files && files.length > 0) {
        await supabase.storage.from("kyc_documents").remove(files.map((f) => `${id}/${f.name}`));
      }
      
      await deleteCompanyFn({ data: { targetCompanyId: id } });
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["companies"] });
      toast.success("Company and KYC data deleted");
    },
    onError: (error: Error) => toast.error(error.message),
  });

  const rows = (companies ?? []).filter((c) => {
    if (typeFilter !== "all" && c.company_type !== typeFilter) return false;
    if (statusFilter !== "all" && c.activation_status !== statusFilter) return false;
    if (search && !`${c.name} ${c.email ?? ""}`.toLowerCase().includes(search.toLowerCase()))
      return false;
    return true;
  });

  const stats = [
    { label: "Companies", value: companies?.length ?? 0 },
    { label: "Active", value: (companies ?? []).filter((c) => c.activation_status === "active").length },
    {
      label: "Pending activation",
      value: (companies ?? []).filter((c) => c.activation_status === "pending_activation").length,
    },
    { label: "Verified", value: (companies ?? []).filter((c) => c.verification_status === "verified").length },
  ];

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Companies</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Every landlord, agency and organisation subscribing to Neon Forge Properties.
          </p>
        </div>
        {can("companies.create") && (
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="size-4" /> Register company
              </Button>
            </DialogTrigger>
            <DialogContent>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  const form = new FormData(e.currentTarget);
                  createCompany.mutate({
                    name: String(form.get("name") ?? ""),
                    company_type: String(form.get("company_type") ?? "individual_landlord"),
                    email: String(form.get("email") ?? ""),
                    phone: String(form.get("phone") ?? ""),
                    owner_name: String(form.get("owner_name") ?? ""),
                  });
                }}
              >
                <DialogHeader>
                  <DialogTitle>Register a company</DialogTitle>
                  <DialogDescription>
                    Creates the company, an owner login with a temporary password, and the default
                    role set.
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-3 py-4">
                  <div className="grid gap-1.5">
                    <Label htmlFor="name">Company name</Label>
                    <Input id="name" name="name" required placeholder="ABC Property Agency" />
                  </div>
                  <div className="grid gap-1.5">
                    <Label htmlFor="company_type">Company type</Label>
                    <Select name="company_type" defaultValue="individual_landlord">
                      <SelectTrigger id="company_type">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {COMPANY_TYPES.map((t) => (
                          <SelectItem key={t.value} value={t.value}>
                            {t.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid gap-1.5">
                    <Label htmlFor="owner_name">Owner full name</Label>
                    <Input id="owner_name" name="owner_name" placeholder="Jane Wanjiru" />
                  </div>
                  <div className="grid gap-1.5">
                    <Label htmlFor="email">Owner email</Label>
                    <Input id="email" name="email" type="email" required />
                  </div>
                  <div className="grid gap-1.5">
                    <Label htmlFor="phone">Phone</Label>
                    <Input id="phone" name="phone" placeholder="+254…" />
                  </div>
                </div>
                <DialogFooter>
                  <Button type="submit" disabled={createCompany.isPending}>
                    {createCompany.isPending ? "Creating…" : "Create company"}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        )}
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((s) => (
          <Card key={s.label}>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">{s.label}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-semibold tracking-tight">{s.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {credentials && (
        <Card className="border-primary/40">
          <CardHeader>
            <CardTitle className="text-base">Temporary credentials</CardTitle>
            <CardDescription>
              Shown once. Share securely — the owner should change it on first sign-in.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-wrap items-center gap-3">
            <code className="rounded bg-muted px-2 py-1 text-sm">{credentials.email}</code>
            <code className="rounded bg-muted px-2 py-1 text-sm">{credentials.temporaryPassword}</code>
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                void navigator.clipboard.writeText(
                  `${credentials.email} / ${credentials.temporaryPassword}`,
                );
                toast.success("Copied");
              }}
            >
              <Copy className="size-4" /> Copy
            </Button>
            <Button size="sm" variant="ghost" onClick={() => setCredentials(null)}>
              Dismiss
            </Button>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader className="gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <Input
              placeholder="Search company or email…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-9 max-w-xs"
            />
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="h-9 w-56">
                <SelectValue placeholder="All types" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All types</SelectItem>
                {COMPANY_TYPES.map((t) => (
                  <SelectItem key={t.value} value={t.value}>
                    {t.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="h-9 w-48">
                <SelectValue placeholder="All statuses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All statuses</SelectItem>
                <SelectItem value="pending_activation">Pending activation</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="suspended">Suspended</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent className="px-0">
          {isLoading ? (
            <div className="space-y-2 px-6">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
          ) : rows.length === 0 ? (
            <div className="px-6 py-12 text-center text-sm text-muted-foreground">
              <Building2 className="mx-auto mb-3 size-6" />
              No companies match these filters.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Company</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Activation</TableHead>
                    <TableHead>Verification</TableHead>
                    <TableHead>Joined</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {rows.map((c) => (
                    <TableRow key={c.id}>
                      <TableCell>
                        <p className="font-medium">{c.name}</p>
                        <p className="text-xs text-muted-foreground">{c.email ?? "—"}</p>
                      </TableCell>
                      <TableCell className="text-sm">
                        {can("companies.suspend") ? (
                          <Select
                            value={c.company_type}
                            onValueChange={(val) =>
                              updateCompany.mutate({ id: c.id, patch: { company_type: val } })
                            }
                            disabled={updateCompany.isPending}
                          >
                            <SelectTrigger className="h-8 w-[180px] text-xs">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {COMPANY_TYPES.map((t) => (
                                <SelectItem key={t.value} value={t.value} className="text-xs">
                                  {t.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        ) : (
                          companyTypeLabel(c.company_type)
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge variant={statusTone(c.activation_status)}>
                          {titleCase(c.activation_status)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={statusTone(c.verification_status)}>
                          {titleCase(c.verification_status)}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {shortDate(c.created_at)}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1">
                          {can("companies.verify") && c.verification_status !== "verified" && (
                            <Button
                              size="sm"
                              variant="ghost"
                              title="Verify company"
                              onClick={() =>
                                updateCompany.mutate({
                                  id: c.id,
                                  patch: {
                                    verification_status: "verified",
                                    verified_at: new Date().toISOString(),
                                  } as Partial<CompanyRow>,
                                })
                              }
                            >
                              <ShieldCheck className="size-4" />
                            </Button>
                          )}
                          {can("licence.generate") && c.activation_status !== "active" && (
                            <Button
                              size="sm"
                              variant="ghost"
                              title="Generate licence & activate"
                              onClick={() => generateLicence.mutate(c.id)}
                            >
                              <KeyRound className="size-4" />
                            </Button>
                          )}
                          {can("companies.suspend") && (
                            <Button
                              size="sm"
                              variant="ghost"
                              title={c.status === "suspended" ? "Reinstate" : "Suspend"}
                              onClick={() =>
                                updateCompany.mutate({
                                  id: c.id,
                                  patch: {
                                    status: c.status === "suspended" ? "active" : "suspended",
                                    activation_status:
                                      c.status === "suspended" ? "active" : "suspended",
                                  },
                                })
                              }
                            >
                              {c.status === "suspended" ? (
                                <CheckCircle2 className="size-4" />
                              ) : (
                                <Ban className="size-4" />
                              )}
                            </Button>
                          )}
                          {can("support.reset_password") && c.email && (
                            <Button
                              size="sm"
                              variant="ghost"
                              title="Reset Password"
                              onClick={() => {
                                if (confirm("Generate a new temporary password for this company owner?")) {
                                  resetPassword.mutate(c.email!);
                                }
                              }}
                              disabled={resetPassword.isPending}
                            >
                              <KeyRound className="size-4 text-blue-500" />
                            </Button>
                          )}
                          {can("companies.delete") && (
                            <Button
                              size="sm"
                              variant="ghost"
                              className="text-destructive hover:bg-destructive/10"
                              title="Delete company and KYC data"
                              onClick={() => {
                                if (confirm("Are you sure you want to permanently delete this company and all its KYC data?")) {
                                  deleteCompany.mutate(c.id);
                                }
                              }}
                              disabled={deleteCompany.isPending}
                            >
                              <Trash2 className="size-4" />
                            </Button>
                          )}
                        </div>
                      </TableCell>
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
