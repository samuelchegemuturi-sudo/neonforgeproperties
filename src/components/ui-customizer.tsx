import { useAppStore, BACKGROUNDS } from "@/lib/store";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

export function UiCustomizer() {
  const { backgroundImage, setBackgroundImage, blurIntensity, setBlurIntensity, glassOpacity, setGlassOpacity } = useAppStore();

  const blurs = [
    { value: 'backdrop-blur-sm', label: 'Light' },
    { value: 'backdrop-blur-md', label: 'Medium' },
    { value: 'backdrop-blur-xl', label: 'Heavy' },
    { value: 'backdrop-blur-2xl', label: 'Extreme' },
    { value: 'backdrop-blur-3xl', label: 'Max' },
  ];

  const opacities = [
    { value: 'bg-background/20', label: '20%' },
    { value: 'bg-background/40', label: '40%' },
    { value: 'bg-background/60', label: '60%' },
    { value: 'bg-background/80', label: '80%' },
  ];

  return (
    <div className="space-y-6 pt-4 border-t border-border mt-4">
      <div className="space-y-3">
        <Label>Background Image</Label>
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          {BACKGROUNDS.map((bg) => (
            <button
              key={bg.id}
              onClick={() => setBackgroundImage(bg.url)}
              className={`relative overflow-hidden rounded-lg aspect-video border-2 transition-all ${backgroundImage === bg.url ? 'border-primary' : 'border-transparent hover:border-primary/50'}`}
            >
              {bg.url ? (
                <img src={bg.url} alt={bg.label} className="object-cover w-full h-full" />
              ) : (
                <div className="w-full h-full bg-muted flex items-center justify-center text-xs text-muted-foreground">{bg.label}</div>
              )}
            </button>
          ))}
        </div>
      </div>

      <div className="grid sm:grid-cols-2 gap-6">
        <div className="space-y-3">
          <Label>Glass Frosting (Blur)</Label>
          <div className="flex flex-wrap gap-2">
            {blurs.map((blur) => (
              <Button
                key={blur.value}
                variant={blurIntensity === blur.value ? "default" : "outline"}
                size="sm"
                onClick={() => setBlurIntensity(blur.value)}
              >
                {blur.label}
              </Button>
            ))}
          </div>
        </div>
        <div className="space-y-3">
          <Label>Glass Opacity</Label>
          <div className="flex flex-wrap gap-2">
            {opacities.map((op) => (
              <Button
                key={op.value}
                variant={glassOpacity === op.value ? "default" : "outline"}
                size="sm"
                onClick={() => setGlassOpacity(op.value)}
              >
                {op.label}
              </Button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
