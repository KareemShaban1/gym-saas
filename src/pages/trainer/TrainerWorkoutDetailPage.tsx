import { useQuery } from "@tanstack/react-query";
import { Link, useParams } from "react-router-dom";
import { trainerApi } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Dumbbell } from "lucide-react";

interface WorkoutPlan {
  id: number;
  name: string;
  status: string;
  days: { dayLabel: string; exercises: { exerciseId: number; sets: number; reps: string; restSeconds: number; notes?: string }[] }[];
  trainee?: { id: number; name: string };
}

export default function TrainerWorkoutDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { data: workout, isLoading } = useQuery({
    queryKey: ["trainer", "workouts", id],
    queryFn: () => trainerApi.get<WorkoutPlan>("/workouts/" + id),
    enabled: !!id,
  });

  if (isLoading || !workout) {
    return (
      <div className="space-y-4">
        <Link to="/trainer/workouts" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="w-4 h-4" /> Back to plans
        </Link>
        <p className="text-muted-foreground">Loading…</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <div className="flex items-center gap-4">
        <Link to="/trainer/workouts" className="p-2 rounded-lg hover:bg-muted">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-display font-bold">{workout.name}</h1>
          <p className="text-sm text-muted-foreground">{workout.trainee?.name ?? "Member"} · {workout.status}</p>
        </div>
      </div>

      {workout.days && workout.days.length > 0 ? (
        <div className="space-y-4">
          {workout.days.map((day, dayIdx) => (
            <Card key={dayIdx}>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Dumbbell className="w-4 h-4" />
                  {day.dayLabel || `Day ${dayIdx + 1}`}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {day.exercises?.map((ex, exIdx) => (
                    <li key={exIdx} className="flex justify-between text-sm py-1 border-b border-border last:border-0">
                      <span>Exercise #{ex.exerciseId}</span>
                      <span className="text-muted-foreground">{ex.sets} × {ex.reps} · {ex.restSeconds}s rest</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="py-6 text-center text-muted-foreground text-sm">No days in this plan.</CardContent>
        </Card>
      )}

      <Link to="/trainer/workouts">
        <Button variant="outline" className="gap-2">
          <ArrowLeft className="w-4 h-4" /> Back to plans
        </Button>
      </Link>
    </div>
  );
}
