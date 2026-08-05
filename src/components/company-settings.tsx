import { useState } from "react";
import { useAuth } from "@/lib/auth";
import { supabase } from "@/integrations/supabase/client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export function CompanySettings() {
  const { access } = useAuth();
  const queryClient = useQueryClient();
  const [isUploading, setIsUploading] = useState(false);

  const [companyDraft, setCompanyDraft] = useState({
    name: access?.company?.name ?? "",
  });

  const saveCompany = useMutation({
    mutationFn: async () => {
      if (!access?.company?.id) throw new Error("Company unavailable");
      const { error } = await supabase
        .from("companies")
        .update({
          name: companyDraft.name.trim(),
        })
        .eq("id", access.company.id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Company settings updated");
      void queryClient.invalidateQueries({ queryKey: ["access"] });
    },
    onError: (error: Error) => toast.error(error.message),
  });

  const uploadLogo = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      if (!event.target.files || event.target.files.length === 0) return;
      const file = event.target.files[0];
      if (!file) return;
      if (!access?.company?.id) throw new Error("Company unavailable");
      const fileExt = file.name.split('.').pop();
      const filePath = `${access.company.id}/logo.${fileExt}`;

      setIsUploading(true);

      const { error: uploadError } = await supabase.storage
        .from('company_logos')
        .upload(filePath, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data } = supabase.storage
        .from('company_logos')
        .getPublicUrl(filePath);

      const { error: updateError } = await supabase
        .from('companies')
        .update({ logo_url: data.publicUrl })
        .eq('id', access.company.id);

      if (updateError) throw updateError;

      toast.success("Logo uploaded successfully");
      void queryClient.invalidateQueries({ queryKey: ["access"] });
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-6">
        <Avatar className="h-24 w-24 border">
          <AvatarImage src={(access?.company as any)?.logo_url ?? undefined} className="object-contain" />
          <AvatarFallback className="text-2xl">{access?.company?.name?.charAt(0) ?? "C"}</AvatarFallback>
        </Avatar>
        <div className="space-y-2">
          <Label htmlFor="logo-upload">Company Logo</Label>
          <Input 
            id="logo-upload" 
            type="file" 
            accept="image/*"
            disabled={isUploading}
            onChange={uploadLogo} 
            className="w-full max-w-sm"
          />
          <p className="text-xs text-muted-foreground">Recommended: Square PNG or JPG, at least 200x200px.</p>
        </div>
      </div>
      
      <div className="space-y-3">
        <Label>Company Name</Label>
        <Input 
          value={companyDraft.name}
          onChange={(e) => setCompanyDraft(prev => ({ ...prev, name: e.target.value }))}
          className="max-w-md"
        />
      </div>

      <Button onClick={() => saveCompany.mutate()} disabled={saveCompany.isPending}>
        {saveCompany.isPending ? "Saving..." : "Save Company"}
      </Button>
    </div>
  );
}
