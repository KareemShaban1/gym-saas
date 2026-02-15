import { useState } from "react";
import type { WorkoutDay, WorkoutExercise, Exercise } from "@/data/workouts";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Plus, Trash2, GripVertical } from "lucide-react";

export interface MemberOption {
  id: number;
  name: string;
}

export interface TrainerOption {
  id: number;
  name: string;
}

interface WorkoutPlanFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  members: MemberOption[];
  trainers: TrainerOption[];
  exercises: Exercise[];
  onSubmit: (payload: {
    name: string;
    trainee_id: number;
    trainer_id?: number | null;
    status: string;
    days: Array<{
      dayLabel: string;
      exercises: Array<{
        exerciseId: number;
        sets: number;
        reps: string;
        restSeconds: number;
        notes?: string | null;
      }>;
    }>;
  }) => void;
  loading?: boolean;
}

const emptyDay = (): WorkoutDay => ({ dayLabel: "", exercises: [] });
const emptyExercise = (): WorkoutExercise => ({ exerciseId: 0, sets: 3, reps: "10", restSeconds: 60 });

export default function WorkoutPlanFormDialog({
  open,
  onOpenChange,
  members,
  trainers,
  exercises,
  onSubmit,
  loading = false,
}: WorkoutPlanFormDialogProps) {
  const [name, setName] = useState("");
  const [traineeId, setTraineeId] = useState<number | "">("");
  const [trainerId, setTrainerId] = useState<number | "">("");
  const [status, setStatus] = useState<"active" | "draft" | "completed">("active");
  const [days, setDays] = useState<WorkoutDay[]>([emptyDay()]);

  const reset = () => {
    setName("");
    setTraineeId("");
    setTrainerId("");
    setStatus("active");
    setDays([emptyDay()]);
  };

  const handleOpenChange = (next: boolean) => {
    if (!next) reset();
    onOpenChange(next);
  };

  const addDay = () => setDays((d) => [...d, emptyDay()]);
  const removeDay = (index: number) => {
    if (days.length <= 1) return;
    setDays((d) => d.filter((_, i) => i !== index));
  };
  const setDayLabel = (index: number, value: string) => {
    setDays((d) => d.map((day, i) => (i === index ? { ...day, dayLabel: value } : day)));
  };

  const addExercise = (dayIndex: number) => {
    setDays((d) =>
      d.map((day, i) =>
        i === dayIndex ? { ...day, exercises: [...day.exercises, emptyExercise()] } : day
      )
    );
  };
  const removeExercise = (dayIndex: number, exIndex: number) => {
    setDays((d) =>
      d.map((day, i) =>
        i === dayIndex
          ? { ...day, exercises: day.exercises.filter((_, j) => j !== exIndex) }
          : day
      )
    );
  };
  const setExercise = (dayIndex: number, exIndex: number, field: keyof WorkoutExercise, value: unknown) => {
    setDays((d) =>
      d.map((day, i) => {
        if (i !== dayIndex) return day;
        const next = [...day.exercises];
        next[exIndex] = { ...next[exIndex], [field]: value };
        return { ...day, exercises: next };
      })
    );
  };

  const handleSubmit = () => {
    if (!name.trim() || traineeId === "") return;
    const payload = {
      name: name.trim(),
      trainee_id: traineeId as number,
      trainer_id: trainerId === "" ? null : (trainerId as number),
      status,
      days: days.map((day) => ({
        dayLabel: day.dayLabel || "Day",
        exercises: day.exercises
          .filter((e) => e.exerciseId && e.sets >= 1)
          .map((e) => ({
            exerciseId: e.exerciseId,
            sets: e.sets,
            reps: String(e.reps),
            restSeconds: e.restSeconds,
            notes: e.notes || null,
          })),
      })).filter((day) => day.exercises.length > 0),
    };
    if (payload.days.length === 0) return;
    onSubmit(payload);
    handleOpenChange(false);
  };

  const canSubmit =
    name.trim() &&
    traineeId !== "" &&
    days.some((d) => d.exercises.some((e) => e.exerciseId && e.sets >= 1));

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Create workout plan</DialogTitle>
        </DialogHeader>
        <ScrollArea className="flex-1 pr-4 -mr-4">
          <div className="space-y-4 py-2">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Plan name</Label>
                <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Push/Pull/Legs" />
              </div>
              <div className="space-y-1.5">
                <Label>Status</Label>
                <Select value={status} onValueChange={(v) => setStatus(v as "active" | "draft" | "completed")}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Trainee (member)</Label>
                <Select value={traineeId === "" ? "" : String(traineeId)} onValueChange={(v) => setTraineeId(v === "" ? "" : Number(v))}>
                  <SelectTrigger><SelectValue placeholder="Select member" /></SelectTrigger>
                  <SelectContent>
                    {members.map((m) => (
                      <SelectItem key={m.id} value={String(m.id)}>{m.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Trainer (optional)</Label>
                <Select value={trainerId === "" ? "none" : String(trainerId)} onValueChange={(v) => setTrainerId(v === "none" ? "" : Number(v))}>
                  <SelectTrigger><SelectValue placeholder="Optional" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">None</SelectItem>
                    {trainers.map((t) => (
                      <SelectItem key={t.id} value={String(t.id)}>{t.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label>Days & exercises</Label>
                <Button type="button" variant="outline" size="sm" className="gap-1" onClick={addDay}>
                  <Plus className="w-3.5 h-3.5" /> Add day
                </Button>
              </div>
              {days.map((day, dayIndex) => (
                <div key={dayIndex} className="rounded-lg border border-border p-3 space-y-3">
                  <div className="flex items-center gap-2">
                    <Input
                      value={day.dayLabel}
                      onChange={(e) => setDayLabel(dayIndex, e.target.value)}
                      placeholder={`Day ${dayIndex + 1} label (e.g. Push, Pull, Legs)`}
                      className="flex-1"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="shrink-0"
                      onClick={() => removeDay(dayIndex)}
                      disabled={days.length <= 1}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                  <div className="space-y-2">
                    {day.exercises.map((we, exIndex) => (
                      <div key={exIndex} className="flex flex-wrap items-center gap-2 p-2 rounded-md bg-muted/50">
                        <GripVertical className="w-4 h-4 text-muted-foreground shrink-0" />
                        <Select
                          value={we.exerciseId ? String(we.exerciseId) : ""}
                          onValueChange={(v) => setExercise(dayIndex, exIndex, "exerciseId", Number(v))}
                        >
                          <SelectTrigger className="w-[180px]"><SelectValue placeholder="Exercise" /></SelectTrigger>
                          <SelectContent>
                            {exercises.map((e) => (
                              <SelectItem key={e.id} value={String(e.id)}>{e.name}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <Input
                          type="number"
                          min={1}
                          className="w-16"
                          value={we.sets}
                          onChange={(e) => setExercise(dayIndex, exIndex, "sets", Number(e.target.value) || 1)}
                        />
                        <span className="text-xs text-muted-foreground">sets</span>
                        <Input
                          className="w-20"
                          value={we.reps}
                          onChange={(e) => setExercise(dayIndex, exIndex, "reps", e.target.value)}
                          placeholder="10"
                        />
                        <span className="text-xs text-muted-foreground">reps</span>
                        <Input
                          type="number"
                          min={0}
                          className="w-16"
                          value={we.restSeconds}
                          onChange={(e) => setExercise(dayIndex, exIndex, "restSeconds", Number(e.target.value) || 0)}
                        />
                        <span className="text-xs text-muted-foreground">s rest</span>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="shrink-0"
                          onClick={() => removeExercise(dayIndex, exIndex)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
                    <Button type="button" variant="outline" size="sm" className="gap-1 w-full" onClick={() => addExercise(dayIndex)}>
                      <Plus className="w-3.5 h-3.5" /> Add exercise to this day
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </ScrollArea>
        <DialogFooter>
          <Button variant="outline" onClick={() => handleOpenChange(false)}>Cancel</Button>
          <Button onClick={handleSubmit} disabled={!canSubmit || loading}>
            {loading ? "Creating…" : "Create plan"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
