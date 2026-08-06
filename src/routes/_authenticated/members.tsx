import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { Users, Plus, BadgeCheck, Clock, AlertCircle, Phone, Mail } from "lucide-react";
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";

export const Route = createFileRoute("/_authenticated/members")({
  head: () => ({ meta: [{ title: "Members — MAKAO" }] }),
  component: MembersPage,
});

function MembersPage() {
  const { access } = useAuth();
  const companyId = access?.profile?.company_id;
  const [search, setSearch] = useState("");

  const { data: members = [], isLoading } = useQuery({
    queryKey: ["members", companyId],
    queryFn: async () => {
      if (!companyId) return [];
      // Members are profiles associated with this company
      const { data } = await supabase
        .from("profiles" as any)
        .select("id, full_name, email, phone, position, status, created_at")
        .eq("company_id", companyId)
        .order("full_name");
      return (data ?? []) as any[];
    },
    enabled: !!companyId,
  });

  const { data: roles = [] } = useQuery({
    queryKey: ["member-roles", companyId],
    queryFn: async () => {
      if (!companyId) return [];
      const { data } = await supabase
        .from("user_roles" as any)
        .select("user_id, roles(name, slug)")
        .eq("company_id", companyId);
      return (data ?? []) as any[];
    },
    enabled: !!companyId,
  });

  const roleMap: Record<string, string[]> = {};
  roles.forEach((ur: any) => {
    if (!roleMap[ur.user_id]) roleMap[ur.user_id] = [];
    const rName = (ur.roles as any)?.name;
    if (rName) roleMap[ur.user_id].push(rName);
  });

  const filtered = members.filter((m: any) => {
    if (!search) return true;
    return `${m.full_name ?? ""} ${m.email ?? ""} ${m.position ?? ""}`.toLowerCase().includes(search.toLowerCase());
  });

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <Users className="size-5 text-primary" /> Members
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            All registered members of this company — SACCO / cooperative members.
          </p>
        </div>
        <Button size="sm" id="add-member-btn"><Plus className="size-4 mr-1.5" /> Add Member</Button>
      </div>

      {/* Summary cards */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Members</CardTitle>
            <Users className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent><div className="text-3xl font-bold">{members.length}</div></CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active</CardTitle>
            <BadgeCheck className="size-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-500">
              {members.filter((m: any) => m.status !== "suspended").length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Suspended</CardTitle>
            <AlertCircle className="size-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-red-500">
              {members.filter((m: any) => m.status === "suspended").length}
            </div>
          </CardContent>
        </Card>
      </div>

      <Input
        id="members-search"
        placeholder="Search by name, email or position…"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="max-w-sm h-9"
      />

      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-8 text-center text-sm text-muted-foreground">Loading members…</div>
          ) : filtered.length === 0 ? (
            <div className="p-12 text-center text-muted-foreground">
              <Users className="size-8 mx-auto mb-2 opacity-30" />
              <p className="text-sm">No members found.</p>
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead className="bg-muted/40">
                <tr>
                  <th className="p-3 text-left font-medium text-muted-foreground">Member</th>
                  <th className="p-3 text-left font-medium text-muted-foreground">Contact</th>
                  <th className="p-3 text-left font-medium text-muted-foreground">Position / Role</th>
                  <th className="p-3 text-center font-medium text-muted-foreground">Status</th>
                  <th className="p-3 text-left font-medium text-muted-foreground">Joined</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {filtered.map((m: any) => (
                  <tr key={m.id} className="hover:bg-muted/20">
                    <td className="p-3">
                      <div className="flex items-center gap-2.5">
                        <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary/15 text-primary text-xs font-bold">
                          {(m.full_name ?? "?")[0]?.toUpperCase()}
                        </div>
                        <span className="font-medium">{m.full_name ?? "—"}</span>
                      </div>
                    </td>
                    <td className="p-3 text-xs text-muted-foreground">
                      {m.email && <p className="flex items-center gap-1"><Mail className="size-3" />{m.email}</p>}
                      {m.phone && <p className="flex items-center gap-1 mt-0.5"><Phone className="size-3" />{m.phone}</p>}
                    </td>
                    <td className="p-3">
                      <p className="text-sm">{m.position ?? "—"}</p>
                      {roleMap[m.id]?.map((r: string) => (
                        <Badge key={r} variant="outline" className="text-[10px] mr-1 mt-0.5">{r}</Badge>
                      ))}
                    </td>
                    <td className="p-3 text-center">
                      <Badge variant={m.status === "suspended" ? "destructive" : "default"}>
                        {m.status ?? "active"}
                      </Badge>
                    </td>
                    <td className="p-3 text-xs text-muted-foreground">
                      {m.created_at ? format(new Date(m.created_at), "dd MMM yyyy") : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
