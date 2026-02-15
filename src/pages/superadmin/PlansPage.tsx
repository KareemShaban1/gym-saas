import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import SuperAdminLayout from "@/components/superadmin/SuperAdminLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CreditCard, Plus, Pencil, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface Plan {
  id: number;
  name: string;
  slug: string;
  price: number;
  interval: string;
  description: string | null;
  features: string[] | null;
  is_active: boolean;
  sort_order?: number;
}

const defaultForm = {
  name: "",
  description: "",
  price: "",
  interval: "monthly" as "monthly" | "yearly",
  is_active: true,
  sort_order: 0,
  featuresText: "",
};

export default function PlansPage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState<Plan | null>(null);
  const [form, setForm] = useState(defaultForm);
  const [deleteId, setDeleteId] = useState<number | null>(null);

  const { data: plans, isLoading } = useQuery({
    queryKey: ["super-admin-plans"],
    queryFn: () => api.get<Plan[]>("/super-admin/subscription-plans"),
  });

  const createMutation = useMutation({
    mutationFn: (payload: { name: string; description?: string; price: number; interval: string; is_active: boolean; sort_order: number; features?: string[] }) =>
      api.post<Plan>("/super-admin/subscription-plans", payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["super-admin-plans"] });
      setDialogOpen(false);
      setForm(defaultForm);
      setEditingPlan(null);
      toast({ title: "Plan created" });
    },
    onError: (e) => toast({ title: "Error", description: (e as Error).message, variant: "destructive" }),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: Partial<{ name: string; description: string; price: number; interval: string; is_active: boolean; sort_order: number; features: string[] }> }) =>
      api.put<Plan>(`/super-admin/subscription-plans/${id}`, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["super-admin-plans"] });
      setDialogOpen(false);
      setForm(defaultForm);
      setEditingPlan(null);
      toast({ title: "Plan updated" });
    },
    onError: (e) => toast({ title: "Error", description: (e as Error).message, variant: "destructive" }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => api.delete(`/super-admin/subscription-plans/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["super-admin-plans"] });
      setDeleteId(null);
      toast({ title: "Plan deleted", variant: "destructive" });
    },
    onError: (e) => toast({ title: "Error", description: (e as Error).message, variant: "destructive" }),
  });

  const openCreate = () => {
    setEditingPlan(null);
    setForm(defaultForm);
    setDialogOpen(true);
  };

  const openEdit = (plan: Plan) => {
    setEditingPlan(plan);
    setForm({
      name: plan.name,
      description: plan.description ?? "",
      price: String(plan.price),
      interval: plan.interval as "monthly" | "yearly",
      is_active: plan.is_active,
      sort_order: plan.sort_order ?? 0,
      featuresText: (plan.features ?? []).join("\n"),
    });
    setDialogOpen(true);
  };

  const handleSubmit = () => {
    const price = Number(form.price);
    if (!form.name || Number.isNaN(price) || price < 0) return;
    const features = form.featuresText.trim() ? form.featuresText.trim().split(/\n/).map((s) => s.trim()).filter(Boolean) : undefined;
    if (editingPlan) {
      updateMutation.mutate({
        id: editingPlan.id,
        payload: {
          name: form.name,
          description: form.description || undefined,
          price,
          interval: form.interval,
          is_active: form.is_active,
          sort_order: form.sort_order,
          features,
        },
      });
    } else {
      createMutation.mutate({
        name: form.name,
        description: form.description || undefined,
        price,
        interval: form.interval,
        is_active: form.is_active,
        sort_order: form.sort_order,
        features,
      });
    }
  };

  return (
    <SuperAdminLayout>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-display font-bold">Subscription plans</h1>
          <p className="text-muted-foreground">Manage plans available to gyms</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={openCreate}>
              <Plus className="w-4 h-4 mr-2" />
              Add plan
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingPlan ? "Edit plan" : "New plan"}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Name</Label>
                <Input value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} placeholder="Pro Monthly" />
              </div>
              <div>
                <Label>Description</Label>
                <Input value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} placeholder="Optional" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>Price</Label>
                  <Input type="number" min={0} step={0.01} value={form.price} onChange={(e) => setForm((f) => ({ ...f, price: e.target.value }))} placeholder="0" />
                </div>
                <div>
                  <Label>Interval</Label>
                  <Select value={form.interval} onValueChange={(v) => setForm((f) => ({ ...f, interval: v as "monthly" | "yearly" }))}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="monthly">Monthly</SelectItem>
                      <SelectItem value="yearly">Yearly</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="flex items-center gap-2">
                  <input type="checkbox" id="is_active" checked={form.is_active} onChange={(e) => setForm((f) => ({ ...f, is_active: e.target.checked }))} className="rounded border-input" />
                  <Label htmlFor="is_active">Active</Label>
                </div>
                <div>
                  <Label>Sort order</Label>
                  <Input type="number" min={0} value={form.sort_order} onChange={(e) => setForm((f) => ({ ...f, sort_order: Number(e.target.value) || 0 }))} />
                </div>
              </div>
              <div>
                <Label>Features (one per line)</Label>
                <textarea className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm" value={form.featuresText} onChange={(e) => setForm((f) => ({ ...f, featuresText: e.target.value }))} placeholder="Up to 500 members&#10;10 branches" />
              </div>
              <Button className="w-full" onClick={handleSubmit} disabled={createMutation.isPending || updateMutation.isPending}>
                {editingPlan ? "Update plan" : "Create plan"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {isLoading ? (
          <div className="col-span-full p-8 text-center text-muted-foreground">Loading…</div>
        ) : (
          (plans ?? []).map((plan) => (
            <Card key={plan.id} className="relative">
              <CardContent className="p-6">
                <div className="flex items-start justify-between gap-2 mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                      <CreditCard className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-semibold">{plan.name}</p>
                      <p className="text-2xl font-bold">
                        ${Number(plan.price)}
                        <span className="text-sm font-normal text-muted-foreground">/{plan.interval}</span>
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="icon" onClick={() => openEdit(plan)}><Pencil className="w-4 h-4" /></Button>
                    <Button variant="ghost" size="icon" onClick={() => setDeleteId(plan.id)}><Trash2 className="w-4 h-4 text-destructive" /></Button>
                  </div>
                </div>
                {plan.description && <p className="text-sm text-muted-foreground mb-3">{plan.description}</p>}
                {plan.features && plan.features.length > 0 && (
                  <ul className="text-sm space-y-1 text-muted-foreground">
                    {plan.features.map((f, i) => (
                      <li key={i}>• {f}</li>
                    ))}
                  </ul>
                )}
                {!plan.is_active && (
                  <span className="inline-block mt-3 text-xs text-amber-600 font-medium">Inactive</span>
                )}
              </CardContent>
            </Card>
          ))
        )}
      </div>

      <AlertDialog open={deleteId != null} onOpenChange={(open) => !open && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete plan?</AlertDialogTitle>
            <AlertDialogDescription>This cannot be undone. Gyms on this plan may be affected.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => deleteId != null && deleteMutation.mutate(deleteId)} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </SuperAdminLayout>
  );
}
