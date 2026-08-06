import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { DatabaseBackup, Download, AlertTriangle, Loader2, CheckCircle, RefreshCw } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";

export const Route = createFileRoute("/_authenticated/backup")({
  head: () => ({ meta: [{ title: "Backup & Restore — MAKAO" }] }),
  component: BackupPage,
});

type ExportTable = {
  name: string;
  table: string;
  description: string;
};

const EXPORT_TABLES: ExportTable[] = [
  { name: "Companies", table: "companies", description: "All company records, types, and status" },
  { name: "Properties", table: "properties", description: "Property metadata, addresses, and coordinates" },
  { name: "Units", table: "units", description: "Unit inventory, rent amounts, and status" },
  { name: "Tenants (Profiles)", table: "profiles", description: "All user and tenant profiles" },
  { name: "Leases", table: "leases", description: "All lease agreements and terms" },
  { name: "Audit Logs", table: "audit_logs", description: "Full event history" },
];

async function exportTableAsCSV(tableName: string, companyId: string | null | undefined, isSuper: boolean) {
  let q = supabase.from(tableName as any).select("*").limit(5000);
  if (!isSuper && companyId && ["properties", "units", "leases", "audit_logs"].includes(tableName)) {
    q = q.eq("company_id", companyId);
  } else if (!isSuper && companyId && tableName === "profiles") {
    q = q.eq("company_id", companyId);
  }
  const { data, error } = await q;
  if (error) throw error;
  if (!data || data.length === 0) throw new Error("No data to export");

  const headers = Object.keys(data[0]);
  const rows = data.map((row: any) =>
    headers.map((h) => {
      const val = row[h];
      if (val == null) return "";
      const str = typeof val === "object" ? JSON.stringify(val) : String(val);
      return str.includes(",") || str.includes('"') || str.includes("\n")
        ? `"${str.replace(/"/g, '""')}"`
        : str;
    }).join(",")
  );
  const csv = [headers.join(","), ...rows].join("\n");
  return csv;
}

function downloadBlob(content: string, filename: string, type = "text/csv;charset=utf-8;") {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

function BackupPage() {
  const { access } = useAuth();
  const isSuper = access?.profile?.is_super_admin ?? false;
  const companyId = access?.profile?.company_id;
  const [exporting, setExporting] = useState<string | null>(null);
  const [done, setDone] = useState<Set<string>>(new Set());

  const handleExport = async (tbl: ExportTable) => {
    setExporting(tbl.table);
    try {
      const csv = await exportTableAsCSV(tbl.table, companyId, isSuper);
      const ts = new Date().toISOString().slice(0, 10);
      downloadBlob(csv, `makao_${tbl.table}_${ts}.csv`);
      setDone((prev) => new Set(prev).add(tbl.table));
      toast.success(`${tbl.name} exported as CSV`);
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setExporting(null);
    }
  };

  const handleExportAll = async () => {
    setExporting("__all__");
    const results: string[] = [];
    for (const tbl of EXPORT_TABLES) {
      try {
        const csv = await exportTableAsCSV(tbl.table, companyId, isSuper);
        results.push(`\n\n=== ${tbl.name.toUpperCase()} ===\n${csv}`);
        setDone((prev) => new Set(prev).add(tbl.table));
      } catch {
        // skip empty tables
      }
    }
    if (results.length === 0) {
      toast.error("No data to export");
      setExporting(null);
      return;
    }
    const ts = new Date().toISOString().slice(0, 10);
    downloadBlob(results.join(""), `makao_full_export_${ts}.txt`, "text/plain;charset=utf-8;");
    toast.success("Full export downloaded");
    setExporting(null);
  };

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
          <DatabaseBackup className="size-5 text-primary" /> Backup & Restore
        </h1>
        <p className="text-muted-foreground text-sm mt-1">
          Export your data as CSV for offline backup or migration.
        </p>
      </div>

      {/* Warning */}
      <div className="flex items-start gap-3 rounded-xl border border-amber-500/30 bg-amber-500/10 p-4">
        <AlertTriangle className="size-4 text-amber-500 mt-0.5 shrink-0" />
        <div>
          <p className="text-sm font-medium text-amber-400">Data Export Only</p>
          <p className="text-xs text-amber-400/80 mt-0.5">
            This exports a CSV snapshot of your data. Restore / import is performed by your system administrator.
            Full database backups are managed automatically by Supabase at the infrastructure level.
          </p>
        </div>
      </div>

      <div className="flex justify-end">
        <Button
          id="export-all-btn"
          variant="outline"
          onClick={handleExportAll}
          disabled={!!exporting}
        >
          {exporting === "__all__" ? (
            <Loader2 className="size-4 mr-2 animate-spin" />
          ) : (
            <RefreshCw className="size-4 mr-2" />
          )}
          Export All Tables
        </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {EXPORT_TABLES.map((tbl) => (
          <Card key={tbl.table} className="flex flex-col">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm">{tbl.name}</CardTitle>
                {done.has(tbl.table) && (
                  <Badge variant="default" className="gap-1 text-[10px]">
                    <CheckCircle className="size-3" /> Exported
                  </Badge>
                )}
              </div>
              <CardDescription className="text-xs">{tbl.description}</CardDescription>
            </CardHeader>
            <CardContent className="mt-auto pt-2">
              <Button
                id={`export-${tbl.table}-btn`}
                size="sm"
                variant="outline"
                className="w-full"
                onClick={() => handleExport(tbl)}
                disabled={!!exporting}
              >
                {exporting === tbl.table ? (
                  <Loader2 className="size-3.5 mr-2 animate-spin" />
                ) : (
                  <Download className="size-3.5 mr-2" />
                )}
                Export {tbl.name} CSV
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
