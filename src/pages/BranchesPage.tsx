import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import {
  apiBranchToBranchUI,
  branchUIToApiPayload,
  type ApiBranch,
  type BranchUI,
} from "@/types/api";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import StatCard from "@/components/dashboard/StatCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Building2, Plus, MapPin, Phone, Mail, Clock, Users, UserCog,
  DollarSign, Settings2, ChevronRight, Search,
} from "lucide-react";
import { egyptianCities, facilities as allFacilities } from "@/data/branches";
import { useLanguage } from "@/i18n/LanguageContext";
import { useToast } from "@/hooks/use-toast";

const statusColor: Record<string, string> = {
  Active: "bg-success/10 text-success border-success/20",
  "Under Maintenance": "bg-warning/10 text-warning border-warning/20",
  Closed: "bg-destructive/10 text-destructive border-destructive/20",
};

const BranchesPage = () => {
  const [search, setSearch] = useState("");
  const [selectedBranch, setSelectedBranch] = useState<BranchUI | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editBranch, setEditBranch] = useState<Partial<BranchUI>>({});
  const { t, isRTL } = useLanguage();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: branchesList = [], isLoading } = useQuery({
    queryKey: ["branches", search],
    queryFn: async () => {
      const params = search ? `?search=${encodeURIComponent(search)}` : "";
      const res = await api.get<ApiBranch[] | { data: ApiBranch[] }>(`/branches${params}`);
      const list = Array.isArray(res) ? res : (res as { data: ApiBranch[] }).data ?? [];
      return list.map(apiBranchToBranchUI);
    },
  });

  const { data: trainersList = [] } = useQuery({
    queryKey: ["trainers"],
    queryFn: async () => {
      const res = await api.get<{ id: number; name: string; specialty?: string }[] | { data: { id: number; name: string }[] }>("/trainers");
      return Array.isArray(res) ? res : (res as { data: { id: number; name: string }[] }).data ?? [];
    },
  });

  const createBranch = useMutation({
    mutationFn: (payload: Record<string, unknown>) => api.post<ApiBranch>("/branches", payload),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["branches"] }); setEditBranch({}); setDialogOpen(false); },
  });
  const updateBranch = useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: Record<string, unknown> }) =>
      api.put<ApiBranch>(`/branches/${id}`, payload),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["branches"] }); setEditBranch({}); setDialogOpen(false); },
  });

  const branches = branchesList;
  const filtered = branches;
  const totalMembers = branches.reduce((s, b) => s + b.currentMembers, 0);
  const totalRevenue = branches.reduce((s, b) => s + b.monthlyRevenue, 0);
  const activeCount = branches.filter((b) => b.status === "Active").length;

  const openAdd = () => { setEditBranch({ status: "Active", trainerIds: [], facilities: [] }); setDialogOpen(true); };
  const openEdit = (b: BranchUI) => { setEditBranch({ ...b }); setDialogOpen(true); };

  const saveBranch = () => {
    if (!editBranch.name || !editBranch.city) return;
    const payload = branchUIToApiPayload(editBranch);
    if (editBranch.id) {
      updateBranch.mutate(
        { id: editBranch.id, payload },
        { onSuccess: () => toast({ title: t("saveChanges") }), onError: (e) => toast({ title: "Error", description: e.message, variant: "destructive" }) }
      );
    } else {
      createBranch.mutate(payload, {
        onSuccess: () => toast({ title: t("addBranch") }),
        onError: (e) => toast({ title: "Error", description: e.message, variant: "destructive" }),
      });
    }
  };

  const toggleFacility = (f: string) => {
    const current = editBranch.facilities ?? [];
    setEditBranch({ ...editBranch, facilities: current.includes(f) ? current.filter((x) => x !== f) : [...current, f] });
  };
  const toggleTrainer = (id: number) => {
    const current = editBranch.trainerIds ?? [];
    setEditBranch({ ...editBranch, trainerIds: current.includes(id) ? current.filter((x) => x !== id) : [...current, id] });
  };

  const statusLabels: Record<string, string> = {
    Active: t("active"), "Under Maintenance": t("underMaintenance"), Closed: t("closed"),
  };

  return (
    <DashboardLayout>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-display font-bold mb-1">{t("branchesTitle")}</h1>
          <p className="text-muted-foreground">{t("branchesDescription")}</p>
        </div>
        <Button onClick={openAdd} className="gap-2"><Plus className="w-4 h-4" /> {t("addBranch")}</Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard title={t("totalBranches")} value={String(branches.length)} icon={Building2} />
        <StatCard title={t("activeLocations")} value={String(activeCount)} icon={MapPin} />
        <StatCard title={t("totalMembers")} value={totalMembers.toLocaleString()} icon={Users} />
        <StatCard title={t("monthlyRevenue")} value={`${(totalRevenue / 1000).toFixed(0)}K EGP`} icon={DollarSign} />
      </div>

      <div className="relative mb-6 max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground rtl:left-auto rtl:right-3" />
        <Input placeholder={t("searchBranches")} value={search} onChange={(e) => setSearch(e.target.value)} className="ps-9" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {isLoading ? (
          <div className="col-span-full py-12 text-center text-muted-foreground">Loading…</div>
        ) : (
        filtered.map((branch) => {
          const manager = branch.manager;
          const trainers = branch.trainers ?? [];
          const occupancy = branch.capacity > 0 ? (branch.currentMembers / branch.capacity) * 100 : 0;
          return (
            <Card key={branch.id} className="hover:shadow-lg transition-shadow cursor-pointer group" onClick={() => setSelectedBranch(branch)}>
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                      <Building2 className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <CardTitle className="text-base">{branch.name}</CardTitle>
                      <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5"><MapPin className="w-3 h-3" /> {branch.city}</p>
                    </div>
                  </div>
                  <Badge variant="outline" className={statusColor[branch.status] ?? ""}>{statusLabels[branch.status] ?? branch.status}</Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-1.5">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">{t("occupancy")}</span>
                    <span className="font-medium">{branch.currentMembers}/{branch.capacity}</span>
                  </div>
                  <Progress value={occupancy} className="h-2" />
                </div>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div><p className="text-muted-foreground text-xs">{t("manager")}</p><p className="font-medium truncate">{manager?.name ?? t("unassigned")}</p></div>
                  <div><p className="text-muted-foreground text-xs">{t("trainers")}</p><p className="font-medium">{trainers.length} {t("assigned")}</p></div>
                  <div><p className="text-muted-foreground text-xs">{t("revenueMo")}</p><p className="font-medium">{branch.monthlyRevenue > 0 ? `${(branch.monthlyRevenue / 1000).toFixed(0)}K EGP` : "—"}</p></div>
                  <div><p className="text-muted-foreground text-xs">{t("hours")}</p><p className="font-medium truncate">{branch.openingHours || "—"}</p></div>
                </div>
                <div className="flex items-center justify-between pt-2 border-t border-border">
                  <div className="flex flex-wrap gap-1">
                    {branch.facilities.slice(0, 3).map((f) => <Badge key={f} variant="secondary" className="text-[10px] px-1.5 py-0">{f}</Badge>)}
                    {branch.facilities.length > 3 && <Badge variant="secondary" className="text-[10px] px-1.5 py-0">+{branch.facilities.length - 3}</Badge>}
                  </div>
                  <ChevronRight className={`w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors ${isRTL ? "rotate-180" : ""}`} />
                </div>
              </CardContent>
            </Card>
          );
        })
        )}
      </div>

      {/* Detail Sheet */}
      <Sheet open={!!selectedBranch} onOpenChange={() => setSelectedBranch(null)}>
        <SheetContent className="sm:max-w-lg overflow-y-auto">
          {selectedBranch && (
            <>
              <SheetHeader>
                <div className="flex items-center justify-between">
                  <SheetTitle>{selectedBranch.name}</SheetTitle>
                  <Badge variant="outline" className={statusColor[selectedBranch.status] ?? ""}>{statusLabels[selectedBranch.status] ?? selectedBranch.status}</Badge>
                </div>
              </SheetHeader>
              <div className="mt-6 space-y-6">
                <div className="space-y-3">
                  <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">{t("contact")}</h3>
                  <div className="space-y-2 text-sm">
                    <p className="flex items-center gap-2"><MapPin className="w-4 h-4 text-muted-foreground" /> {selectedBranch.address}, {selectedBranch.city}</p>
                    <p className="flex items-center gap-2"><Phone className="w-4 h-4 text-muted-foreground" /> {selectedBranch.phone}</p>
                    <p className="flex items-center gap-2"><Mail className="w-4 h-4 text-muted-foreground" /> {selectedBranch.email}</p>
                    <p className="flex items-center gap-2"><Clock className="w-4 h-4 text-muted-foreground" /> {selectedBranch.openingHours}</p>
                  </div>
                </div>
                <Separator />
                <div className="space-y-3">
                  <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">{t("capacityRevenue")}</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="rounded-lg bg-muted/50 p-3 text-center"><p className="text-2xl font-bold">{selectedBranch.currentMembers}</p><p className="text-xs text-muted-foreground">{t("currentMembers")}</p></div>
                    <div className="rounded-lg bg-muted/50 p-3 text-center"><p className="text-2xl font-bold">{selectedBranch.capacity}</p><p className="text-xs text-muted-foreground">{t("maxCapacity")}</p></div>
                  </div>
                  <Progress value={selectedBranch.capacity > 0 ? (selectedBranch.currentMembers / selectedBranch.capacity) * 100 : 0} className="h-2" />
                  <p className="text-sm text-muted-foreground">{t("monthlyRevenue")}: <span className="font-semibold text-foreground">{selectedBranch.monthlyRevenue.toLocaleString()} EGP</span></p>
                </div>
                <Separator />
                <div className="space-y-3">
                  <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">{t("staff")}</h3>
                  <div className="flex items-center gap-3 rounded-lg bg-muted/50 p-3">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center"><UserCog className="w-4 h-4 text-primary" /></div>
                    <div><p className="text-sm font-medium">{selectedBranch.manager?.name ?? t("noManagerAssigned")}</p><p className="text-xs text-muted-foreground">{t("branchManager")}</p></div>
                  </div>
                  <div className="space-y-2">
                    {(selectedBranch.trainers ?? []).map((tr) => (
                      <div key={tr.id} className="flex items-center justify-between rounded-lg border border-border p-3">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center text-xs font-semibold">{tr.name.split(" ").pop()?.[0]}</div>
                          <div><p className="text-sm font-medium">{tr.name}</p></div>
                        </div>
                      </div>
                    ))}
                    {(selectedBranch.trainers?.length ?? 0) === 0 && <p className="text-sm text-muted-foreground text-center py-4">{t("noTrainersAssigned")}</p>}
                  </div>
                </div>
                <Separator />
                <div className="space-y-3">
                  <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">{t("facilitiesLabel")}</h3>
                  <div className="flex flex-wrap gap-2">{(selectedBranch.facilities ?? []).map((f) => <Badge key={f} variant="outline">{f}</Badge>)}</div>
                </div>
                <Separator />
                <Button className="w-full gap-2" variant="outline" onClick={() => { openEdit(selectedBranch); setSelectedBranch(null); }}>
                  <Settings2 className="w-4 h-4" /> {t("editBranch")}
                </Button>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>

      {/* Add / Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
          <DialogHeader><DialogTitle>{editBranch.id ? t("editBranch") : t("addNewBranch")}</DialogTitle></DialogHeader>
          <div className="space-y-4 pt-2">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><Label>{t("branchName")} *</Label><Input value={editBranch.name ?? ""} onChange={(e) => setEditBranch({ ...editBranch, name: e.target.value })} /></div>
              <div className="space-y-2"><Label>{t("city")} *</Label>
                <Select value={editBranch.city ?? ""} onValueChange={(v) => setEditBranch({ ...editBranch, city: v })}>
                  <SelectTrigger><SelectValue placeholder={t("city")} /></SelectTrigger>
                  <SelectContent>{egyptianCities.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2"><Label>{t("address")}</Label><Input value={editBranch.address ?? ""} onChange={(e) => setEditBranch({ ...editBranch, address: e.target.value })} /></div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><Label>{t("phone")}</Label><Input value={editBranch.phone ?? ""} onChange={(e) => setEditBranch({ ...editBranch, phone: e.target.value })} /></div>
              <div className="space-y-2"><Label>{t("email")}</Label><Input value={editBranch.email ?? ""} onChange={(e) => setEditBranch({ ...editBranch, email: e.target.value })} /></div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><Label>{t("openingHours")}</Label><Input value={editBranch.openingHours ?? ""} onChange={(e) => setEditBranch({ ...editBranch, openingHours: e.target.value })} /></div>
              <div className="space-y-2"><Label>{t("capacity")}</Label><Input type="number" value={editBranch.capacity ?? ""} onChange={(e) => setEditBranch({ ...editBranch, capacity: parseInt(e.target.value) || 0 })} /></div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><Label>{t("status")}</Label>
                <Select value={editBranch.status ?? "Active"} onValueChange={(v) => setEditBranch({ ...editBranch, status: v as Branch["status"] })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Active">{t("active")}</SelectItem>
                    <SelectItem value="Under Maintenance">{t("underMaintenance")}</SelectItem>
                    <SelectItem value="Closed">{t("closed")}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2"><Label>{t("branchManager")}</Label>
                <Select value={editBranch.managerId?.toString() ?? "none"} onValueChange={(v) => setEditBranch({ ...editBranch, managerId: v === "none" ? null : parseInt(v) })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">{t("unassigned")}</SelectItem>
                    {trainersList.map((tr) => <SelectItem key={tr.id} value={tr.id.toString()}>{tr.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <Separator />
            <div className="space-y-2"><Label>{t("assignTrainers")}</Label>
              <div className="grid grid-cols-2 gap-2">
                {trainersList.map((tr) => (
                  <label key={tr.id} className="flex items-center gap-2 rounded-lg border border-border p-2 cursor-pointer hover:bg-muted/50 transition-colors">
                    <Checkbox checked={(editBranch.trainerIds ?? []).includes(tr.id)} onCheckedChange={() => toggleTrainer(tr.id)} />
                    <div><p className="text-sm font-medium">{tr.name}</p></div>
                  </label>
                ))}
              </div>
            </div>
            <Separator />
            <div className="space-y-2"><Label>{t("facilitiesLabel")}</Label>
              <div className="grid grid-cols-2 gap-2">
                {allFacilities.map((f) => (
                  <label key={f} className="flex items-center gap-2 text-sm cursor-pointer">
                    <Checkbox checked={(editBranch.facilities ?? []).includes(f)} onCheckedChange={() => toggleFacility(f)} />
                    {f}
                  </label>
                ))}
              </div>
            </div>
            <Button onClick={saveBranch} className="w-full">{editBranch.id ? t("saveChanges") : t("addBranch")}</Button>
          </div>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
};

export default BranchesPage;
