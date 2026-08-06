import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useRef } from "react";
import { Map as MapIcon, Navigation } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";

export const Route = createFileRoute("/_authenticated/map")({
  head: () => ({ meta: [{ title: "Map View — MAKAO" }] }),
  component: MapPage,
});

function MapPage() {
  const { access } = useAuth();
  const companyId = access?.profile?.company_id;
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);

  const { data: properties = [] } = useQuery({
    queryKey: ["map-properties", companyId],
    queryFn: async () => {
      if (!companyId) return [];
      const { data } = await supabase
        .from("properties" as any)
        .select("id, name, address, latitude, longitude, status")
        .eq("company_id", companyId)
        .not("latitude", "is", null)
        .not("longitude", "is", null);
      return (data ?? []) as any[];
    },
    enabled: !!companyId,
  });

  // Dynamically load Leaflet
  useEffect(() => {
    if (!mapRef.current) return;

    const loadLeaflet = async () => {
      if (mapInstanceRef.current) return; // already initialized

      // Load CSS
      if (!document.getElementById("leaflet-css")) {
        const link = document.createElement("link");
        link.id = "leaflet-css";
        link.rel = "stylesheet";
        link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
        document.head.appendChild(link);
      }

      // Load JS
      if (!(window as any).L) {
        await new Promise<void>((resolve) => {
          const script = document.createElement("script");
          script.src = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js";
          script.onload = () => resolve();
          document.head.appendChild(script);
        });
      }

      const L = (window as any).L;
      if (!L || !mapRef.current) return;

      // Default center: Nairobi
      const map = L.map(mapRef.current).setView([-1.286389, 36.817223], 12);
      mapInstanceRef.current = map;

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 19,
      }).addTo(map);

      // Markers
      properties.forEach((p: any) => {
        if (!p.latitude || !p.longitude) return;
        const marker = L.marker([Number(p.latitude), Number(p.longitude)]).addTo(map);
        marker.bindPopup(`
          <div style="min-width:140px">
            <p style="font-weight:700;margin:0 0 4px">${p.name}</p>
            <p style="font-size:12px;color:#6b7280;margin:0">${p.address ?? ""}</p>
            <span style="font-size:11px;background:#6c63ff22;color:#6c63ff;padding:2px 8px;border-radius:99px;display:inline-block;margin-top:6px">${p.status ?? "active"}</span>
          </div>
        `);
      });

      // Auto-fit to markers
      if (properties.length > 0) {
        const coords = properties
          .filter((p: any) => p.latitude && p.longitude)
          .map((p: any) => [Number(p.latitude), Number(p.longitude)]);
        if (coords.length > 0) {
          map.fitBounds(coords, { padding: [40, 40] });
        }
      }
    };

    loadLeaflet();

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [properties]);

  const withCoords = properties.filter((p: any) => p.latitude && p.longitude);
  const noCoords = properties.filter((p: any) => !p.latitude || !p.longitude);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <MapIcon className="size-5 text-primary" /> Map View
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            All your properties plotted on an OpenStreetMap.
          </p>
        </div>
        <div className="flex gap-2 text-sm">
          <Badge variant="default">{withCoords.length} mapped</Badge>
          {noCoords.length > 0 && (
            <Badge variant="secondary">{noCoords.length} missing coords</Badge>
          )}
        </div>
      </div>

      {/* Map container */}
      <Card className="overflow-hidden">
        <div ref={mapRef} className="w-full" style={{ height: "520px" }} id="map-container" />
      </Card>

      {noCoords.length > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <Navigation className="size-4 text-amber-500" /> Properties without GPS coordinates
            </CardTitle>
            <CardDescription>
              Edit these properties and add latitude/longitude to display them on the map.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {noCoords.map((p: any) => (
                <Badge key={p.id} variant="outline" className="text-xs">{p.name}</Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
