import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useParams, Link } from "react-router-dom";
import { api } from "@/lib/api";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, Utensils, Dumbbell, Plus, Trash2 } from "lucide-react";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";

interface DietLog {
  id: number;
  period_type: string;
  period_date: string;
  content?: { meals?: string[]; calories?: number; notes?: string };
}

interface ExerciseLog {
  id: number;
  log_date: string;
  exercise_id?: number;
  exercise_name?: string;
  exercise?: { name: string };
  sets?: number;
  reps?: string;
  weight_kg?: number;
  duration_seconds?: number;
  notes?: string;
}

export default function MemberProgressPage() {
  const { memberId } = useParams<{ memberId: string }>();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [dietOpen, setDietOpen] = useState(false);
  const [exerciseOpen, setExerciseOpen] = useState(false);
  const [periodType, setPeriodType] = useState<"daily" | "weekly" | "monthly">("daily");
  const [periodDate, setPeriodDate] = useState(format(new Date(), "yyyy-MM-dd"));
  const [dietContent, setDietContent] = useState({ meals: [] as string[], calories: "", notes: "" });
  const [exDate, setExDate] = useState(format(new Date(), "yyyy-MM-dd"));
  const [exExerciseId, setExExerciseId] = useState("");
  const [exName, setExName] = useState("");
  const [exSets, setExSets] = useState("");
  const [exReps, setExReps] = useState("");
  const [exWeight, setExWeight] = useState("");
  const [exDuration, setExDuration] = useState("");
  const [exNotes, setExNotes] = useState("");

  const { data: member } = useQuery({
    queryKey: ["members", memberId],
    queryFn: () => api.get<{ id: number; name: string }>(`/members/${memberId}`),
    enabled: !!memberId,
  });

  const { data: dietLogs = [] } = useQuery({
    queryKey: ["members", memberId, "diet-logs"],
    queryFn: async () => {
      const res = await api.get<DietLog[] | { data: DietLog[] }>(`/members/${memberId}/diet-logs`);
      return Array.isArray(res) ? res : (res as { data: DietLog[] }).data ?? [];
    },
    enabled: !!memberId,
  });

  const { data: exerciseLogs = [] } = useQuery({
    queryKey: ["members", memberId, "exercise-logs"],
    queryFn: async () => {
      const res = await api.get<ExerciseLog[] | { data: ExerciseLog[] }>(`/members/${memberId}/exercise-logs`);
      return Array.isArray(res) ? res : (res as { data: ExerciseLog[] }).data ?? [];
    },
    enabled: !!memberId,
  });

  const { data: exercises = [] } = useQuery({
    queryKey: ["exercises"],
    queryFn: async () => {
      const res = await api.get<{ id: number; name: string }[] | { data: { id: number; name: string }[] }>("/exercises");
      return Array.isArray(res) ? res : (res as { data: { id: number; name: string }[] }).data ?? [];
    },
  });

  const addDiet = useMutation({
    mutationFn: (payload: { period_type: string; period_date: string; content: object }) =>
      api.post(`/members/${memberId}/diet-logs`, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["members", memberId, "diet-logs"] });
      setDietOpen(false);
      toast({ title: "Diet log added" });
    },
    onError: (e: Error) => toast({ title: "Failed", description: e.message, variant: "destructive" }),
  });

  const addExercise = useMutation({
    mutationFn: (payload: Record<string, unknown>) => api.post(`/members/${memberId}/exercise-logs`, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["members", memberId, "exercise-logs"] });
      setExerciseOpen(false);
      toast({ title: "Exercise log added" });
    },
    onError: (e: Error) => toast({ title: "Failed", description: e.message, variant: "destructive" }),
  });

  const deleteDiet = useMutation({
    mutationFn: (id: number) => api.delete(`/members/${memberId}/diet-logs/${id}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["members", memberId, "diet-logs"] }),
  });

  const deleteExercise = useMutation({
    mutationFn: (id: number) => api.delete(`/members/${memberId}/exercise-logs/${id}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["members", memberId, "exercise-logs"] }),
  });

  const handleAddDiet = () => {
    const content: { meals?: string[]; calories?: number; notes?: string } = {};
    if (dietContent.notes) content.notes = dietContent.notes;
    if (dietContent.calories) content.calories = parseFloat(dietContent.calories) || undefined;
    addDiet.mutate({ period_type: periodType, period_date: periodDate, content });
  };

  const handleAddExercise = () => {
    addExercise.mutate({
      log_date: exDate,
      exercise_id: exExerciseId ? parseInt(exExerciseId, 10) : null,
      exercise_name: exName || undefined,
      sets: exSets ? parseInt(exSets, 10) : null,
      reps: exReps || undefined,
      weight_kg: exWeight ? parseFloat(exWeight) : null,
      duration_seconds: exDuration ? parseInt(exDuration, 10) : null,
      notes: exNotes || undefined,
    });
  };

  if (!memberId) return null;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Link to="/dashboard/members" className="p-2 rounded-lg hover:bg-muted">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-display font-bold">Progress: {member?.name ?? "Member"}</h1>
            <p className="text-sm text-muted-foreground">Diet & exercise tracking</p>
          </div>
        </div>

        <Tabs defaultValue="diet">
          <TabsList>
            <TabsTrigger value="diet" className="gap-2"><Utensils className="w-4 h-4" /> Diet</TabsTrigger>
            <TabsTrigger value="exercise" className="gap-2"><Dumbbell className="w-4 h-4" /> Exercise</TabsTrigger>
          </TabsList>
          <TabsContent value="diet" className="space-y-4 mt-4">
            <div className="flex justify-end">
              <Button onClick={() => setDietOpen(true)} className="gap-2"><Plus className="w-4 h-4" /> Add diet log</Button>
            </div>
            <Card>
              <CardHeader><CardTitle className="text-base">Diet logs (daily / weekly / monthly)</CardTitle></CardHeader>
              <CardContent>
                {dietLogs.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No diet logs yet.</p>
                ) : (
                  <ul className="space-y-3">
                    {dietLogs.map((log) => (
                      <li key={log.id} className="flex justify-between items-start gap-4 py-2 border-b border-border last:border-0">
                        <div>
                          <p className="font-medium capitalize">{log.period_type}</p>
                          <p className="text-sm text-muted-foreground">{format(new Date(log.period_date), "PPP")}</p>
                          {log.content?.meals?.length ? <p className="text-sm mt-1">{log.content.meals.join(", ")}</p> : null}
                          {log.content?.calories != null && <p className="text-xs text-muted-foreground">{log.content.calories} cal</p>}
                        </div>
                        <Button variant="ghost" size="icon" onClick={() => deleteDiet.mutate(log.id)}><Trash2 className="w-4 h-4 text-destructive" /></Button>
                      </li>
                    ))}
                  </ul>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="exercise" className="space-y-4 mt-4">
            <div className="flex justify-end">
              <Button onClick={() => setExerciseOpen(true)} className="gap-2"><Plus className="w-4 h-4" /> Add exercise log</Button>
            </div>
            <Card>
              <CardHeader><CardTitle className="text-base">Exercise logs</CardTitle></CardHeader>
              <CardContent>
                {exerciseLogs.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No exercise logs yet.</p>
                ) : (
                  <ul className="space-y-3">
                    {exerciseLogs.map((log) => (
                      <li key={log.id} className="flex justify-between items-start gap-4 py-2 border-b border-border last:border-0">
                        <div>
                          <p className="font-medium">{log.exercise?.name ?? log.exercise_name ?? "Exercise"}</p>
                          <p className="text-sm text-muted-foreground">{format(new Date(log.log_date), "PPP")}</p>
                          <p className="text-xs">{(log.sets != null && log.reps) ? `${log.sets}×${log.reps}` : ""} {log.weight_kg ? `${log.weight_kg} kg` : ""} {log.duration_seconds ? `${log.duration_seconds}s` : ""}</p>
                        </div>
                        <Button variant="ghost" size="icon" onClick={() => deleteExercise.mutate(log.id)}><Trash2 className="w-4 h-4 text-destructive" /></Button>
                      </li>
                    ))}
                  </ul>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      <Dialog open={dietOpen} onOpenChange={setDietOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Add diet log</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Period type</Label>
                <select value={periodType} onChange={(e) => setPeriodType(e.target.value as "daily" | "weekly" | "monthly")} className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
                  <option value="daily">Daily</option>
                  <option value="weekly">Weekly</option>
                  <option value="monthly">Monthly</option>
                </select>
              </div>
              <div className="space-y-2">
                <Label>Date</Label>
                <Input type="date" value={periodDate} onChange={(e) => setPeriodDate(e.target.value)} />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Notes / meals (text)</Label>
              <Input placeholder="e.g. Breakfast: oats, banana" value={dietContent.notes} onChange={(e) => setDietContent((c) => ({ ...c, notes: e.target.value }))} />
            </div>
            <div className="space-y-2">
              <Label>Calories (optional)</Label>
              <Input type="number" placeholder="2000" value={dietContent.calories} onChange={(e) => setDietContent((c) => ({ ...c, calories: e.target.value }))} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDietOpen(false)}>Cancel</Button>
            <Button onClick={handleAddDiet} disabled={addDiet.isPending}>Add</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={exerciseOpen} onOpenChange={setExerciseOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Add exercise log</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Date</Label>
              <Input type="date" value={exDate} onChange={(e) => setExDate(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Exercise</Label>
              <select value={exExerciseId} onChange={(e) => { setExExerciseId(e.target.value); setExName(""); }} className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
                <option value="">— Custom —</option>
                {exercises.map((e) => <option key={e.id} value={e.id}>{e.name}</option>)}
              </select>
            </div>
            {!exExerciseId && <div className="space-y-2"><Label>Custom name</Label><Input value={exName} onChange={(e) => setExName(e.target.value)} placeholder="e.g. Bench press" /></div>}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><Label>Sets</Label><Input type="number" value={exSets} onChange={(e) => setExSets(e.target.value)} placeholder="3" /></div>
              <div className="space-y-2"><Label>Reps</Label><Input value={exReps} onChange={(e) => setExReps(e.target.value)} placeholder="10" /></div>
              <div className="space-y-2"><Label>Weight (kg)</Label><Input type="number" value={exWeight} onChange={(e) => setExWeight(e.target.value)} /></div>
              <div className="space-y-2"><Label>Duration (sec)</Label><Input type="number" value={exDuration} onChange={(e) => setExDuration(e.target.value)} placeholder="Cardio" /></div>
            </div>
            <div className="space-y-2"><Label>Notes</Label><Input value={exNotes} onChange={(e) => setExNotes(e.target.value)} /></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setExerciseOpen(false)}>Cancel</Button>
            <Button onClick={handleAddExercise} disabled={addExercise.isPending}>Add</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
