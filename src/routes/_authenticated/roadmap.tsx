import { createFileRoute } from "@tanstack/react-router";
import { CheckCircle2, CircleDashed, ClipboardList, Layers3 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  PRODUCT_VOLUMES,
  STATUS_LABELS,
  STATUS_TONES,
  getVolumeSummary,
} from "@/lib/volume-catalog";

export const Route = createFileRoute("/_authenticated/roadmap")({
  head: () => ({ meta: [{ title: "Product Roadmap — MAKAO" }] }),
  component: RoadmapPage,
});

function RoadmapPage() {
  const summary = getVolumeSummary();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Product Roadmap</h1>
        <p className="text-muted-foreground">
          Coverage map for the 17-volume Neon Forge Properties master plan.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <SummaryCard label="Volumes" value={summary.totalVolumes} icon={Layers3} />
        <SummaryCard label="Available" value={summary.available} icon={CheckCircle2} />
        <SummaryCard label="Partial" value={summary.partial} icon={CircleDashed} />
        <SummaryCard label="Missing / Planned" value={summary.planned} icon={ClipboardList} />
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        {PRODUCT_VOLUMES.map((volume) => (
          <Card key={volume.id}>
            <CardHeader>
              <div className="flex items-start justify-between gap-3">
                <div>
                  <CardTitle>
                    Volume {volume.id}: {volume.title}
                  </CardTitle>
                  <CardDescription>{volume.summary}</CardDescription>
                </div>
                <Badge variant="outline">{volume.portal}</Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {volume.capabilities.map((capability) => (
                  <div key={capability.name} className="rounded-lg border p-3">
                    <div className="mb-1 flex items-center justify-between gap-2">
                      <p className="font-medium">{capability.name}</p>
                      <Badge variant={STATUS_TONES[capability.status]}>
                        {STATUS_LABELS[capability.status]}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">{capability.note}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

function SummaryCard({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value: number;
  icon: typeof Layers3;
}) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{label}</CardTitle>
        <Icon className="size-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
      </CardContent>
    </Card>
  );
}
