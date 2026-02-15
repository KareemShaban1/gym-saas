import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { apiTrainerToTrainerUI, trainerUIToApiPayload, type ApiTrainer, type TrainerUI } from "@/types/api";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import TrainerFormDialog from "@/components/trainers/TrainerFormDialog";
import TrainerDetailSheet from "@/components/trainers/TrainerDetailSheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { motion } from "framer-motion";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/i18n/LanguageContext";
import {
  Search, Plus, MoreHorizontal, Eye, Pencil, Trash2,
  Users, DollarSign, UserCog, Award,
} from "lucide-react";

type StatusFilter = "All" | "Active" | "On Leave" | "Inactive";
const statusFilters: StatusFilter[] = ["All", "Active", "On Leave", "Inactive"];

const TrainersPage = () => {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("All");
  const [formOpen, setFormOpen] = useState(false);
  const [editingTrainer, setEditingTrainer] = useState<TrainerUI | null>(null);
  const [detailTrainer, setDetailTrainer] = useState<TrainerUI | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const { toast } = useToast();
  const { t } = useLanguage();
  const queryClient = useQueryClient();

  const { data: trainersList = [], isLoading } = useQuery({
    queryKey: ["trainers", search, statusFilter],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (search) params.set("search", search);
      if (statusFilter !== "All") params.set("status", statusFilter);
      const res = await api.get<ApiTrainer[] | { data: ApiTrainer[] }>(`/trainers?${params}`);
      const list = Array.isArray(res) ? res : (res as { data: ApiTrainer[] }).data ?? [];
      return list.map((api) => apiTrainerToTrainerUI(api as ApiTrainer & { members_count?: number }));
    },
  });

  const createTrainer = useMutation({
    mutationFn: (payload: Record<string, unknown>) => api.post<ApiTrainer>("/trainers", payload),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["trainers"] }); setEditingTrainer(null); },
  });
  const updateTrainer = useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: Record<string, unknown> }) =>
      api.put<ApiTrainer>(`/trainers/${id}`, payload),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["trainers"] }); setEditingTrainer(null); },
  });
  const deleteTrainer = useMutation({
    mutationFn: (id: number) => api.delete(`/trainers/${id}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["trainers"] }),
  });

  const trainers = trainersList;
  const filtered = trainers;

  const handleSave = (data: Partial<TrainerUI> & { id?: number }) => {
    const payload = trainerUIToApiPayload(data);
    if (data.id) {
      updateTrainer.mutate({ id: data.id, payload }, {
        onSuccess: () => toast({ title: t("trainers") + " updated", description: data.name }),
        onError: (e) => toast({ title: "Error", description: e.message, variant: "destructive" }),
      });
    } else {
      createTrainer.mutate(payload, {
        onSuccess: () => toast({ title: t("addTrainer"), description: data.name }),
        onError: (e) => toast({ title: "Error", description: e.message, variant: "destructive" }),
      });
    }
    setFormOpen(false);
  };

  const handleDelete = (trainer: TrainerUI) => {
    if (!confirm(t("remove") + " " + trainer.name + "?")) return;
    deleteTrainer.mutate(trainer.id, {
      onSuccess: () => toast({ title: t("remove"), description: trainer.name, variant: "destructive" }),
      onError: (e) => toast({ title: "Error", description: e.message, variant: "destructive" }),
    });
  };

  const openEdit = (trainer: TrainerUI) => { setEditingTrainer(trainer); setFormOpen(true); };
  const openAdd = () => { setEditingTrainer(null); setFormOpen(true); };
  const openDetail = (trainer: TrainerUI) => { setDetailTrainer(trainer); setDetailOpen(true); };

  const statusCounts = {
    All: trainers.length,
    Active: trainers.filter((tr) => tr.status === "Active").length,
    "On Leave": trainers.filter((tr) => tr.status === "On Leave").length,
    Inactive: trainers.filter((tr) => tr.status === "Inactive").length,
  };

  const statusLabels: Record<StatusFilter, string> = {
    All: t("all"), Active: t("active"), "On Leave": t("onLeave"), Inactive: t("inactive"),
  };

  const totalMembers = trainers.reduce((a, tr) => a + tr.membersCount, 0);
  const totalPending = 0; // No commissions API yet

  return (
    <DashboardLayout>
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-display font-bold mb-1">{t("trainersTitle")}</h1>
          <p className="text-muted-foreground">{t("trainersDescription")}</p>
        </div>
        <Button variant="hero" className="gap-2" onClick={openAdd}>
          <Plus className="w-4 h-4" /> {t("addTrainer")}
        </Button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        {[
          { icon: UserCog, label: t("activeTrainers"), value: statusCounts.Active, color: "text-success" },
          { icon: Users, label: t("totalAssigned"), value: totalMembers, color: "text-primary" },
          { icon: DollarSign, label: t("pendingPayouts"), value: `${totalPending.toLocaleString()} EGP`, color: "text-primary" },
          { icon: Award, label: t("certifications"), value: trainers.reduce((a, tr) => a + tr.certifications.length, 0), color: "text-info" },
        ].map((stat) => (
          <div key={stat.label} className="rounded-xl border border-border bg-card p-4">
            <div className="flex items-center gap-2 mb-1">
              <stat.icon className={cn("w-4 h-4", stat.color)} />
              <span className="text-xs text-muted-foreground">{stat.label}</span>
            </div>
            <p className="text-xl font-bold">{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 mb-6">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground rtl:left-auto rtl:right-3" />
          <Input placeholder={t("searchTrainers")} value={search} onChange={(e) => setSearch(e.target.value)} className="ps-9" />
        </div>
        <div className="flex items-center gap-1 flex-wrap">
          {statusFilters.map((s) => (
            <button key={s} onClick={() => setStatusFilter(s)} className={cn(
              "px-3 py-1.5 rounded-lg text-xs font-medium transition-colors",
              statusFilter === s ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:text-foreground"
            )}>
              {statusLabels[s]} ({statusCounts[s]})
            </button>
          ))}
        </div>
      </div>

      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="rounded-xl border border-border bg-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/50">
                <th className="text-start font-medium text-muted-foreground px-6 py-3">{t("name")}</th>
                <th className="text-start font-medium text-muted-foreground px-6 py-3 hidden sm:table-cell">{t("specialty")}</th>
                <th className="text-start font-medium text-muted-foreground px-6 py-3">{t("status")}</th>
                <th className="text-start font-medium text-muted-foreground px-6 py-3 hidden md:table-cell">{t("members")}</th>
                <th className="text-start font-medium text-muted-foreground px-6 py-3 hidden md:table-cell">{t("schedule")}</th>
                <th className="text-start font-medium text-muted-foreground px-6 py-3 hidden lg:table-cell">{t("commission")}</th>
                <th className="text-end font-medium text-muted-foreground px-6 py-3 w-12"></th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr><td colSpan={7} className="px-6 py-12 text-center text-muted-foreground">Loading…</td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={7} className="px-6 py-12 text-center text-muted-foreground">{t("noTrainersFound")}</td></tr>
              ) : (
                filtered.map((trainer) => (
                  <tr key={trainer.id} className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors cursor-pointer" onClick={() => openDetail(trainer)}>
                    <td className="px-6 py-4">
                      <p className="font-medium">{trainer.name}</p>
                      <p className="text-xs text-muted-foreground sm:hidden">{trainer.specialty}</p>
                    </td>
                    <td className="px-6 py-4 text-muted-foreground hidden sm:table-cell">{trainer.specialty}</td>
                    <td className="px-6 py-4">
                      <span className={cn(
                        "inline-block px-2 py-0.5 rounded-full text-xs font-medium",
                        trainer.status === "Active" && "bg-success/10 text-success",
                        trainer.status === "On Leave" && "bg-primary/10 text-primary",
                        trainer.status === "Inactive" && "bg-destructive/10 text-destructive",
                      )}>
                        {trainer.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-muted-foreground hidden md:table-cell">
                      {trainer.membersCount} {t("members").toLowerCase()}
                    </td>
                    <td className="px-6 py-4 text-muted-foreground hidden md:table-cell">
                      {trainer.schedule?.length ? trainer.schedule.map((s) => s.day).join(", ") : "—"}
                    </td>
                    <td className="px-6 py-4 text-muted-foreground hidden lg:table-cell">{trainer.commissionRate}%</td>
                    <td className="px-6 py-4 text-end" onClick={(e) => e.stopPropagation()}>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8"><MoreHorizontal className="w-4 h-4" /></Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => openDetail(trainer)}><Eye className="w-4 h-4 me-2" /> {t("view")}</DropdownMenuItem>
                          <DropdownMenuItem onClick={() => openEdit(trainer)}><Pencil className="w-4 h-4 me-2" /> {t("edit")}</DropdownMenuItem>
                          <DropdownMenuItem className="text-destructive" onClick={() => handleDelete(trainer)}><Trash2 className="w-4 h-4 me-2" /> {t("remove")}</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        <div className="px-6 py-3 border-t border-border bg-muted/30 text-xs text-muted-foreground">
          {t("showing")} {filtered.length} {t("of")} {trainers.length} {t("trainers").toLowerCase()}
        </div>
      </motion.div>

      <TrainerFormDialog open={formOpen} onOpenChange={setFormOpen} trainer={editingTrainer} onSave={handleSave} />
      <TrainerDetailSheet open={detailOpen} onOpenChange={setDetailOpen} trainer={detailTrainer} commissions={[]} onEdit={openEdit} />
    </DashboardLayout>
  );
};

export default TrainersPage;
