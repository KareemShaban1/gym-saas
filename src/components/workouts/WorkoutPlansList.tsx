import { useState } from "react";
import type { WorkoutPlan, WorkoutExercise, Exercise } from "@/data/workouts";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import {
  Search, ChevronDown, ChevronRight, User, UserCog, Layers, Pencil, Plus,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface WorkoutPlansListProps {
  plans: WorkoutPlan[];
  exercises: Exercise[];
  onEditPlan?: (plan: WorkoutPlan) => void;
  onCreatePlan?: () => void;
}

const WorkoutPlansList = ({ plans, exercises, onEditPlan, onCreatePlan }: WorkoutPlansListProps) => {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "draft" | "completed">("all");
  const [expandedPlan, setExpandedPlan] = useState<number | null>(null);

  const filtered = plans.filter((p) => {
    const matchSearch = p.traineeName.toLowerCase().includes(search.toLowerCase()) ||
      p.name.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === "all" || p.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const toggle = (id: number) => setExpandedPlan(expandedPlan === id ? null : id);

  const statuses: ("all" | "active" | "draft" | "completed")[] = ["all", "active", "draft", "completed"];
  const statusCounts = {
    all: plans.length,
    active: plans.filter((p) => p.status === "active").length,
    draft: plans.filter((p) => p.status === "draft").length,
    completed: plans.filter((p) => p.status === "completed").length,
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder="Search by trainee or plan name..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
        </div>
        {onCreatePlan && (
          <Button size="sm" className="gap-1.5 shrink-0" onClick={onCreatePlan}>
            <Plus className="w-3.5 h-3.5" /> Create plan
          </Button>
        )}
        <div className="flex items-center gap-1 flex-wrap">
          {statuses.map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={cn(
                "px-3 py-1.5 rounded-lg text-xs font-medium capitalize transition-colors",
                statusFilter === s ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:text-foreground"
              )}
            >
              {s} ({statusCounts[s]})
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-3">
        {filtered.length === 0 ? (
          <div className="rounded-xl border border-border bg-card p-12 text-center text-muted-foreground">No workout plans found.</div>
        ) : (
          filtered.map((plan) => {
            const isExpanded = expandedPlan === plan.id;
            return (
              <div key={plan.id} className="rounded-xl border border-border bg-card overflow-hidden">
                <button
                  className="w-full flex items-center gap-4 px-5 py-4 text-left hover:bg-muted/30 transition-colors"
                  onClick={() => toggle(plan.id)}
                >
                  <div className="shrink-0">
                    {isExpanded ? <ChevronDown className="w-4 h-4 text-muted-foreground" /> : <ChevronRight className="w-4 h-4 text-muted-foreground" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{plan.name}</p>
                    <div className="flex items-center gap-3 mt-0.5 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1"><User className="w-3 h-3" /> {plan.traineeName}</span>
                      {plan.trainerName && <span className="flex items-center gap-1"><UserCog className="w-3 h-3" /> {plan.trainerName}</span>}
                      <span className="flex items-center gap-1"><Layers className="w-3 h-3" /> {plan.days.length} day{plan.days.length !== 1 ? "s" : ""}</span>
                    </div>
                  </div>
                  <Badge variant={plan.status === "active" ? "default" : plan.status === "draft" ? "secondary" : "outline"} className="capitalize shrink-0">
                    {plan.status}
                  </Badge>
                  <span className="text-xs text-muted-foreground shrink-0 hidden sm:block">
                    {format(new Date(plan.createdAt), "MMM d, yyyy")}
                  </span>
                </button>

                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="overflow-hidden"
                    >
                      <div className="px-5 pb-4 space-y-4 border-t border-border pt-4">
                        {onEditPlan && (
                          <div className="flex justify-end">
                            <Button variant="outline" size="sm" className="gap-1.5" onClick={() => onEditPlan(plan)}>
                              <Pencil className="w-3.5 h-3.5" /> Edit plan &amp; media
                            </Button>
                          </div>
                        )}
                        {plan.days.map((day, di) => (
                          <div key={di}>
                            <h4 className="text-sm font-semibold mb-2">{day.dayLabel}</h4>
                            <div className="rounded-lg border border-border overflow-hidden">
                              <table className="w-full text-sm">
                                <thead>
                                  <tr className="bg-muted/50">
                                    <th className="text-left font-medium text-muted-foreground px-4 py-2 text-xs w-20">Media</th>
                                    <th className="text-left font-medium text-muted-foreground px-4 py-2 text-xs">Exercise</th>
                                    <th className="text-center font-medium text-muted-foreground px-3 py-2 text-xs">Sets</th>
                                    <th className="text-center font-medium text-muted-foreground px-3 py-2 text-xs">Reps</th>
                                    <th className="text-center font-medium text-muted-foreground px-3 py-2 text-xs hidden sm:table-cell">Rest</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {day.exercises.map((we, ei) => {
                                    const ex = getExerciseById(we.exerciseId);
                                    const isVideo = we.mediaType === "video" || /\.(mp4|webm|ogg)(\?|$)/i.test(we.mediaUrl ?? "");
                                    const isImage = we.mediaType === "image" || we.mediaType === "gif" || !isVideo;
                                    return (
                                      <tr key={ei} className="border-t border-border">
                                        <td className="px-4 py-2.5 align-top w-20">
                                          {we.mediaUrl ? (
                                            isVideo ? (
                                              <video
                                                src={we.mediaUrl}
                                                className="w-16 h-16 object-cover rounded border border-border bg-muted"
                                                controls
                                                muted
                                                loop
                                                playsInline
                                                preload="metadata"
                                              />
                                            ) : (
                                              <img
                                                src={we.mediaUrl}
                                                alt=""
                                                className="w-16 h-16 object-cover rounded border border-border bg-muted"
                                              />
                                            )
                                          ) : (
                                            <span className="text-xs text-muted-foreground">—</span>
                                          )}
                                        </td>
                                        <td className="px-4 py-2.5">
                                          <p className="font-medium text-sm">{ex?.name || "Unknown"}</p>
                                          <p className="text-xs text-muted-foreground">{ex?.muscleGroup} · {ex?.equipment}</p>
                                        </td>
                                        <td className="text-center px-3 py-2.5 font-medium">{we.sets}</td>
                                        <td className="text-center px-3 py-2.5 text-muted-foreground">{we.reps}</td>
                                        <td className="text-center px-3 py-2.5 text-muted-foreground hidden sm:table-cell">
                                          {we.restSeconds > 0 ? `${we.restSeconds}s` : "—"}
                                        </td>
                                      </tr>
                                    );
                                  })}
                                </tbody>
                              </table>
                            </div>
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default WorkoutPlansList;
