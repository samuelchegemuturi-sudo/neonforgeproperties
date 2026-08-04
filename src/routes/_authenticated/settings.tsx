import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { ThemePanel } from "@/components/theme-panel";
import { Switch } from "@/components/ui/switch";
import { UiCustomizer } from "@/components/ui-customizer";
import { CompanySettings } from "@/components/company-settings";

export const Route = createFileRoute("/_authenticated/settings")({
  head: () => ({
    meta: [
      { title: "Settings — Neon Forge Properties" },
      { name: "description", content: "Account, company and appearance settings." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: SettingsPage,
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
  "WhatsApp",
] as const;

function SettingsPage() {
  const { access, can } = useAuth();
  const queryClient = useQueryClient();
  const editable = can("settings.edit") || access?.profile?.is_super_admin;
  const [profileDraft, setProfileDraft] = useState({
    full_name: access?.profile?.full_name ?? "",
    position: access?.profile?.position ?? "",
    phone: access?.profile?.phone ?? "",
  });
  const [companyDraft, setCompanyDraft] = useState({
    name: access?.company?.name ?? "",
    currency: access?.company?.currency ?? "KES",
    country: access?.company?.country ?? "KE",
  });
  const [settingDraft, setSettingDraft] = useState<Record<string, string>>({});

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

  const saveProfile = useMutation({
    mutationFn: async () => {
      if (!access?.profile?.id) throw new Error("Profile unavailable");
      const { error } = await supabase
        .from("profiles")
        .update({
          full_name: profileDraft.full_name.trim(),
          position: profileDraft.position.trim(),
          phone: profileDraft.phone.trim(),
        })
        .eq("id", access.profile.id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Profile updated");
      void queryClient.invalidateQueries({ queryKey: ["access"] });
    },
    onError: (error: Error) => toast.error(error.message),
  });

  const saveCompany = useMutation({
    mutationFn: async () => {
      if (!access?.company?.id) throw new Error("Company unavailable");
      const { error } = await supabase
        .from("companies")
        .update({
          name: companyDraft.name.trim(),
          currency: companyDraft.currency.trim().toUpperCase(),
          country: companyDraft.country.trim().toUpperCase(),
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

  const saveSetting = useMutation({
    mutationFn: async ({ key, value }: { key: string; value: string }) => {
      const { error } = await supabase
        .from("platform_settings")
        .update({ value })
        .eq("key", key);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Settings updated");
      void queryClient.invalidateQueries({ queryKey: ["platform-settings"] });
      void queryClient.invalidateQueries({ queryKey: ["feature-flags"] });
    },
    onError: (error: Error) => toast.error(error.message),
  });

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Appearance</CardTitle>
          <CardDescription>Saved to your profile and applied on every device.</CardDescription>
        </CardHeader>
        <CardContent>
          <ThemePanel />
          <UiCustomizer />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Company Settings</CardTitle>
          <CardDescription>Update your company name and logo.</CardDescription>
        </CardHeader>
        <CardContent>
          <CompanySettings />
        </CardContent>
      </Card>

      {access?.profile?.is_super_admin && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Features & Modules</CardTitle>
            <CardDescription>Toggle specific modules on or off for the entire platform.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {groupedSettings["Features & Modules"]?.map((setting) => (
              <div key={setting.key} className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>{setting.label}</Label>
                </div>
                <Switch
                  checked={setting.value === "true"}
                  onCheckedChange={(checked) => saveSetting.mutate({ key: setting.key, value: String(checked) })}
                />
              </div>
            ))}
            {!groupedSettings["Features & Modules"]?.length && (
              <div className="text-sm text-muted-foreground">No feature flags available.</div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
