import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Plug, Save, CheckCircle2, AlertCircle } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export const Route = createFileRoute('/_authenticated/integrations')({
  component: IntegrationsComponent,
});

type PlatformSetting = {
  key: string;
  label: string;
  category: string;
  value: string | number | boolean | null;
};

const MARKETPLACE_CATEGORIES = [
  "Payment Gateways",
  "Smart Meters",
  "SMS Providers",
  "Email Providers",
  "Maps",
  "Tax Services",
  "Storage",
  "AI Services",
  "Analytics",
  "Identity Verification",
  "API Keys",
  "Feature Flags",
] as const;

function IntegrationsComponent() {
  const { access, can } = useAuth();
  const queryClient = useQueryClient();
  const editable = can("system.settings") || access?.profile?.is_super_admin;
  
  const [settingDraft, setSettingDraft] = useState<Record<string, string>>({});
  const [activeTab, setActiveTab] = useState<string>("Payment Gateways");

  const { data: platformSettings = [] } = useQuery({
    queryKey: ["platform-settings"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("platform_settings")
        .select("key, value, label, category")
        .order("category")
        .order("key");
      if (error) throw error;
      return data as PlatformSetting[];
    },
  });

  const groupedSettings = useMemo(() => {
    return platformSettings.reduce<Record<string, PlatformSetting[]>>((acc, item) => {
      const bucket = item.category || "General";
      acc[bucket] ??= [];
      acc[bucket].push(item);
      return acc;
    }, {});
  }, [platformSettings]);

  const saveSetting = useMutation({
    mutationFn: async (settingsToSave: { key: string; value: string | number | boolean }[]) => {
      // Upsert multiple settings at once
      const { error } = await supabase.from("platform_settings").upsert(
        settingsToSave.map(s => ({
          key: s.key,
          value: s.value,
          // We don't update label/category here, assuming they exist or defaults
        })) as any[],
        { onConflict: 'key' }
      );
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Settings saved successfully");
      void queryClient.invalidateQueries({ queryKey: ["platform-settings"] });
    },
    onError: (error: Error) => toast.error(error.message),
  });

  const handleSaveCategory = (category: string) => {
    const rows = groupedSettings[category] || [];
    const toSave = rows.map(row => {
      const raw = settingDraft[row.key] ?? String(row.value ?? "");
      const parsed = raw === "true" ? true : raw === "false" ? false : raw;
      return { key: row.key, value: parsed };
    });
    
    // Check if any draft actually changed to avoid empty saves
    const changed = toSave.filter(s => {
      const original = rows.find(r => r.key === s.key);
      return String(original?.value ?? "") !== String(s.value);
    });

    if (changed.length > 0) {
      saveSetting.mutate(changed);
    } else {
      toast.info("No changes to save");
    }
  };

  return (
    <div className="mx-auto max-w-6xl space-y-6 p-6">
      <div className="flex items-center gap-3">
        <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
          <Plug className="size-5" />
        </div>
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Integration Marketplace</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Configure APIs, smart meters, payment gateways, and third-party services in one place.
          </p>
        </div>
      </div>

      <div className="flex flex-col space-y-8 lg:flex-row lg:space-x-12 lg:space-y-0">
        <aside className="lg:w-1/4">
          <nav className="flex space-x-2 lg:flex-col lg:space-x-0 lg:space-y-1 overflow-x-auto pb-4 lg:pb-0">
            {MARKETPLACE_CATEGORIES.map((category) => (
              <button
                key={category}
                onClick={() => setActiveTab(category)}
                className={`flex items-center justify-between rounded-md px-3 py-2 text-sm font-medium transition-colors whitespace-nowrap ${
                  activeTab === category
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                }`}
              >
                {category}
                {groupedSettings[category]?.some(s => s.value && s.value !== 'false' && !String(s.value).includes('placeholder')) ? (
                  <CheckCircle2 className="size-4 text-green-500" />
                ) : (
                  <Badge variant="secondary" className="text-[10px] ml-2">Config</Badge>
                )}
              </button>
            ))}
          </nav>
        </aside>
        
        <div className="flex-1">
          <Card>
            <CardHeader>
              <CardTitle>{activeTab}</CardTitle>
              <CardDescription>
                Configure credentials and preferences for {activeTab.toLowerCase()}.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {groupedSettings[activeTab] && groupedSettings[activeTab].length > 0 ? (
                <div className="space-y-4">
                  {groupedSettings[activeTab].map((row) => (
                    <div key={row.key} className="grid gap-2">
                      <Label htmlFor={row.key}>{row.label}</Label>
                      <Input
                        id={row.key}
                        type={row.key.includes('secret') || row.key.includes('password') || row.key.includes('token') ? 'password' : 'text'}
                        placeholder={`Enter ${row.label}`}
                        defaultValue={String(row.value ?? "")}
                        readOnly={!editable}
                        onChange={(e) =>
                          setSettingDraft((draft) => ({ ...draft, [row.key]: e.target.value }))
                        }
                        className={String(row.value).includes('placeholder') ? "border-amber-500/50" : ""}
                      />
                      {String(row.value).includes('placeholder') && (
                        <p className="text-xs text-amber-500 flex items-center gap-1">
                          <AlertCircle className="size-3" /> Needs configuration
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <Plug className="size-12 text-muted-foreground/50 mb-4" />
                  <h3 className="text-lg font-semibold">No settings found</h3>
                  <p className="text-sm text-muted-foreground max-w-sm mt-1">
                    There are no configuration keys available for {activeTab} yet.
                  </p>
                </div>
              )}
            </CardContent>
            {groupedSettings[activeTab] && groupedSettings[activeTab].length > 0 && editable && (
              <CardFooter className="border-t px-6 py-4">
                <Button 
                  onClick={() => handleSaveCategory(activeTab)} 
                  disabled={saveSetting.isPending}
                  className="ml-auto"
                >
                  <Save className="mr-2 size-4" />
                  Save Changes
                </Button>
              </CardFooter>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}
