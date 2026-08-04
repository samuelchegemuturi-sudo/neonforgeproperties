import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";

export type ThemeMode = "light" | "dark" | "system";
export type Accent = "indigo" | "violet" | "emerald" | "blue" | "amber" | "rose" | "slate";
export type Radius = "sharp" | "medium" | "round";
export type FontChoice = "inter" | "grotesk" | "plex" | "mono";

export type ThemeState = {
  mode: ThemeMode;
  accent: Accent;
  radius: Radius;
  font: FontChoice;
};

const DEFAULTS: ThemeState = { mode: "light", accent: "indigo", radius: "medium", font: "inter" };
const STORAGE_KEY = "makao.theme";

export const ACCENTS: { value: Accent; label: string; swatch: string }[] = [
  { value: "indigo", label: "Indigo", swatch: "oklch(0.52 0.21 274)" },
  { value: "violet", label: "Violet", swatch: "oklch(0.55 0.24 300)" },
  { value: "blue", label: "Blue", swatch: "oklch(0.55 0.2 255)" },
  { value: "emerald", label: "Emerald", swatch: "oklch(0.55 0.13 163)" },
  { value: "amber", label: "Amber", swatch: "oklch(0.68 0.16 65)" },
  { value: "rose", label: "Rose", swatch: "oklch(0.58 0.21 15)" },
  { value: "slate", label: "Slate", swatch: "oklch(0.32 0.028 264)" },
];

export const FONTS: { value: FontChoice; label: string }[] = [
  { value: "inter", label: "Inter" },
  { value: "grotesk", label: "Space Grotesk" },
  { value: "plex", label: "IBM Plex Sans" },
  { value: "mono", label: "JetBrains Mono" },
];

export const RADII: { value: Radius; label: string }[] = [
  { value: "sharp", label: "Sharp" },
  { value: "medium", label: "Medium" },
  { value: "round", label: "Rounded" },
];

type ThemeContextValue = ThemeState & {
  resolvedMode: "light" | "dark";
  setTheme: (patch: Partial<ThemeState>) => void;
  reset: () => void;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

function applyToDocument(state: ThemeState): "light" | "dark" {
  if (typeof document === "undefined") return "light";
  const root = document.documentElement;
  const prefersDark =
    typeof window !== "undefined" && window.matchMedia("(prefers-color-scheme: dark)").matches;
  const resolved = state.mode === "system" ? (prefersDark ? "dark" : "light") : state.mode;
  root.classList.toggle("dark", resolved === "dark");
  root.dataset["accent"] = state.accent;
  root.dataset["radius"] = state.radius;
  root.dataset["font"] = state.font;
  root.style.colorScheme = resolved;
  return resolved;
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<ThemeState>(DEFAULTS);
  const [resolvedMode, setResolvedMode] = useState<"light" | "dark">("light");

  // Hydrate from local storage, then from the signed-in user's saved preference.
  useEffect(() => {
    let next = DEFAULTS;
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) next = { ...DEFAULTS, ...(JSON.parse(raw) as Partial<ThemeState>) };
    } catch {
      /* ignore */
    }
    setState(next);
    setResolvedMode(applyToDocument(next));

    void (async () => {
      const { data } = await supabase.auth.getSession();
      const userId = data.session?.user.id;
      if (!userId) return;
      const { data: pref } = await supabase
        .from("theme_preferences")
        .select("mode, accent, radius, font")
        .eq("user_id", userId)
        .maybeSingle();
      if (pref) {
        const merged = { ...DEFAULTS, ...pref } as ThemeState;
        setState(merged);
        setResolvedMode(applyToDocument(merged));
      }
    })();
  }, []);

  const setTheme = useCallback((patch: Partial<ThemeState>) => {
    setState((prev) => {
      const next = { ...prev, ...patch };
      setResolvedMode(applyToDocument(next));
      try {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      } catch {
        /* ignore */
      }
      void (async () => {
        const { data } = await supabase.auth.getSession();
        const userId = data.session?.user.id;
        if (!userId) return;
        await supabase.from("theme_preferences").upsert(
          { user_id: userId, ...next, updated_at: new Date().toISOString() },
          { onConflict: "user_id" },
        );
      })();
      return next;
    });
  }, []);

  const reset = useCallback(() => setTheme(DEFAULTS), [setTheme]);

  const value = useMemo(
    () => ({ ...state, resolvedMode, setTheme, reset }),
    [state, resolvedMode, setTheme, reset],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used inside ThemeProvider");
  return ctx;
}
