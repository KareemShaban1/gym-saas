import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import {
  apiMemberToMemberUI,
  memberUIToApiPayload,
  type ApiMember,
  type MemberUI,
} from "@/types/api";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import MemberFormDialog from "@/components/members/MemberFormDialog";
import MemberDetailSheet from "@/components/members/MemberDetailSheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Plus, MoreHorizontal, Eye, Pencil, Trash2, TrendingUp } from "lucide-react";
import { useNavigate } from "react-router-dom";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { motion } from "framer-motion";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/i18n/LanguageContext";

type StatusFilter = "All" | "Active" | "Expiring" | "Expired" | "Frozen";
const statusFilters: StatusFilter[] = ["All", "Active", "Expiring", "Expired", "Frozen"];

const MembersPage = () => {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("All");
  const [formOpen, setFormOpen] = useState(false);
  const [editingMember, setEditingMember] = useState<MemberUI | null>(null);
  const [detailMember, setDetailMember] = useState<MemberUI | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const { toast } = useToast();
  const { t } = useLanguage();
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const { data: membersData, isLoading: membersLoading } = useQuery({
    queryKey: ["members", search, statusFilter],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (search) params.set("search", search);
      if (statusFilter !== "All") params.set("status", statusFilter);
      const res = await api.get<ApiMember[] | { data: ApiMember[] }>(`/members?${params}`);
      const list = Array.isArray(res) ? res : (res as { data: ApiMember[] }).data ?? [];
      return list.map(apiMemberToMemberUI);
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

  const { data: gymPlansList = [] } = useQuery({
    queryKey: ["gym-plans"],
    queryFn: async () => {
      const res = await api.get<ApiGymPlan[] | { data: ApiGymPlan[] }>("/gym-plans");
      return Array.isArray(res) ? res : (res as { data: ApiGymPlan[] }).data ?? [];
    },
  });

  const createMember = useMutation({
    mutationFn: (payload: Record<string, unknown>) => api.post<ApiMember>("/members", payload),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["members"] }); setEditingMember(null); },
  });
  const updateMember = useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: Record<string, unknown> }) =>
      api.put<ApiMember>(`/members/${id}`, payload),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["members"] }); setEditingMember(null); },
  });
  const deleteMember = useMutation({
    mutationFn: (id: number) => api.delete(`/members/${id}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["members"] }),
  });

  const members = membersData ?? [];

  const filtered = members;

  const handleSave = (data: Partial<MemberUI> & { id?: number }) => {
    const payload = memberUIToApiPayload(data);
    if (data.id) {
      updateMember.mutate({ id: data.id, payload }, {
        onSuccess: () => toast({ title: t("memberUpdated"), description: data.name }),
        onError: (e) => toast({ title: "Error", description: e.message, variant: "destructive" }),
      });
    } else {
      createMember.mutate(payload, {
        onSuccess: () => toast({ title: t("memberAdded"), description: data.name }),
        onError: (e) => toast({ title: "Error", description: e.message, variant: "destructive" }),
      });
    }
    setFormOpen(false);
  };

  const handleDelete = (member: MemberUI) => {
    if (!confirm(t("remove") + " " + member.name + "?")) return;
    deleteMember.mutate(member.id, {
      onSuccess: () => toast({ title: t("memberRemoved"), description: member.name, variant: "destructive" }),
      onError: (e) => toast({ title: "Error", description: e.message, variant: "destructive" }),
    });
  };

  const handleStatusChange = (member: MemberUI, status: MemberUI["status"]) => {
    updateMember.mutate(
      { id: member.id, payload: { status } },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: ["members"] });
          setDetailMember((m) => (m?.id === member.id ? { ...m, status } : m));
          toast({ title: t("status"), description: `${member.name} → ${status}` });
        },
        onError: (e) => toast({ title: "Error", description: e.message, variant: "destructive" }),
      }
    );
  };

  const openEdit = (member: MemberUI) => { setEditingMember(member); setFormOpen(true); };
  const openAdd = () => { setEditingMember(null); setFormOpen(true); };
  const openDetail = (member: MemberUI) => { setDetailMember(member); setDetailOpen(true); };

  const getPlanLabel = (m: MemberUI) => {
    if (m.planType === "monthly") return `Monthly - ${m.planTier?.charAt(0).toUpperCase()}${m.planTier?.slice(1)}`;
    if (m.planType === "bundle") return `${m.bundleMonths}mo Bundle`;
    return "Coin Pack";
  };

  const statusCounts = {
    All: members.length,
    Active: members.filter((m) => m.status === "Active").length,
    Expiring: members.filter((m) => m.status === "Expiring").length,
    Expired: members.filter((m) => m.status === "Expired").length,
    Frozen: members.filter((m) => m.status === "Frozen").length,
  };

  const statusLabels: Record<StatusFilter, string> = {
    All: t("all"), Active: t("active"), Expiring: t("expiring"), Expired: t("expired"), Frozen: t("frozen"),
  };

  return (
    <DashboardLayout>
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-display font-bold mb-1">{t("membersTitle")}</h1>
          <p className="text-muted-foreground">{t("membersDescription")}</p>
        </div>
        <Button variant="hero" className="gap-2" onClick={openAdd}>
          <Plus className="w-4 h-4" /> {t("addMember")}
        </Button>
      </div>

      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 mb-6">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground rtl:left-auto rtl:right-3" />
          <Input placeholder={t("searchMembers")} value={search} onChange={(e) => setSearch(e.target.value)} className="ps-9" />
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
                <th className="text-start font-medium text-muted-foreground px-6 py-3 hidden sm:table-cell">{t("phone")}</th>
                <th className="text-start font-medium text-muted-foreground px-6 py-3">{t("plan")}</th>
                <th className="text-start font-medium text-muted-foreground px-6 py-3">{t("status")}</th>
                <th className="text-start font-medium text-muted-foreground px-6 py-3 hidden md:table-cell">{t("expiresCoins")}</th>
                <th className="text-start font-medium text-muted-foreground px-6 py-3 hidden lg:table-cell">{t("trainer")}</th>
                <th className="text-end font-medium text-muted-foreground px-6 py-3 w-12"></th>
              </tr>
            </thead>
            <tbody>
              {membersLoading ? (
                <tr><td colSpan={7} className="px-6 py-12 text-center text-muted-foreground">Loading…</td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={7} className="px-6 py-12 text-center text-muted-foreground">{t("noMembersFound")}</td></tr>
              ) : (
                filtered.map((member) => (
                  <tr key={member.id} className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors cursor-pointer" onClick={() => openDetail(member)}>
                    <td className="px-6 py-4">
                      <p className="font-medium">{member.name}</p>
                      <p className="text-xs text-muted-foreground sm:hidden">{member.phone}</p>
                    </td>
                    <td className="px-6 py-4 text-muted-foreground hidden sm:table-cell">{member.phone}</td>
                    <td className="px-6 py-4">{getPlanLabel(member)}</td>
                    <td className="px-6 py-4">
                      <span className={cn(
                        "inline-block px-2 py-0.5 rounded-full text-xs font-medium",
                        member.status === "Active" && "bg-success/10 text-success",
                        member.status === "Expiring" && "bg-primary/10 text-primary",
                        member.status === "Expired" && "bg-destructive/10 text-destructive",
                        member.status === "Frozen" && "bg-info/10 text-info",
                      )}>
                        {member.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-muted-foreground hidden md:table-cell">
                      {member.coinBalance != null ? `${member.coinBalance} coins` : member.expiresAt ? format(new Date(member.expiresAt), "MMM d, yyyy") : "—"}
                    </td>
                    <td className="px-6 py-4 text-muted-foreground hidden lg:table-cell">{member.trainer ?? "—"}</td>
                    <td className="px-6 py-4 text-end" onClick={(e) => e.stopPropagation()}>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8"><MoreHorizontal className="w-4 h-4" /></Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => openDetail(member)}><Eye className="w-4 h-4 me-2" /> {t("view")}</DropdownMenuItem>
                          <DropdownMenuItem onClick={() => navigate(`/dashboard/members/${member.id}/progress`)}><TrendingUp className="w-4 h-4 me-2" /> Progress</DropdownMenuItem>
                          <DropdownMenuItem onClick={() => openEdit(member)}><Pencil className="w-4 h-4 me-2" /> {t("edit")}</DropdownMenuItem>
                          <DropdownMenuItem className="text-destructive" onClick={() => handleDelete(member)}><Trash2 className="w-4 h-4 me-2" /> {t("remove")}</DropdownMenuItem>
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
          {t("showing")} {filtered.length} {t("of")} {members.length} {t("members").toLowerCase()}
        </div>
      </motion.div>

      <MemberFormDialog open={formOpen} onOpenChange={setFormOpen} member={editingMember} trainers={trainersList} gymPlans={gymPlansList} onSave={handleSave} />
      <MemberDetailSheet open={detailOpen} onOpenChange={setDetailOpen} member={detailMember} onEdit={openEdit} onStatusChange={handleStatusChange} />
    </DashboardLayout>
  );
};

export default MembersPage;
