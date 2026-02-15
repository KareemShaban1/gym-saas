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
import { Badge } from "@/components/ui/badge";
import { Receipt, Plus, Pencil } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";

interface Gym {
  id: number;
  name: string;
  email?: string;
}

interface Plan {
  id: number;
  name: string;
  price: number;
  interval: string;
}

interface Subscription {
  id: number;
  gym_id: number;
  subscription_plan_id: number;
  status: string;
  trial_ends_at: string | null;
  starts_at: string | null;
  ends_at: string | null;
  gym?: Gym;
  plan?: Plan;
}

const SUB_STATUSES = ["trial", "active", "past_due", "cancelled", "expired"] as const;

export default function SubscriptionsPage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Subscription | null>(null);
  const [form, setForm] = useState({
    gym_id: "",
    subscription_plan_id: "",
    status: "active" as string,
    starts_at: "",
    ends_at: "",
  });

  const { data: subscriptions, isLoading } = useQuery({
    queryKey: ["super-admin-subscriptions"],
    queryFn: () => api.get<Subscription[]>("/super-admin/subscriptions"),
  });

  const { data: gyms } = useQuery({
    queryKey: ["super-admin-gyms"],
    queryFn: () => api.get<Gym[]>("/super-admin/gyms"),
  });

  const { data: plans } = useQuery({
    queryKey: ["super-admin-plans"],
    queryFn: () => api.get<Plan[]>("/super-admin/subscription-plans"),
  });

  const createMutation = useMutation({
    mutationFn: (payload: { gym_id: number; subscription_plan_id: number; status: string; starts_at?: string; ends_at?: string }) =>
      api.post<Subscription>("/super-admin/subscriptions", payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["super-admin-subscriptions"] });
      setDialogOpen(false);
      resetForm();
      toast({ title: "Subscription created" });
    },
    onError: (e) => toast({ title: "Error", description: (e as Error).message, variant: "destructive" }),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: Partial<{ subscription_plan_id: number; status: string; starts_at: string; ends_at: string }> }) =>
      api.put<Subscription>(`/super-admin/subscriptions/${id}`, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["super-admin-subscriptions"] });
      setDialogOpen(false);
      setEditing(null);
      resetForm();
      toast({ title: "Subscription updated" });
    },
    onError: (e) => toast({ title: "Error", description: (e as Error).message, variant: "destructive" }),
  });

  const resetForm = () => {
    setForm({
      gym_id: "",
      subscription_plan_id: "",
      status: "active",
      starts_at: "",
      ends_at: "",
    });
  };

  const openCreate = () => {
    setEditing(null);
    resetForm();
    setDialogOpen(true);
  };

  const openEdit = (sub: Subscription) => {
    setEditing(sub);
    setForm({
      gym_id: String(sub.gym_id),
      subscription_plan_id: String(sub.subscription_plan_id),
      status: sub.status,
      starts_at: sub.starts_at ? sub.starts_at.slice(0, 10) : "",
      ends_at: sub.ends_at ? sub.ends_at.slice(0, 10) : "",
    });
    setDialogOpen(true);
  };

  const handleSubmit = () => {
    const gymId = Number(form.gym_id);
    const planId = Number(form.subscription_plan_id);
    if (!gymId || !planId) return;
    if (editing) {
      updateMutation.mutate({
        id: editing.id,
        payload: {
          subscription_plan_id: planId,
          status: form.status,
          starts_at: form.starts_at || undefined,
          ends_at: form.ends_at || undefined,
        },
      });
    } else {
      createMutation.mutate({
        gym_id: gymId,
        subscription_plan_id: planId,
        status: form.status,
        starts_at: form.starts_at || undefined,
        ends_at: form.ends_at || undefined,
      });
    }
  };

  return (
    <SuperAdminLayout>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-display font-bold">Gym subscriptions & payments</h1>
          <p className="text-muted-foreground">Manage which plan each gym is on and subscription status</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={openCreate}>
              <Plus className="w-4 h-4 mr-2" />
              Add subscription
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editing ? "Edit subscription" : "New subscription"}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Gym</Label>
                <Select value={form.gym_id} onValueChange={(v) => setForm((f) => ({ ...f, gym_id: v }))} disabled={!!editing}>
                  <SelectTrigger><SelectValue placeholder="Select gym" /></SelectTrigger>
                  <SelectContent>
                    {(gyms ?? []).map((g) => (
                      <SelectItem key={g.id} value={String(g.id)}>{g.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Plan</Label>
                <Select value={form.subscription_plan_id} onValueChange={(v) => setForm((f) => ({ ...f, subscription_plan_id: v }))}>
                  <SelectTrigger><SelectValue placeholder="Select plan" /></SelectTrigger>
                  <SelectContent>
                    {(plans ?? []).map((p) => (
                      <SelectItem key={p.id} value={String(p.id)}>{p.name} (${p.price}/{p.interval})</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Status</Label>
                <Select value={form.status} onValueChange={(v) => setForm((f) => ({ ...f, status: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {SUB_STATUSES.map((s) => (
                      <SelectItem key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1).replace("_", " ")}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>Starts at</Label>
                  <Input type="date" value={form.starts_at} onChange={(e) => setForm((f) => ({ ...f, starts_at: e.target.value }))} />
                </div>
                <div>
                  <Label>Ends at</Label>
                  <Input type="date" value={form.ends_at} onChange={(e) => setForm((f) => ({ ...f, ends_at: e.target.value }))} />
                </div>
              </div>
              <Button className="w-full" onClick={handleSubmit} disabled={createMutation.isPending || updateMutation.isPending || (!editing && !form.gym_id) || !form.subscription_plan_id}>
                {editing ? "Update" : "Create"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-8 text-center text-muted-foreground">Loading…</div>
          ) : (
            <div className="divide-y">
              {(subscriptions ?? []).map((sub) => (
                <div key={sub.id} className="flex items-center justify-between p-4 hover:bg-muted/30 gap-4 flex-wrap">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                      <Receipt className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium">{sub.gym?.name ?? `Gym #${sub.gym_id}`}</p>
                      <p className="text-sm text-muted-foreground">
                        {sub.plan?.name ?? `Plan #${sub.subscription_plan_id}`}
                        {sub.plan && (
                          <span className="ml-1"> · ${sub.plan.price}/{sub.plan.interval}</span>
                        )}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    {sub.starts_at && <span className="text-sm text-muted-foreground">From {format(new Date(sub.starts_at), "dd MMM yyyy")}</span>}
                    {sub.ends_at && <span className="text-sm text-muted-foreground">To {format(new Date(sub.ends_at), "dd MMM yyyy")}</span>}
                    <Badge variant={sub.status === "active" || sub.status === "trial" ? "default" : "secondary"}>{sub.status}</Badge>
                    <Button variant="ghost" size="sm" onClick={() => openEdit(sub)}><Pencil className="w-4 h-4 mr-1" /> Edit</Button>
                  </div>
                </div>
              ))}
              {(!subscriptions || subscriptions.length === 0) && (
                <div className="p-8 text-center text-muted-foreground">No subscriptions yet. Add one to assign a plan to a gym.</div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </SuperAdminLayout>
  );
}
