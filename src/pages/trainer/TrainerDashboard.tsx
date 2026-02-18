import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { trainerApi } from "@/lib/api";
import { useTrainerAuth } from "@/contexts/TrainerAuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Dumbbell, TrendingUp, CalendarCheck, ChevronRight } from "lucide-react";

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

export default function TrainerDashboard() {
  const { trainer } = useTrainerAuth();
  const { data, isLoading } = useQuery({
    queryKey: ["trainer", "reports", "dashboard"],
    queryFn: () => trainerApi.get<DashboardData>("/reports/dashboard"),
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-48 bg-muted rounded animate-pulse" />
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i}><CardContent className="p-6 h-24 animate-pulse" /></Card>
          ))}
        </div>
      </div>
    );
  }

  const stats = data ?? {
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
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-2xl font-display font-bold">Hi, {trainer?.name?.split(" ")[0] ?? "Trainer"}</h1>
        <p className="text-muted-foreground text-sm mt-0.5">
          {trainer?.gym?.name ?? "Personal trainer"} · {trainer?.specialty ?? "Trainer"}
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Members</CardTitle>
            <Users className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{stats.total_members}</p>
            <p className="text-xs text-muted-foreground">{stats.active_members} active</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Workouts</CardTitle>
            <Dumbbell className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{stats.total_workouts}</p>
            <p className="text-xs text-muted-foreground">{stats.active_workouts} active plans</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Revenue (month)</CardTitle>
            <TrendingUp className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{typeof stats.revenue_this_month === "number" ? stats.revenue_this_month.toFixed(0) : "0"}</p>
            <p className="text-xs text-muted-foreground">Total: {stats.total_revenue?.toFixed(0) ?? "0"}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Check-ins today</CardTitle>
            <CalendarCheck className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{stats.check_ins_today}</p>
            <p className="text-xs text-muted-foreground">Members checked in</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Link to="/trainer/members">
          <Card className="h-full transition-colors hover:bg-muted/50">
            <CardContent className="p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                  <Users className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="font-medium">Manage members</p>
                  <p className="text-sm text-muted-foreground">Add, edit, set portal password</p>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-muted-foreground" />
            </CardContent>
          </Card>
        </Link>
        <Link to="/trainer/workouts">
          <Card className="h-full transition-colors hover:bg-muted/50">
            <CardContent className="p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                  <Dumbbell className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="font-medium">Workout plans</p>
                  <p className="text-sm text-muted-foreground">Create & assign plans</p>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-muted-foreground" />
            </CardContent>
          </Card>
        </Link>
      </div>
    </div>
  );
}
