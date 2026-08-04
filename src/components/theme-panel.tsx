import { Monitor, Moon, Sun, Palette, Check } from "lucide-react";
import { ACCENTS, FONTS, RADII, useTheme, type ThemeMode } from "@/lib/theme";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

const MODES: { value: ThemeMode; label: string; icon: typeof Sun }[] = [
  { value: "light", label: "Light", icon: Sun },
  { value: "dark", label: "Dark", icon: Moon },
  { value: "system", label: "System", icon: Monitor },
];

export function ThemePanel() {
  const { mode, accent, radius, font, setTheme, reset } = useTheme();

  return (
    <div className="space-y-5">
      <div className="space-y-2">
        <Label className="text-xs uppercase tracking-wide text-muted-foreground">Mode</Label>
        <div className="grid grid-cols-3 gap-2">
          {MODES.map((m) => (
            <Button
              key={m.value}
              type="button"
              variant={mode === m.value ? "default" : "outline"}
              size="sm"
              onClick={() => setTheme({ mode: m.value })}
              className="justify-center gap-1.5"
            >
              <m.icon className="size-3.5" />
              {m.label}
            </Button>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <Label className="text-xs uppercase tracking-wide text-muted-foreground">Accent</Label>
        <div className="flex flex-wrap gap-2">
          {ACCENTS.map((a) => (
            <button
              key={a.value}
              type="button"
              aria-label={a.label}
              onClick={() => setTheme({ accent: a.value })}
              style={{ backgroundColor: a.swatch }}
              className={cn(
                "flex size-8 items-center justify-center rounded-full ring-offset-2 ring-offset-background transition",
                accent === a.value ? "ring-2 ring-ring" : "hover:scale-105",
              )}
            >
              {accent === a.value && <Check className="size-4 text-white" />}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <Label className="text-xs uppercase tracking-wide text-muted-foreground">Corners</Label>
        <div className="grid grid-cols-3 gap-2">
          {RADII.map((r) => (
            <Button
              key={r.value}
              type="button"
              variant={radius === r.value ? "default" : "outline"}
              size="sm"
              onClick={() => setTheme({ radius: r.value })}
            >
              {r.label}
            </Button>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <Label className="text-xs uppercase tracking-wide text-muted-foreground">Typeface</Label>
        <div className="grid grid-cols-2 gap-2">
          {FONTS.map((f) => (
            <Button
              key={f.value}
              type="button"
              variant={font === f.value ? "default" : "outline"}
              size="sm"
              onClick={() => setTheme({ font: f.value })}
            >
              {f.label}
            </Button>
          ))}
        </div>
      </div>

      <Button type="button" variant="ghost" size="sm" className="w-full" onClick={reset}>
        Reset to defaults
      </Button>
    </div>
  );
}

export function ThemeButton() {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" aria-label="Customize theme">
          <Palette className="size-4" />
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-72">
        <p className="mb-4 text-sm font-medium">Customize appearance</p>
        <ThemePanel />
      </PopoverContent>
    </Popover>
  );
}
