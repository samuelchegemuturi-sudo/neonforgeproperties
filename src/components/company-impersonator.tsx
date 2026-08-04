import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAppStore } from "@/lib/store";
import { useAuth } from "@/lib/auth";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export function CompanyImpersonator() {
  const { access } = useAuth();
  const { impersonatedCompanyId, setImpersonatedCompanyId } = useAppStore();

  const { data: companies } = useQuery({
    queryKey: ["all-companies"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("companies")
        .select("id, name")
        .order("name");
      if (error) throw error;
      return data;
    },
    enabled: access?.profile?.is_super_admin === true,
  });

  if (!access?.profile?.is_super_admin) return null;

  return (
    <div className="flex items-center gap-2">
      <Select
        value={impersonatedCompanyId ?? "none"}
        onValueChange={(value) => setImpersonatedCompanyId(value === "none" ? null : value)}
      >
        <SelectTrigger className="w-[180px] h-8 text-xs bg-background/50 border-primary/20 hover:bg-background/80 transition-colors">
          <SelectValue placeholder="Impersonate Company..." />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="none" className="text-muted-foreground italic">Stop Impersonating</SelectItem>
          {companies?.map((company) => (
            <SelectItem key={company.id} value={company.id}>
              {company.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
