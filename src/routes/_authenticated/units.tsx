import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { DoorOpen } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { money, statusTone, titleCase } from "@/lib/platform";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
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

export const Route = createFileRoute("/_authenticated/units")({
  head: () => ({
    meta: [
      { title: "Units — Neon Forge Properties" },
      { name: "description", content: "Every unit across your portfolio, with occupancy status." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: UnitsPage,
});

type UnitRow = {
  id: string;
  unit_number: string;
  status: string;
  rent: number;
  properties: { name: string } | null;
  unit_types: { label: string } | null;
};

function UnitsPage() {
  const { access, can } = useAuth();
  const queryClient = useQueryClient();
  const currency = access?.company?.currency ?? "KES";
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");

  const { data: units, isLoading } = useQuery({
    queryKey: ["units"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("units")
        .select("id, unit_number, status, rent, properties(name), unit_types(label)")
        .order("unit_number");
      if (error) throw error;
      return data as unknown as UnitRow[];
    },
  });

  const toggle = useMutation({
    mutationFn: async (unit: UnitRow) => {
      const { error } = await supabase
        .from("units")
        .update({ status: unit.status === "occupied" ? "vacant" : "occupied" })
        .eq("id", unit.id);
      if (error) throw error;
    },
    onSuccess: () => {
      void queryClient.invalidateQueries();
      toast.success("Unit updated");
    },
    onError: (error: Error) => toast.error(error.message),
  });

  const rows = (units ?? []).filter((u) => {
    if (status !== "all" && u.status !== status) return false;
    if (
      search &&
      !`${u.unit_number} ${u.properties?.name ?? ""}`.toLowerCase().includes(search.toLowerCase())
    )
      return false;
    return true;
  });

  const occupied = (units ?? []).filter((u) => u.status === "occupied").length;
  const total = units?.length ?? 0;

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Units</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {total} units · {occupied} occupied ·{" "}
          {total ? Math.round((occupied / total) * 100) : 0}% occupancy
        </p>
      </div>

      <Card>
        <CardHeader className="flex flex-row flex-wrap items-center gap-2 space-y-0">
          <Input
            placeholder="Search unit or property…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-9 max-w-xs"
          />
          <Select value={status} onValueChange={setStatus}>
            <SelectTrigger className="h-9 w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All statuses</SelectItem>
              <SelectItem value="vacant">Vacant</SelectItem>
              <SelectItem value="occupied">Occupied</SelectItem>
            </SelectContent>
          </Select>
          <CardTitle className="sr-only">Unit list</CardTitle>
        </CardHeader>
        <CardContent className="px-0">
          {isLoading ? (
            <div className="space-y-2 px-6">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
          ) : !rows.length ? (
            <p className="px-6 py-12 text-center text-sm text-muted-foreground">
              <DoorOpen className="mx-auto mb-3 size-6" />
              No units yet — add unit types to a property and they are generated for you.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Unit</TableHead>
                    <TableHead>Property</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Rent</TableHead>
                    <TableHead>Status</TableHead>
                    {can("unit.edit") && <TableHead className="text-right">Actions</TableHead>}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {rows.map((u) => (
                    <TableRow key={u.id}>
                      <TableCell className="font-medium">{u.unit_number}</TableCell>
                      <TableCell>{u.properties?.name ?? "—"}</TableCell>
                      <TableCell>{u.unit_types?.label ?? "—"}</TableCell>
                      <TableCell>{money(u.rent, currency)}</TableCell>
                      <TableCell>
                        <Badge variant={statusTone(u.status)}>{titleCase(u.status)}</Badge>
                      </TableCell>
                      {can("unit.edit") && (
                        <TableCell className="text-right">
                          <Button size="sm" variant="ghost" onClick={() => toggle.mutate(u)}>
                            Mark {u.status === "occupied" ? "vacant" : "occupied"}
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
