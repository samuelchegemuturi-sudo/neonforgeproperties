import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Plus, ShieldCheck, Loader2, Trash2, Edit2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export const Route = createFileRoute("/_authenticated/roles")({
  head: () => ({
    meta: [
      { title: "Roles & Permissions — Neon Forge Properties" },
      { name: "description", content: "Create roles and edit the permission matrix." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: RolesPage,
});

type Role = { id: string; name: string; slug: string; description: string | null; is_system: boolean };
type Permission = { key: string; module: string; action: string; label: string; sort_order: number };

function RolesPage() {
  const { access, can } = useAuth();
  const companyId = access?.profile?.company_id ?? null;
  const queryClient = useQueryClient();
  const editable = can("roles.edit");
  const [open, setOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [editingRole, setEditingRole] = useState<Role | null>(null);

  const { data: roles, isLoading: rolesLoading } = useQuery({
    queryKey: ["roles", companyId],
    enabled: Boolean(companyId),
    queryFn: async () => {
      const { data, error } = await supabase
        .from("roles")
        .select("id, name, slug, description, is_system")
        .eq("company_id", companyId!)
        .order("is_system", { ascending: false })
        .order("name");
      if (error) throw error;
      return data as Role[];
    },
  });

  const { data: permissions } = useQuery({
    queryKey: ["permissions"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("permissions")
        .select("key, module, action, label, sort_order")
        .order("sort_order");
      if (error) throw error;
      return data as Permission[];
    },
  });

  const { data: rolePerms } = useQuery({
    queryKey: ["role-permissions", companyId],
    enabled: Boolean(roles?.length),
    queryFn: async () => {
      const { data, error } = await supabase
        .from("role_permissions")
        .select("role_id, permission_key")
        .in("role_id", (roles ?? []).map((r) => r.id));
      if (error) throw error;
      return data as { role_id: string; permission_key: string }[];
    },
  });

  const matrix = useMemo(() => {
    const map = new Map<string, Set<string>>();
    (rolePerms ?? []).forEach((rp) => {
      if (!map.has(rp.role_id)) map.set(rp.role_id, new Set());
      map.get(rp.role_id)!.add(rp.permission_key);
    });
    return map;
  }, [rolePerms]);

  const modules = useMemo(() => {
    const grouped = new Map<string, Permission[]>();
    (permissions ?? []).forEach((p) => {
      if (!grouped.has(p.module)) grouped.set(p.module, []);
      grouped.get(p.module)!.push(p);
    });
    return Array.from(grouped.entries());
  }, [permissions]);

  const toggle = useMutation({
    mutationFn: async (input: { roleId: string; key: string; granted: boolean }) => {
      if (input.granted) {
        const { error } = await supabase
          .from("role_permissions")
          .delete()
          .eq("role_id", input.roleId)
          .eq("permission_key", input.key);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("role_permissions")
          .insert({ role_id: input.roleId, permission_key: input.key });
        if (error) throw error;
      }
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["role-permissions", companyId] });
      void queryClient.invalidateQueries({ queryKey: ["access"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const createRole = useMutation({
    mutationFn: async (input: { name: string; description: string }) => {
      const slug = input.name
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, "_")
        .replace(/^_|_$/g, "");
      const { error } = await supabase
        .from("roles")
        .insert({ company_id: companyId, name: input.name, slug, description: input.description });
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Role created");
      setOpen(false);
      void queryClient.invalidateQueries({ queryKey: ["roles", companyId] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const deleteRole = useMutation({
    mutationFn: async (roleId: string) => {
      const { error } = await supabase.from("roles").delete().eq("id", roleId);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Role deleted");
      void queryClient.invalidateQueries({ queryKey: ["roles", companyId] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const updateRoleName = useMutation({
    mutationFn: async (input: { id: string; name: string }) => {
      const { error } = await supabase
        .from("roles")
        .update({ name: input.name })
        .eq("id", input.id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Role name updated");
      setEditOpen(false);
      void queryClient.invalidateQueries({ queryKey: ["roles", companyId] });
      void queryClient.invalidateQueries({ queryKey: ["access"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Roles & permissions</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Unlimited roles per company. Tick a box to grant a permission — it applies immediately.
          </p>
        </div>
        {can("roles.create") && (
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="size-4" /> New role
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create a custom role</DialogTitle>
                <DialogDescription>
                  For example Regional Manager, Estate Supervisor or Finance Assistant.
                </DialogDescription>
              </DialogHeader>
              <form
                id="role-form"
                className="space-y-4"
                onSubmit={(e) => {
                  e.preventDefault();
                  const fd = new FormData(e.currentTarget);
                  createRole.mutate({
                    name: String(fd.get("name")),
                    description: String(fd.get("description") ?? ""),
                  });
                }}
              >
                <div className="space-y-1.5">
                  <Label htmlFor="role-name">Role name</Label>
                  <Input id="role-name" name="name" required />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="role-desc">Description</Label>
                  <Textarea id="role-desc" name="description" rows={3} />
                </div>
              </form>
              <DialogFooter>
                <Button type="submit" form="role-form" disabled={createRole.isPending}>
                  {createRole.isPending && <Loader2 className="size-4 animate-spin" />} Create role
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {rolesLoading &&
          Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-28 rounded-xl" />)}
        {(roles ?? []).map((role) => (
          <Card key={role.id} className="shadow-[var(--shadow-card)]">
            <CardHeader className="pb-2">
              <div className="flex items-start justify-between gap-2">
                <CardTitle className="text-base">{role.name}</CardTitle>
                <div className="flex items-center gap-1">
                  {editable && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => {
                        setEditingRole(role);
                        setEditOpen(true);
                      }}
                    >
                      <Edit2 className="size-3.5" />
                    </Button>
                  )}
                  {role.is_system ? (
                    <Badge variant="secondary" className="ml-1">System</Badge>
                  ) : (
                    can("roles.delete") && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-destructive"
                        aria-label={`Delete ${role.name}`}
                        onClick={() => deleteRole.mutate(role.id)}
                      >
                        <Trash2 className="size-3.5" />
                      </Button>
                    )
                  )}
                </div>
              </div>
              <CardDescription className="line-clamp-2">
                {role.description ?? "Custom role"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground">
                {matrix.get(role.id)?.size ?? 0} permissions
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Rename Role</DialogTitle>
            <DialogDescription>
              Change the display name of this role.
            </DialogDescription>
          </DialogHeader>
          <form
            id="rename-role-form"
            className="space-y-4"
            onSubmit={(e) => {
              e.preventDefault();
              const fd = new FormData(e.currentTarget);
              if (editingRole) {
                updateRoleName.mutate({
                  id: editingRole.id,
                  name: String(fd.get("name")),
                });
              }
            }}
          >
            <div className="space-y-1.5">
              <Label htmlFor="rename-name">Role name</Label>
              <Input id="rename-name" name="name" defaultValue={editingRole?.name} required />
            </div>
          </form>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditOpen(false)}>Cancel</Button>
            <Button type="submit" form="rename-role-form" disabled={updateRoleName.isPending}>
              {updateRoleName.isPending && <Loader2 className="mr-2 size-4 animate-spin" />} Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <ShieldCheck className="size-4" /> Permission matrix
          </CardTitle>
          <CardDescription>
            {editable
              ? "Changes save instantly."
              : "Read-only — you do not have permission to edit roles."}
          </CardDescription>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="min-w-56">Permission</TableHead>
                {(roles ?? []).map((r) => (
                  <TableHead key={r.id} className="text-center whitespace-nowrap">
                    {r.name}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {modules.map(([moduleName, perms]) => (
                <>
                  <TableRow key={moduleName} className="bg-muted/50 hover:bg-muted/50">
                    <TableCell
                      colSpan={(roles?.length ?? 0) + 1}
                      className="text-xs font-semibold uppercase tracking-wide text-muted-foreground"
                    >
                      {moduleName}
                    </TableCell>
                  </TableRow>
                  {perms.map((p) => (
                    <TableRow key={p.key}>
                      <TableCell className="text-sm">{p.label}</TableCell>
                      {(roles ?? []).map((r) => {
                        const granted = matrix.get(r.id)?.has(p.key) ?? false;
                        return (
                          <TableCell key={r.id} className="text-center">
                            <Checkbox
                              checked={granted}
                              disabled={!editable || toggle.isPending}
                              aria-label={`${p.label} for ${r.name}`}
                              onCheckedChange={() =>
                                toggle.mutate({ roleId: r.id, key: p.key, granted })
                              }
                            />
                          </TableCell>
                        );
                      })}
                    </TableRow>
                  ))}
                </>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
