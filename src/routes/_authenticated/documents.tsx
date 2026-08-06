import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { FileText, Upload, Download, Trash2, FolderOpen, Plus, AlertCircle } from "lucide-react";
import { useState, useRef } from "react";
import { toast } from "sonner";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";

export const Route = createFileRoute("/_authenticated/documents")({
  head: () => ({ meta: [{ title: "Documents — MAKAO" }] }),
  component: DocumentsPage,
});

const DOC_CATEGORIES = ["Lease Agreement", "ID Document", "KYC", "Title Deed", "Inspection Report", "Other"] as const;

function DocumentsPage() {
  const { access } = useAuth();
  const companyId = access?.profile?.company_id;
  const [search, setSearch] = useState("");
  const [catFilter, setCatFilter] = useState("all");
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { data: docs = [], isLoading, refetch } = useQuery({
    queryKey: ["documents", companyId],
    queryFn: async () => {
      if (!companyId) return [];
      // List from Supabase storage bucket "documents" under company folder
      const { data } = await supabase.storage
        .from("kyc_documents")
        .list(`${companyId}`, { limit: 100, sortBy: { column: "created_at", order: "desc" } });
      return (data ?? []) as any[];
    },
    enabled: !!companyId,
  });

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !companyId) return;
    setUploading(true);
    try {
      const path = `${companyId}/${Date.now()}_${file.name}`;
      const { error } = await supabase.storage.from("kyc_documents").upload(path, file, { upsert: false });
      if (error) throw error;
      toast.success(`"${file.name}" uploaded`);
      void refetch();
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleDownload = async (name: string) => {
    const { data } = await supabase.storage
      .from("kyc_documents")
      .createSignedUrl(`${companyId}/${name}`, 60);
    if (data?.signedUrl) window.open(data.signedUrl, "_blank");
    else toast.error("Failed to generate download link");
  };

  const handleDelete = async (name: string) => {
    if (!confirm(`Delete "${name}"?`)) return;
    const { error } = await supabase.storage.from("kyc_documents").remove([`${companyId}/${name}`]);
    if (error) toast.error(error.message);
    else { toast.success("Deleted"); void refetch(); }
  };

  const ext = (name: string) => name.split(".").pop()?.toLowerCase() ?? "";
  const iconColor = (name: string) => {
    const e = ext(name);
    if (["pdf"].includes(e)) return "text-red-400";
    if (["jpg", "jpeg", "png", "webp"].includes(e)) return "text-blue-400";
    if (["doc", "docx"].includes(e)) return "text-indigo-400";
    return "text-muted-foreground";
  };

  const filtered = docs.filter((d: any) => {
    if (search && !d.name?.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <FolderOpen className="size-5 text-primary" /> Documents
          </h1>
          <p className="text-muted-foreground text-sm mt-1">Secure document storage — leases, IDs, title deeds and more.</p>
        </div>
        <div className="flex items-center gap-2">
          <input
            ref={fileInputRef}
            type="file"
            className="hidden"
            id="doc-upload-input"
            onChange={handleUpload}
          />
          <Button
            size="sm"
            id="upload-doc-btn"
            disabled={uploading}
            onClick={() => fileInputRef.current?.click()}
          >
            <Upload className="size-4 mr-1.5" />
            {uploading ? "Uploading…" : "Upload"}
          </Button>
        </div>
      </div>

      <div className="flex flex-wrap gap-3">
        <Input
          id="docs-search"
          placeholder="Search file name…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="h-9 max-w-xs"
        />
        <span className="ml-auto text-xs text-muted-foreground self-center">{filtered.length} files</span>
      </div>

      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-8 text-center text-sm text-muted-foreground">Loading documents…</div>
          ) : filtered.length === 0 ? (
            <div className="p-16 text-center text-muted-foreground">
              <FileText className="size-10 mx-auto mb-3 opacity-20" />
              <p className="text-sm">No documents uploaded yet.</p>
              <p className="text-xs mt-1 text-muted-foreground">Click "Upload" to add your first file.</p>
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead className="bg-muted/40">
                <tr>
                  <th className="p-3 text-left font-medium text-muted-foreground">File</th>
                  <th className="p-3 text-center font-medium text-muted-foreground">Type</th>
                  <th className="p-3 text-right font-medium text-muted-foreground">Size</th>
                  <th className="p-3 text-left font-medium text-muted-foreground">Uploaded</th>
                  <th className="p-3 text-right font-medium text-muted-foreground">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {filtered.map((doc: any) => (
                  <tr key={doc.name} className="hover:bg-muted/20">
                    <td className="p-3">
                      <div className="flex items-center gap-2.5">
                        <FileText className={`size-4 shrink-0 ${iconColor(doc.name)}`} />
                        <span className="font-medium truncate max-w-[240px]">{doc.name}</span>
                      </div>
                    </td>
                    <td className="p-3 text-center">
                      <Badge variant="outline" className="text-[10px] uppercase">{ext(doc.name) || "—"}</Badge>
                    </td>
                    <td className="p-3 text-right text-muted-foreground text-xs">
                      {doc.metadata?.size ? `${(doc.metadata.size / 1024).toFixed(1)} KB` : "—"}
                    </td>
                    <td className="p-3 text-muted-foreground text-xs">
                      {doc.created_at ? format(new Date(doc.created_at), "dd MMM yyyy") : "—"}
                    </td>
                    <td className="p-3 text-right">
                      <div className="flex justify-end gap-1">
                        <Button size="icon" variant="ghost" className="size-7" title="Download" onClick={() => handleDownload(doc.name)}>
                          <Download className="size-3.5" />
                        </Button>
                        <Button size="icon" variant="ghost" className="size-7 text-destructive hover:bg-destructive/10" title="Delete" onClick={() => handleDelete(doc.name)}>
                          <Trash2 className="size-3.5" />
                        </Button>
                      </div>
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
