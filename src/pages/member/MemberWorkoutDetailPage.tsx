import { useQuery } from "@tanstack/react-query";
import { useParams, Link } from "react-router-dom";
import { memberApi } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Dumbbell } from "lucide-react";

interface Day {
  dayLabel: string;
  exercises: {
    exerciseId: number;
    sets: number;
    reps: string;
    restSeconds: number;
    notes?: string;
    media_url?: string;
  }[];
}

interface WorkoutPlan {
  id: number;
  name: string;
  status: string;
  days: Day[];
  trainer?: { id: number; name: string };
}

export default function MemberWorkoutDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { data: workout, isLoading } = useQuery({
    queryKey: ["member", "workout", id],
    queryFn: () => memberApi.get<WorkoutPlan>(`/workouts/${id}`),
    enabled: !!id,
  });

  if (!id || isLoading || !workout) {
    return (
      <div className="p-4 max-w-lg mx-auto">
        <Link to="/member/workouts" className="inline-flex items-center gap-1 text-sm text-muted-foreground mb-4">
          <ArrowLeft className="w-4 h-4" /> Back to workouts
        </Link>
        <p className="text-muted-foreground">Loading…</p>
      </div>
    );
  }

  return (
    <div className="p-4 space-y-6 max-w-lg mx-auto pb-8">
      <Link to="/member/workouts" className="inline-flex items-center gap-1 text-sm text-muted-foreground">
        <ArrowLeft className="w-4 h-4" /> Back to workouts
      </Link>

      <div>
        <h1 className="text-xl font-display font-bold">{workout.name}</h1>
        <p className="text-sm text-muted-foreground">{workout.trainer?.name}</p>
        <Badge className="mt-2 capitalize">{workout.status}</Badge>
      </div>

      {workout.days?.map((day, dayIndex) => (
        <Card key={dayIndex}>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">{day.dayLabel}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {day.exercises?.map((ex, exIndex) => (
              <div
                key={exIndex}
                className="flex items-start gap-3 p-3 rounded-lg bg-muted/50"
              >
                <Dumbbell className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium">Exercise #{ex.exerciseId}</p>
                  <p className="text-xs text-muted-foreground">
                    {ex.sets} sets × {ex.reps} reps · {ex.restSeconds}s rest
                  </p>
                  {ex.notes && <p className="text-xs text-muted-foreground mt-1">{ex.notes}</p>}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
