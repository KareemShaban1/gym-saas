import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { trainerApi } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Dumbbell, ChevronRight } from "lucide-react";

interface WorkoutPlan {
  id: number;
  name: string;
  status: string;
  trainee_id: number;
  trainee?: { id: number; name: string };
  trainer_id?: number;
}

export default function TrainerWorkoutsPage() {
  const [traineeFilter, setTraineeFilter] = useState("");

  const { data: workouts = [], isLoading } = useQuery({
    queryKey: ["trainer", "workouts"],
    queryFn: async () => {
      const res = await trainerApi.get<WorkoutPlan[] | { data: WorkoutPlan[] }>("/workouts?per_page=100");
      return Array.isArray(res) ? res : (res as { data?: WorkoutPlan[] }).data ?? [];
    },
  });

  const filtered = traineeFilter.trim()
    ? workouts.filter((w) => w.trainee?.name?.toLowerCase().includes(traineeFilter.toLowerCase()))
    : workouts;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-2xl font-display font-bold">Workout plans</h1>
        <Link to="/trainer/workouts/new">
          <span className="inline-flex items-center justify-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90">
            New plan
          </span>
        </Link>
      </div>

      <Input
        placeholder="Filter by member name"
        value={traineeFilter}
        onChange={(e) => setTraineeFilter(e.target.value)}
        className="max-w-xs"
      />

      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Dumbbell className="w-4 h-4" />
            Plans ({filtered.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <p className="text-sm text-muted-foreground">Loading…</p>
          ) : filtered.length === 0 ? (
            <p className="text-sm text-muted-foreground">No workout plans. Create one for a member.</p>
          ) : (
            <ul className="divide-y divide-border">
              {filtered.map((w) => (
                <li key={w.id}>
                  <Link
                    to={"/trainer/workouts/" + w.id}
                    className="flex items-center justify-between py-3 hover:bg-muted/50 -mx-2 px-2 rounded-lg transition-colors"
                  >
                    <div>
                      <p className="font-medium">{w.name}</p>
                      <p className="text-sm text-muted-foreground">{w.trainee?.name ?? "Member #" + w.trainee_id}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs px-2 py-0.5 rounded bg-muted capitalize">{w.status}</span>
                      <ChevronRight className="w-4 h-4 text-muted-foreground" />
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
