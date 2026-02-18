import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { trainerApi } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, Trash2 } from "lucide-react";

interface MemberOption {
  id: number;
  name: string;
}

interface ExerciseOption {
  id: number;
  name: string;
}

interface DayRow {
  dayLabel: string;
  exercises: { exerciseId: number; sets: number; reps: string; restSeconds: number; notes?: string }[];
}

const emptyDay = (): DayRow => ({ dayLabel: "", exercises: [{ exerciseId: 0, sets: 3, reps: "10", restSeconds: 60 }] });

export default function TrainerWorkoutNewPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [name, setName] = useState("");
  const [traineeId, setTraineeId] = useState<string>("");
  const [days, setDays] = useState<DayRow[]>([emptyDay()]);

  const { data: members = [] } = useQuery({
    queryKey: ["trainer", "members"],
    queryFn: async () => {
      const res = await trainerApi.get<MemberOption[] | { data: MemberOption[] }>("/members?per_page=100");
      return Array.isArray(res) ? res : (res as { data?: MemberOption[] }).data ?? [];
    },
  });

  const { data: exercises = [] } = useQuery({
    queryKey: ["trainer", "exercises"],
    queryFn: async () => {
      const res = await trainerApi.get<ExerciseOption[] | { data: ExerciseOption[] }>("/exercises?per_page=200");
      return Array.isArray(res) ? res : (res as { data?: ExerciseOption[] }).data ?? [];
    },
  });

  const createMutation = useMutation({
    mutationFn: (payload: { name: string; trainee_id: number; days: DayRow[] }) =>
      trainerApi.post("/workouts", {
        name: payload.name,
        trainee_id: payload.trainee_id,
        status: "active",
        days: payload.days.map((d) => ({
          dayLabel: d.dayLabel || "Day",
          exercises: d.exercises
            .filter((e) => e.exerciseId > 0 && e.sets >= 1)
            .map((e) => ({ exerciseId: e.exerciseId, sets: e.sets, reps: e.reps, restSeconds: e.restSeconds, notes: e.notes || null })),
        })),
      }),
    onSuccess: (data: { id?: number }) => {
      queryClient.invalidateQueries({ queryKey: ["trainer", "workouts"] });
      toast({ title: "Workout plan created" });
      navigate(data?.id ? "/trainer/workouts/" + data.id : "/trainer/workouts");
    },
    onError: (e: Error) => toast({ title: "Failed to create plan", description: e.message, variant: "destructive" }),
  });

  const addDay = () => setDays((d) => [...d, emptyDay()]);
  const removeDay = (i: number) => setDays((d) => (d.length <= 1 ? d : d.filter((_, idx) => idx !== i)));
  const setDayLabel = (i: number, v: string) => setDays((d) => d.map((day, idx) => (idx === i ? { ...day, dayLabel: v } : day)));
  const addExercise = (dayIdx: number) =>
    setDays((d) =>
      d.map((day, i) => (i === dayIdx ? { ...day, exercises: [...day.exercises, { exerciseId: 0, sets: 3, reps: "10", restSeconds: 60 }] } : day))
    );
  const removeExercise = (dayIdx: number, exIdx: number) =>
    setDays((d) =>
      d.map((day, i) => (i === dayIdx ? { ...day, exercises: day.exercises.filter((_, j) => j !== exIdx) } : day))
    );
  const setEx = (dayIdx: number, exIdx: number, field: keyof DayRow["exercises"][0], value: number | string) =>
    setDays((d) =>
      d.map((day, i) =>
        i === dayIdx
          ? {
              ...day,
              exercises: day.exercises.map((ex, j) => (j === exIdx ? { ...ex, [field]: value } : ex)),
            }
          : day
      )
    );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const tid = parseInt(traineeId, 10);
    if (!name.trim() || !tid || days.every((d) => d.exercises.every((ex) => ex.exerciseId === 0))) {
      toast({ title: "Fill name, member, and at least one exercise", variant: "destructive" });
      return;
    }
    createMutation.mutate({ name: name.trim(), trainee_id: tid, days });
  };

  return (
    <div className="space-y-6 max-w-2xl">
      <h1 className="text-2xl font-display font-bold">New workout plan</h1>
      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Plan name</Label>
              <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Strength 4-week" required />
            </div>
            <div className="space-y-2">
              <Label>Member</Label>
              <Select value={traineeId} onValueChange={setTraineeId} required>
                <SelectTrigger><SelectValue placeholder="Select member" /></SelectTrigger>
                <SelectContent>
                  {members.map((m) => (
                    <SelectItem key={m.id} value={String(m.id)}>{m.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {days.map((day, dayIdx) => (
          <Card key={dayIdx}>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-base">Day {dayIdx + 1}</CardTitle>
              <div className="flex gap-2">
                <Button type="button" variant="outline" size="sm" onClick={() => removeDay(dayIdx)} disabled={days.length <= 1}>
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Day label</Label>
                <Input value={day.dayLabel} onChange={(e) => setDayLabel(dayIdx, e.target.value)} placeholder="e.g. Day 1 - Push" />
              </div>
              {day.exercises.map((ex, exIdx) => (
                <div key={exIdx} className="flex flex-wrap items-end gap-2 p-2 rounded-lg border">
                  <Select
                    value={ex.exerciseId ? String(ex.exerciseId) : ""}
                    onValueChange={(v) => setEx(dayIdx, exIdx, "exerciseId", parseInt(v, 10))}
                  >
                    <SelectTrigger className="w-[200px]"><SelectValue placeholder="Exercise" /></SelectTrigger>
                    <SelectContent>
                      {exercises.map((e) => (
                        <SelectItem key={e.id} value={String(e.id)}>{e.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Input type="number" min={1} value={ex.sets} onChange={(e) => setEx(dayIdx, exIdx, "sets", parseInt(e.target.value, 10) || 0)} className="w-16" placeholder="Sets" />
                  <Input value={ex.reps} onChange={(e) => setEx(dayIdx, exIdx, "reps", e.target.value)} className="w-20" placeholder="Reps" />
                  <Input type="number" min={0} value={ex.restSeconds} onChange={(e) => setEx(dayIdx, exIdx, "restSeconds", parseInt(e.target.value, 10) || 0)} className="w-20" placeholder="Rest s" />
                  <Button type="button" variant="ghost" size="icon" onClick={() => removeExercise(dayIdx, exIdx)} disabled={day.exercises.length <= 1}>
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              ))}
              <Button type="button" variant="outline" size="sm" onClick={() => addExercise(dayIdx)} className="gap-1">
                <Plus className="w-4 h-4" /> Add exercise
              </Button>
            </CardContent>
          </Card>
        ))}

        <div className="flex gap-4">
          <Button type="button" variant="outline" onClick={() => navigate("/trainer/workouts")}>Cancel</Button>
          <Button type="button" variant="outline" onClick={addDay}>Add day</Button>
          <Button type="submit" disabled={createMutation.isPending}>
            {createMutation.isPending ? "Creating…" : "Create plan"}
          </Button>
        </div>
      </form>
    </div>
  );
}
