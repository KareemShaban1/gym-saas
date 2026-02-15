import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type { ApiWorkoutPlan, ApiExercise } from "@/types/api";
import type { WorkoutPlan } from "@/data/workouts";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import ExerciseLibrary from "@/components/workouts/ExerciseLibrary";
import WorkoutPlansList from "@/components/workouts/WorkoutPlansList";
import WorkoutPlanFormDialog from "@/components/workouts/WorkoutPlanFormDialog";
import ProgressTracker from "@/components/workouts/ProgressTracker";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Exercise, initialProgress } from "@/data/workouts";
import { motion } from "framer-motion";
import { Dumbbell, ClipboardList, TrendingUp } from "lucide-react";
import { useLanguage } from "@/i18n/LanguageContext";
import { useToast } from "@/hooks/use-toast";

function mapApiPlanToWorkoutPlan(api: ApiWorkoutPlan): WorkoutPlan {
  const rawDays = Array.isArray(api.days) ? api.days : [];
  const days = rawDays.map((d: { dayLabel?: string; exercises?: Array<Record<string, unknown>> }) => ({
    dayLabel: d.dayLabel ?? "",
    exercises: (d.exercises ?? []).map((ex: Record<string, unknown>) => ({
      exerciseId: ex.exerciseId ?? ex.exercise_id,
      sets: ex.sets ?? 0,
      reps: String(ex.reps ?? ""),
      restSeconds: ex.restSeconds ?? ex.rest_seconds ?? 0,
      notes: ex.notes as string | undefined,
    })),
  }));
  return {
    id: api.id,
    name: api.name,
    traineeId: api.trainee_id,
    traineeName: api.trainee?.name ?? "—",
    trainerId: api.trainer_id ?? undefined,
    trainerName: api.trainer?.name,
    days,
    createdAt: (api as ApiWorkoutPlan & { created_at?: string }).created_at ?? "",
    status: (api.status as WorkoutPlan["status"]) ?? "active",
  };
}

const WorkoutsPage = () => {
  const { toast } = useToast();
  const { t } = useLanguage();
  const queryClient = useQueryClient();
  const [createPlanOpen, setCreatePlanOpen] = useState(false);

  const { data: exercisesList = [] } = useQuery({
    queryKey: ["exercises"],
    queryFn: async () => {
      const res = await api.get<ApiExercise[] | { data: ApiExercise[] }>("/exercises");
      const list = Array.isArray(res) ? res : (res as { data: ApiExercise[] }).data ?? [];
      return list.map((e) => ({
        id: e.id,
        name: e.name,
        muscleGroup: e.muscle_group as Exercise["muscleGroup"],
        equipment: e.equipment,
        isGlobal: e.is_global ?? true,
        description: e.description ?? undefined,
        videoUrl: e.video_url ?? undefined,
        imageUrl: e.image_url ?? undefined,
        gifUrl: e.gif_url ?? undefined,
      }));
    },
  });

  const createExerciseMutation = useMutation({
    mutationFn: (formData: FormData) => api.post<ApiExercise>("/exercises", formData),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["exercises"] }),
  });

  const updateExerciseMutation = useMutation({
    mutationFn: ({ id, formData }: { id: number; formData: FormData }) =>
      api.post<ApiExercise>(`/exercises/${id}`, formData),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["exercises"] }),
  });

  const deleteExerciseMutation = useMutation({
    mutationFn: (id: number) => api.delete(`/exercises/${id}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["exercises"] }),
  });

  const { data: plansList = [] } = useQuery({
    queryKey: ["workouts"],
    queryFn: async () => {
      const res = await api.get<ApiWorkoutPlan[] | { data: ApiWorkoutPlan[] }>("/workouts");
      const list = Array.isArray(res) ? res : (res as { data: ApiWorkoutPlan[] }).data ?? [];
      return list.map(mapApiPlanToWorkoutPlan);
    },
  });

  const { data: membersList = [] } = useQuery({
    queryKey: ["members"],
    queryFn: async () => {
      const res = await api.get<{ id: number; name: string }[] | { data: { id: number; name: string }[] }>("/members");
      const list = Array.isArray(res) ? res : (res as { data: { id: number; name: string }[] }).data ?? [];
      return list.map((m) => ({ id: m.id, name: m.name }));
    },
  });

  const { data: trainersList = [] } = useQuery({
    queryKey: ["trainers"],
    queryFn: async () => {
      const res = await api.get<{ id: number; name: string }[] | { data: { id: number; name: string }[] }>("/trainers");
      const list = Array.isArray(res) ? res : (res as { data: { id: number; name: string }[] }).data ?? [];
      return list.map((t) => ({ id: t.id, name: t.name }));
    },
  });

  const createWorkoutMutation = useMutation({
    mutationFn: (payload: {
      name: string;
      trainee_id: number;
      trainer_id?: number | null;
      status: string;
      days: Array<{ dayLabel: string; exercises: Array<{ exerciseId: number; sets: number; reps: string; restSeconds: number; notes?: string | null }> }>;
    }) => api.post<ApiWorkoutPlan>("/workouts", payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["workouts"] }),
  });

  const exercises: Exercise[] = exercisesList;

  const handleAddExercise = (formData: FormData) => {
    const name = formData.get("name") as string;
    createExerciseMutation.mutate(formData, {
      onSuccess: () => toast({ title: t("exercises"), description: name }),
      onError: (e) => toast({ title: "Error", description: (e as Error).message, variant: "destructive" }),
    });
  };

  const handleUpdateExercise = (id: number, formData: FormData) => {
    const name = formData.get("name") as string;
    updateExerciseMutation.mutate(
      { id, formData },
      {
        onSuccess: () => toast({ title: t("exercises"), description: name }),
        onError: (e) => toast({ title: "Error", description: (e as Error).message, variant: "destructive" }),
      }
    );
  };

  const handleDeleteExercise = (id: number) => {
    deleteExerciseMutation.mutate(id, {
      onSuccess: () => toast({ title: t("exercises"), description: "Deleted" }),
      onError: (e) => toast({ title: "Error", description: (e as Error).message, variant: "destructive" }),
    });
  };

  const stats = [
    { icon: Dumbbell, label: t("exercises"), value: exercises.length, color: "text-primary" },
    { icon: ClipboardList, label: t("activePlans"), value: plansList.filter((p) => p.status === "active").length, color: "text-success" },
    { icon: TrendingUp, label: t("trackedTrainees"), value: initialProgress.length, color: "text-info" },
  ];

  return (
    <DashboardLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-display font-bold mb-1">{t("workoutsTitle")}</h1>
        <p className="text-muted-foreground">{t("workoutsDescription")}</p>
      </div>

      <div className="grid grid-cols-3 gap-3 mb-6">
        {stats.map((s) => (
          <motion.div key={s.label} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="rounded-xl border border-border bg-card p-4">
            <div className="flex items-center gap-2 mb-1">
              <s.icon className={`w-4 h-4 ${s.color}`} />
              <span className="text-xs text-muted-foreground">{s.label}</span>
            </div>
            <p className="text-xl font-bold">{s.value}</p>
          </motion.div>
        ))}
      </div>

      <Tabs defaultValue="exercises" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="exercises" className="gap-1.5"><Dumbbell className="w-3.5 h-3.5" /> {t("exerciseLibrary")}</TabsTrigger>
          <TabsTrigger value="plans" className="gap-1.5"><ClipboardList className="w-3.5 h-3.5" /> {t("workoutPlans")}</TabsTrigger>
          <TabsTrigger value="progress" className="gap-1.5"><TrendingUp className="w-3.5 h-3.5" /> {t("progress")}</TabsTrigger>
        </TabsList>
        <TabsContent value="exercises"><ExerciseLibrary exercises={exercises} onAdd={handleAddExercise} onUpdate={handleUpdateExercise} onDelete={handleDeleteExercise} /></TabsContent>
        <TabsContent value="plans">
          <WorkoutPlansList
            plans={plansList}
            exercises={exercises}
            onCreatePlan={() => setCreatePlanOpen(true)}
          />
          <WorkoutPlanFormDialog
            open={createPlanOpen}
            onOpenChange={setCreatePlanOpen}
            members={membersList}
            trainers={trainersList}
            exercises={exercises}
            loading={createWorkoutMutation.isPending}
            onSubmit={(payload) => {
              createWorkoutMutation.mutate(payload, {
                onSuccess: () => toast({ title: t("workoutPlans"), description: payload.name }),
                onError: (e) => toast({ title: "Error", description: (e as Error).message, variant: "destructive" }),
              });
            }}
          />
        </TabsContent>
        <TabsContent value="progress"><ProgressTracker progress={initialProgress} /></TabsContent>
      </Tabs>
    </DashboardLayout>
  );
};

export default WorkoutsPage;
