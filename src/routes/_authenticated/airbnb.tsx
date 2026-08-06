import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, addMonths, subMonths, isToday } from "date-fns";
import { ChevronLeft, ChevronRight, CalendarDays, Users, TrendingUp, Percent, BedDouble, Star } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";

export const Route = createFileRoute("/_authenticated/airbnb")({
  component: AirbnbPage,
});

// ── Mock booking data shape — replace with real Supabase queries ─────────────
type Booking = {
  id: string;
  unit_id: string;
  unit_name: string;
  guest_name: string;
  check_in: string;
  check_out: string;
  amount: number;
  status: "confirmed" | "checked_in" | "checked_out" | "cancelled";
};

function AirbnbPage() {
  const { access } = useAuth();
  const companyId = access?.company?.id;
  const [currentMonth, setCurrentMonth] = useState(new Date());

  // Fetch leases used as bookings (in a real BnB deployment these would be a "bookings" table)
  const { data: units = [] } = useQuery({
    queryKey: ["bnb-units", companyId],
    queryFn: async () => {
      if (!companyId) return [];
      const { data } = await supabase
        .from("units" as any)
        .select("id, unit_number, properties(name, id)")
        .limit(50);
      return (data ?? []) as any[];
    },
    enabled: !!companyId,
  });

  const { data: leases = [] } = useQuery({
    queryKey: ["bnb-leases", companyId],
    queryFn: async () => {
      if (!companyId) return [];
      const { data } = await supabase
        .from("leases")
        .select("id, start_date, end_date, status, rent, units(id, unit_number), profiles:tenant_id(full_name)")
        .order("start_date", { ascending: false })
        .limit(100);
      return (data ?? []) as any[];
    },
    enabled: !!companyId,
  });

  // Calendar grid
  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd });

  // Calculate RevPAR
  const totalUnits = units.length || 1;
  const totalRevenue = leases
    .filter((l: any) => l.status === "active")
    .reduce((s: number, l: any) => s + Number(l.rent ?? 0), 0);
  const occupiedUnits = new Set(leases.filter((l: any) => l.status === "active").map((l: any) => l.units?.id)).size;
  const occupancyRate = Math.round((occupiedUnits / totalUnits) * 100);
  const revPAR = totalUnits > 0 ? totalRevenue / totalUnits : 0;
  const adr = occupiedUnits > 0 ? totalRevenue / occupiedUnits : 0;

  // Check if a day has any bookings
  const getBookingsForDay = (day: Date) =>
    leases.filter((l: any) => {
      if (!l.start_date) return false;
      const start = new Date(l.start_date);
      const end = l.end_date ? new Date(l.end_date) : new Date();
      return day >= start && day <= end;
    });

  return (
    <div className="flex flex-col gap-6 p-6">
      {/* ── Header ── */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">BnB Host Dashboard</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Manage bookings, track occupancy and revenue performance.
        </p>
      </div>

      {/* ── KPI Cards ── */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Occupancy Rate</CardTitle>
            <Percent className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{occupancyRate}%</div>
            <div className="mt-1 h-1.5 w-full rounded-full bg-muted overflow-hidden">
              <div
                className="h-full rounded-full bg-primary transition-all"
                style={{ width: `${occupancyRate}%` }}
              />
            </div>
            <p className="text-xs text-muted-foreground mt-1">{occupiedUnits} of {totalUnits} units occupied</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">RevPAR</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-500">
              KSH {revPAR.toLocaleString("en-KE", { maximumFractionDigits: 0 })}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Revenue per available room</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">ADR</CardTitle>
            <Star className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              KSH {adr.toLocaleString("en-KE", { maximumFractionDigits: 0 })}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Average daily rate</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Units</CardTitle>
            <BedDouble className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{totalUnits}</div>
            <p className="text-xs text-muted-foreground mt-1">Rooms / units listed</p>
          </CardContent>
        </Card>
      </div>

      {/* ── Booking Calendar ── */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Booking Calendar</CardTitle>
              <CardDescription>{format(currentMonth, "MMMM yyyy")}</CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="icon"
                onClick={() => setCurrentMonth((m) => subMonths(m, 1))}
                id="prev-month-btn"
              >
                <ChevronLeft className="size-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentMonth(new Date())}
                id="today-btn"
              >
                Today
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={() => setCurrentMonth((m) => addMonths(m, 1))}
                id="next-month-btn"
              >
                <ChevronRight className="size-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Day headers */}
          <div className="grid grid-cols-7 gap-px mb-1">
            {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
              <div key={d} className="text-center text-xs font-medium text-muted-foreground py-1">
                {d}
              </div>
            ))}
          </div>
          {/* Calendar grid */}
          <div className="grid grid-cols-7 gap-px bg-muted/20 border border-border/30 rounded-lg overflow-hidden">
            {/* Empty cells for first week offset */}
            {Array.from({ length: monthStart.getDay() }).map((_, i) => (
              <div key={`empty-${i}`} className="bg-background/50 min-h-[80px] p-1" />
            ))}
            {days.map((day) => {
              const dayBookings = getBookingsForDay(day);
              const hasBookings = dayBookings.length > 0;
              return (
                <div
                  key={day.toISOString()}
                  className={`bg-background min-h-[80px] p-1.5 transition-colors ${
                    isToday(day) ? "ring-2 ring-inset ring-primary" : ""
                  }`}
                >
                  <span
                    className={`text-xs font-medium block mb-1 ${
                      isToday(day)
                        ? "text-primary"
                        : "text-muted-foreground"
                    }`}
                  >
                    {format(day, "d")}
                  </span>
                  {dayBookings.slice(0, 2).map((b: any, i: number) => (
                    <div
                      key={b.id + i}
                      className="rounded text-[9px] px-1 py-0.5 mb-0.5 truncate bg-indigo-100 text-indigo-800 dark:bg-indigo-900/40 dark:text-indigo-300"
                    >
                      {(b.profiles as any)?.full_name ?? "Guest"} · Rm {b.units?.unit_number}
                    </div>
                  ))}
                  {dayBookings.length > 2 && (
                    <p className="text-[9px] text-muted-foreground">+{dayBookings.length - 2} more</p>
                  )}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* ── Recent Bookings Table ── */}
      <Card>
        <CardHeader>
          <CardTitle>Active Bookings / Leases</CardTitle>
          <CardDescription>Current guests and occupancy.</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <table className="w-full text-sm">
            <thead className="bg-muted/40">
              <tr>
                <th className="p-3 text-left font-medium text-muted-foreground">Guest</th>
                <th className="p-3 text-left font-medium text-muted-foreground">Room / Unit</th>
                <th className="p-3 text-left font-medium text-muted-foreground">Check-in</th>
                <th className="p-3 text-left font-medium text-muted-foreground">Check-out</th>
                <th className="p-3 text-right font-medium text-muted-foreground">Rate / mo</th>
                <th className="p-3 text-center font-medium text-muted-foreground">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {leases.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-muted-foreground">
                    <BedDouble className="size-8 mx-auto mb-2 opacity-30" />
                    No bookings found.
                  </td>
                </tr>
              ) : (
                leases.slice(0, 10).map((l: any) => (
                  <tr key={l.id} className="hover:bg-muted/20">
                    <td className="p-3 font-medium">{(l.profiles as any)?.full_name ?? "—"}</td>
                    <td className="p-3 text-muted-foreground">
                      {(l.units as any)?.unit_number ? `Unit ${(l.units as any).unit_number}` : "—"}
                    </td>
                    <td className="p-3">{l.start_date ? format(new Date(l.start_date), "dd MMM yyyy") : "—"}</td>
                    <td className="p-3">{l.end_date ? format(new Date(l.end_date), "dd MMM yyyy") : "Ongoing"}</td>
                    <td className="p-3 text-right font-semibold">
                      KSH {Number(l.rent ?? 0).toLocaleString("en-KE")}
                    </td>
                    <td className="p-3 text-center">
                      <Badge variant={l.status === "active" ? "default" : "secondary"}>
                        {l.status}
                      </Badge>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
}
