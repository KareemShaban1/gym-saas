import { useQuery } from "@tanstack/react-query";
import { trainerApi } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Dumbbell, TrendingUp, CalendarCheck } from "lucide-react";

interface DashboardData {
  total_members: number;
  active_members: number;
  total_workouts: number;
  active_workouts: number;
  total_revenue: number;
  revenue_this_month: number;
  check_ins_today: number;
  attendance_by_hour: { hour: number; count: number }[];
}

export default function TrainerReportsPage() {
  const { data, isLoading } = useQuery({
    queryKey: ["trainer", "reports", "dashboard"],
    queryFn: () => trainerApi.get<DashboardData>("/reports/dashboard"),
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-32 bg-muted rounded animate-pulse" />
        <div className="grid gap-4 md:grid-cols-2">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i}><CardContent className="p-6 h-32 animate-pulse" /></Card>
          ))}
        </div>
      </div>
    );
  }

  const s = data ?? {
    total_members: 0,
    active_members: 0,
    total_workouts: 0,
    active_workouts: 0,
    total_revenue: 0,
    revenue_this_month: 0,
    check_ins_today: 0,
    attendance_by_hour: [],
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-display font-bold">Reports</h1>
      <p className="text-muted-foreground text-sm">Overview of your members, workouts, and activity.</p>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total members</CardTitle>
            <Users className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{s.total_members}</p>
            <p className="text-xs text-muted-foreground">{s.active_members} active</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Workout plans</CardTitle>
            <Dumbbell className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{s.total_workouts}</p>
            <p className="text-xs text-muted-foreground">{s.active_workouts} active</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Revenue (this month)</CardTitle>
            <TrendingUp className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{typeof s.revenue_this_month === "number" ? s.revenue_this_month.toFixed(0) : "0"}</p>
            <p className="text-xs text-muted-foreground">Total: {s.total_revenue?.toFixed(0) ?? "0"}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Check-ins today</CardTitle>
            <CalendarCheck className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{s.check_ins_today}</p>
            <p className="text-xs text-muted-foreground">Members at gym today</p>
          </CardContent>
        </Card>
      </div>

      {s.attendance_by_hour && s.attendance_by_hour.some((h) => h.count > 0) && (() => {
        const maxCount = Math.max(1, ...s.attendance_by_hour.map((x) => x.count));
        return (
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Today&apos;s attendance by hour</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex gap-1 items-end h-24">
                {s.attendance_by_hour.map(({ hour, count }) => {
                  const pct = Math.max(4, Math.min(100, (count / maxCount) * 100));
                  return (
                    <div
                      key={hour}
                      className="flex-1 flex flex-col items-center gap-1"
                      title={`${hour}:00 – ${count} check-ins`}
                    >
                      <div
                        className="w-full rounded-t bg-primary/60 min-h-[4px] transition-all"
                        style={{ height: `${pct}%` }}
                      />
                      <span className="text-[10px] text-muted-foreground">{hour}</span>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        );
      })()}
    </div>
  );
}
