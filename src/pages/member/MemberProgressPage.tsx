import { useQuery } from "@tanstack/react-query";
import { memberApi } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Utensils, Dumbbell } from "lucide-react";
import { format } from "date-fns";

interface DietLog {
  id: number;
  period_type: string;
  period_date: string;
  content?: { meals?: string[]; calories?: number; notes?: string };
}

interface ExerciseLog {
  id: number;
  log_date: string;
  exercise_name?: string;
  exercise?: { name: string };
  sets?: number;
  reps?: string;
  weight_kg?: number;
  duration_seconds?: number;
  notes?: string;
}

export default function MemberProgressPage() {
  const { data: dietLogs = [] } = useQuery({
    queryKey: ["member", "progress", "diet"],
    queryFn: async () => {
      const res = await memberApi.get<DietLog[] | { data: DietLog[] }>("/progress/diet");
      return Array.isArray(res) ? res : (res as { data: DietLog[] }).data ?? [];
    },
  });

  const { data: exerciseLogs = [] } = useQuery({
    queryKey: ["member", "progress", "exercise"],
    queryFn: async () => {
      const res = await memberApi.get<ExerciseLog[] | { data: ExerciseLog[] }>("/progress/exercise");
      return Array.isArray(res) ? res : (res as { data: ExerciseLog[] }).data ?? [];
    },
  });

  return (
    <div className="p-4 space-y-6 max-w-lg mx-auto">
      <div>
        <h1 className="text-xl font-display font-bold">My progress</h1>
        <p className="text-sm text-muted-foreground mt-0.5">Diet & exercise logs from your trainer</p>
      </div>

      <Tabs defaultValue="diet">
        <TabsList className="w-full">
          <TabsTrigger value="diet" className="flex-1 gap-2"><Utensils className="w-4 h-4" /> Diet</TabsTrigger>
          <TabsTrigger value="exercise" className="flex-1 gap-2"><Dumbbell className="w-4 h-4" /> Exercise</TabsTrigger>
        </TabsList>
        <TabsContent value="diet" className="mt-4">
          <Card>
            <CardHeader><CardTitle className="text-base">Diet logs</CardTitle></CardHeader>
            <CardContent>
              {dietLogs.length === 0 ? (
                <p className="text-sm text-muted-foreground">No diet logs yet. Your trainer can add daily, weekly, or monthly plans.</p>
              ) : (
                <ul className="space-y-3">
                  {dietLogs.map((log) => (
                    <li key={log.id} className="py-2 border-b border-border last:border-0">
                      <p className="font-medium capitalize">{log.period_type}</p>
                      <p className="text-sm text-muted-foreground">{format(new Date(log.period_date), "PPP")}</p>
                      {log.content?.notes && <p className="text-sm mt-1">{log.content.notes}</p>}
                      {log.content?.calories != null && <p className="text-xs text-muted-foreground">{log.content.calories} cal</p>}
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="exercise" className="mt-4">
          <Card>
            <CardHeader><CardTitle className="text-base">Exercise logs</CardTitle></CardHeader>
            <CardContent>
              {exerciseLogs.length === 0 ? (
                <p className="text-sm text-muted-foreground">No exercise logs yet. Your trainer can log your workouts here.</p>
              ) : (
                <ul className="space-y-3">
                  {exerciseLogs.map((log) => (
                    <li key={log.id} className="py-2 border-b border-border last:border-0">
                      <p className="font-medium">{log.exercise?.name ?? log.exercise_name ?? "Exercise"}</p>
                      <p className="text-sm text-muted-foreground">{format(new Date(log.log_date), "PPP")}</p>
                      <p className="text-xs">{(log.sets != null && log.reps) ? `${log.sets}×${log.reps}` : ""} {log.weight_kg ? `${log.weight_kg} kg` : ""} {log.duration_seconds ? `${log.duration_seconds}s` : ""}</p>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
