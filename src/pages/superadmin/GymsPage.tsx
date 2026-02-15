import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import SuperAdminLayout from "@/components/superadmin/SuperAdminLayout";
import { Badge } from "@/components/ui/badge";
import { Building2 } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";

const GYM_STATUSES = ["trial", "active", "suspended", "cancelled"] as const;

interface Gym {
  id: number;
  name: string;
  email: string;
  status: string;
  created_at: string;
  active_subscription?: { status: string; plan?: { name: string } };
}

export default function GymsPage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { data: gyms, isLoading } = useQuery({
    queryKey: ["super-admin-gyms"],
    queryFn: () => api.get<Gym[]>("/super-admin/gyms"),
  });

  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status }: { id: number; status: string }) =>
      api.put<Gym>(`/super-admin/gyms/${id}`, { status }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["super-admin-gyms"] });
      queryClient.invalidateQueries({ queryKey: ["super-admin-stats"] });
      toast({ title: "Gym status updated" });
    },
    onError: (e) => toast({ title: "Error", description: (e as Error).message, variant: "destructive" }),
  });

  return (
    <SuperAdminLayout>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-display font-bold">Gyms</h1>
          <p className="text-muted-foreground">Manage all gym accounts and status</p>
        </div>
      </div>
      <div className="rounded-xl border bg-card overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center text-muted-foreground">Loading gyms…</div>
        ) : (
          <div className="divide-y">
            {(gyms ?? []).map((gym) => (
              <div key={gym.id} className="flex items-center justify-between p-4 hover:bg-muted/30 gap-4 flex-wrap">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Building2 className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium">{gym.name}</p>
                    <p className="text-sm text-muted-foreground">{gym.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  {gym.active_subscription?.plan && (
                    <span className="text-sm text-muted-foreground">{gym.active_subscription.plan.name}</span>
                  )}
                  <Select
                    value={gym.status}
                    onValueChange={(status) => updateStatusMutation.mutate({ id: gym.id, status })}
                    disabled={updateStatusMutation.isPending}
                  >
                    <SelectTrigger className="w-[140px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {GYM_STATUSES.map((s) => (
                        <SelectItem key={s} value={s}>
                          {s.charAt(0).toUpperCase() + s.slice(1)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            ))}
            {(!gyms || gyms.length === 0) && (
              <div className="p-8 text-center text-muted-foreground">No gyms yet.</div>
            )}
          </div>
        )}
      </div>
    </SuperAdminLayout>
  );
}
