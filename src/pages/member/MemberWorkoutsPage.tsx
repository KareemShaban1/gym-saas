import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { memberApi } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ChevronRight, Dumbbell } from "lucide-react";

interface WorkoutPlan {
  id: number;
  name: string;
  status: string;
  days?: { dayLabel: string; exercises: unknown[] }[];
  trainer?: { id: number; name: string };
}

export default function MemberWorkoutsPage() {
  const { data: workouts = [], isLoading } = useQuery({
    queryKey: ["member", "workouts"],
    queryFn: () => memberApi.get<WorkoutPlan[]>("/workouts"),
  });

  return (
    <div className="p-4 space-y-6 max-w-lg mx-auto">
      <h1 className="text-xl font-display font-bold">My workouts</h1>
      <p className="text-sm text-muted-foreground">Your exercise plans and progress.</p>

      {isLoading ? (
        <p className="text-muted-foreground">Loading…</p>
      ) : workouts.length === 0 ? (
        <Card>
          <CardContent className="p-6 text-center">
            <Dumbbell className="w-12 h-12 text-muted-foreground mx-auto mb-3 opacity-50" />
            <p className="text-sm text-muted-foreground">No workout plans yet.</p>
            <p className="text-xs text-muted-foreground mt-1">Your trainer can assign you a plan.</p>
          </CardContent>
        </Card>
      ) : (
        <ul className="space-y-3">
          {workouts.map((w) => (
            <li key={w.id}>
              <Link to={`/member/workouts/${w.id}`}>
                <Card className="transition-colors hover:bg-muted/50 active:scale-[0.99]">
                  <CardContent className="p-4 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                      <Dumbbell className="w-5 h-5 text-primary" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-medium truncate">{w.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {w.trainer?.name ?? "Trainer"} · {w.days?.length ?? 0} days
                      </p>
                    </div>
                    <Badge variant={w.status === "active" ? "default" : "secondary"} className="shrink-0 capitalize">
                      {w.status}
                    </Badge>
                    <ChevronRight className="w-4 h-4 text-muted-foreground shrink-0" />
                  </CardContent>
                </Card>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
