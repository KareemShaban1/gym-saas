import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type { ApiGymPlan } from "@/types/api";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Pencil, Trash2, CreditCard } from "lucide-react";
import { useLanguage } from "@/i18n/LanguageContext";
import { useToast } from "@/hooks/use-toast";

const planTypeLabels: Record<string, string> = {
  monthly: "Monthly",
  coin: "Coin-based",
  bundle: "Bundle",
};

const planTierLabels: Record<string, string> = {
  basic: "Basic",
  pro: "Pro",
  vip: "VIP",
};

const PlansPage = () => {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState<Partial<ApiGymPlan> | null>(null);
  const { t } = useLanguage();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: plans = [], isLoading } = useQuery({
    queryKey: ["gym-plans"],
    queryFn: async () => {
      const res = await api.get<ApiGymPlan[] | { data: ApiGymPlan[] }>("/gym-plans");
      return Array.isArray(res) ? res : (res as { data: ApiGymPlan[] }).data ?? [];
    },
  });

  const createPlan = useMutation({
    mutationFn: (payload: Record<string, unknown>) => api.post<ApiGymPlan>("/gym-plans", payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["gym-plans"] });
      setEditingPlan(null);
      setDialogOpen(false);
    },
  });

  const updatePlan = useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: Record<string, unknown> }) =>
      api.put<ApiGymPlan>(`/gym-plans/${id}`, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["gym-plans"] });
      setEditingPlan(null);
      setDialogOpen(false);
    },
  });

  const deletePlan = useMutation({
    mutationFn: (id: number) => api.delete(`/gym-plans/${id}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["gym-plans"] }),
  });

  const openAdd = () => {
    setEditingPlan({
      name: "",
      price: null,
      plan_type: "monthly",
      plan_tier: "basic",
      coin_package: null,
      bundle_months: null,
      sort_order: 0,
    });
    setDialogOpen(true);
  };

  const openEdit = (p: ApiGymPlan) => {
    setEditingPlan({
      id: p.id,
      name: p.name,
      price: p.price ?? undefined,
      plan_type: p.plan_type,
      plan_tier: p.plan_tier ?? undefined,
      coin_package: p.coin_package ?? undefined,
      bundle_months: p.bundle_months ?? undefined,
      sort_order: p.sort_order ?? 0,
    });
    setDialogOpen(true);
  };

  const savePlan = () => {
    if (!editingPlan?.name || !editingPlan?.plan_type) return;
    const payload: Record<string, unknown> = {
      name: editingPlan.name,
      price: editingPlan.price != null && editingPlan.price !== "" ? Number(editingPlan.price) : null,
      plan_type: editingPlan.plan_type,
      plan_tier: editingPlan.plan_tier || null,
      coin_package: editingPlan.plan_type === "coin" ? (editingPlan.coin_package ?? null) : null,
      bundle_months: editingPlan.plan_type === "bundle" ? (editingPlan.bundle_months ?? null) : null,
      sort_order: editingPlan.sort_order ?? 0,
    };
    if (editingPlan.id) {
      updatePlan.mutate(
        { id: editingPlan.id, payload },
        {
          onSuccess: () => toast({ title: "Plan updated" }),
          onError: (e) => toast({ title: "Error", description: e.message, variant: "destructive" }),
        }
      );
    } else {
      createPlan.mutate(payload, {
        onSuccess: () => toast({ title: "Plan added" }),
        onError: (e) => toast({ title: "Error", description: e.message, variant: "destructive" }),
      });
    }
  };

  const handleDelete = (id: number, name: string) => {
    if (!window.confirm(`Delete plan "${name}"? Members on this plan will keep their current data but will no longer be linked to this plan.`)) return;
    deletePlan.mutate(id, {
      onSuccess: () => toast({ title: "Plan deleted" }),
      onError: (e) => toast({ title: "Error", description: e.message, variant: "destructive" }),
    });
  };

  const planLabel = (p: ApiGymPlan) => {
    const type = planTypeLabels[p.plan_type] ?? p.plan_type;
    if (p.plan_type === "monthly" || p.plan_type === "bundle") {
      const tier = p.plan_tier ? ` ${planTierLabels[p.plan_tier] ?? p.plan_tier}` : "";
      const extra = p.plan_type === "bundle" && p.bundle_months ? ` (${p.bundle_months} mo)` : "";
      return `${p.name} — ${type}${tier}${extra}`;
    }
    if (p.plan_type === "coin" && p.coin_package != null) {
      return `${p.name} — ${type} (${p.coin_package} coins)`;
    }
    return `${p.name} — ${type}`;
  };

  return (
    <DashboardLayout>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-display font-bold mb-1">Subscription Plans</h1>
          <p className="text-muted-foreground">
            Define the plans you offer to members (Monthly, Coin-based, Bundle). These appear when adding or editing a member.
          </p>
        </div>
        <Button onClick={openAdd} className="gap-2">
          <Plus className="w-4 h-4" /> Add Plan
        </Button>
      </div>

      {isLoading ? (
        <p className="text-muted-foreground">Loading plans…</p>
      ) : plans.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <CreditCard className="w-12 h-12 text-muted-foreground mb-4" />
            <h3 className="font-semibold text-lg mb-1">No plans yet</h3>
            <p className="text-muted-foreground text-sm mb-4 max-w-md">
              Create subscription plans (e.g. Monthly Basic, Pro Bundle 6 months, Coin 50) so you can assign them to members when adding or editing.
            </p>
            <Button onClick={openAdd} className="gap-2"><Plus className="w-4 h-4" /> Add your first plan</Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {plans.map((p) => (
            <Card key={p.id}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-base">{p.name}</CardTitle>
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="icon" onClick={() => openEdit(p)}><Pencil className="w-4 h-4" /></Button>
                  <Button variant="ghost" size="icon" onClick={() => handleDelete(p.id, p.name)}><Trash2 className="w-4 h-4 text-destructive" /></Button>
                </div>
              </CardHeader>
              <CardContent>
                {p.price != null && Number(p.price) > 0 && (
                  <p className="text-sm font-semibold text-primary mb-2">
                    {Number(p.price).toLocaleString()} EGP
                  </p>
                )}
                <div className="flex flex-wrap gap-2">
                  <Badge variant="secondary">{planTypeLabels[p.plan_type] ?? p.plan_type}</Badge>
                  {(p.plan_type === "monthly" || p.plan_type === "bundle") && p.plan_tier && (
                    <Badge variant="outline">{planTierLabels[p.plan_tier] ?? p.plan_tier}</Badge>
                  )}
                  {p.plan_type === "bundle" && p.bundle_months != null && (
                    <Badge variant="outline">{p.bundle_months} months</Badge>
                  )}
                  {p.plan_type === "coin" && p.coin_package != null && (
                    <Badge variant="outline">{p.coin_package} coins</Badge>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{editingPlan?.id ? "Edit Plan" : "Add Plan"}</DialogTitle>
          </DialogHeader>
          {editingPlan && (
            <div className="space-y-4 pt-2">
              <div className="space-y-2">
                <Label>Plan name</Label>
                <Input
                  value={editingPlan.name ?? ""}
                  onChange={(e) => setEditingPlan((prev) => ({ ...prev, name: e.target.value }))}
                  placeholder="e.g. Monthly Basic, Coin 50, 6-Month Pro"
                />
              </div>
              <div className="space-y-2">
                <Label>Price (EGP)</Label>
                <Input
                  type="number"
                  min={0}
                  step={0.01}
                  value={editingPlan.price != null && editingPlan.price !== "" ? editingPlan.price : ""}
                  onChange={(e) => setEditingPlan((prev) => ({ ...prev, price: e.target.value ? e.target.value : null }))}
                  placeholder="e.g. 300, 500"
                />
              </div>
              <div className="space-y-2">
                <Label>Plan type</Label>
                <Select
                  value={editingPlan.plan_type ?? "monthly"}
                  onValueChange={(v) =>
                    setEditingPlan((prev) => ({
                      ...prev,
                      plan_type: v,
                      plan_tier: v === "coin" ? undefined : prev?.plan_tier ?? "basic",
                      coin_package: v === "coin" ? prev?.coin_package ?? 25 : undefined,
                      bundle_months: v === "bundle" ? prev?.bundle_months ?? 3 : undefined,
                    }))
                  }
                >
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="monthly">Monthly</SelectItem>
                    <SelectItem value="coin">Coin-based</SelectItem>
                    <SelectItem value="bundle">Bundle</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {(editingPlan.plan_type === "monthly" || editingPlan.plan_type === "bundle") && (
                <div className="space-y-2">
                  <Label>Plan tier</Label>
                  <Select
                    value={editingPlan.plan_tier ?? "basic"}
                    onValueChange={(v) => setEditingPlan((prev) => ({ ...prev, plan_tier: v }))}
                  >
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="basic">Basic</SelectItem>
                      <SelectItem value="pro">Pro</SelectItem>
                      <SelectItem value="vip">VIP</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}
              {editingPlan.plan_type === "bundle" && (
                <div className="space-y-2">
                  <Label>Bundle duration (months)</Label>
                  <Input
                    type="number"
                    min={1}
                    value={editingPlan.bundle_months ?? ""}
                    onChange={(e) => setEditingPlan((prev) => ({ ...prev, bundle_months: e.target.value ? parseInt(e.target.value, 10) : undefined }))}
                    placeholder="e.g. 3, 6, 12"
                  />
                </div>
              )}
              {editingPlan.plan_type === "coin" && (
                <div className="space-y-2">
                  <Label>Coin package size</Label>
                  <Input
                    type="number"
                    min={0}
                    value={editingPlan.coin_package ?? ""}
                    onChange={(e) => setEditingPlan((prev) => ({ ...prev, coin_package: e.target.value ? parseInt(e.target.value, 10) : undefined }))}
                    placeholder="e.g. 25, 50, 100"
                  />
                </div>
              )}
              <div className="flex justify-end gap-2 pt-2">
                <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
                <Button onClick={savePlan} disabled={!editingPlan.name}>Save</Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
};

export default PlansPage;
