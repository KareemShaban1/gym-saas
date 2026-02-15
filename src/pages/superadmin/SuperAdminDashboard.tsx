import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import SuperAdminLayout from "@/components/superadmin/SuperAdminLayout";
import { Building2, Users, CreditCard, TrendingUp } from "lucide-react";

export default function SuperAdminDashboard() {
  const { data: stats, isLoading } = useQuery({
    queryKey: ["super-admin-stats"],
    queryFn: () => api.get<{ total_gyms: number; active_gyms: number; trial_gyms: number }>("/super-admin/stats"),
  });

  return (
    <SuperAdminLayout>
      <h1 className="text-2xl font-display font-bold mb-2">Super Admin Dashboard</h1>
      <p className="text-muted-foreground mb-8">Manage gyms, subscriptions, and announcements</p>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-xl border bg-card p-6 flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
            <Building2 className="w-5 h-5 text-primary" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Total gyms</p>
            <p className="text-2xl font-bold">{isLoading ? "…" : stats?.total_gyms ?? 0}</p>
          </div>
        </div>
        <div className="rounded-xl border bg-card p-6 flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-green-500/10 flex items-center justify-center">
            <TrendingUp className="w-5 h-5 text-green-600" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Active gyms</p>
            <p className="text-2xl font-bold">{isLoading ? "…" : stats?.active_gyms ?? 0}</p>
          </div>
        </div>
        <div className="rounded-xl border bg-card p-6 flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-amber-500/10 flex items-center justify-center">
            <Users className="w-5 h-5 text-amber-600" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Trial gyms</p>
            <p className="text-2xl font-bold">{isLoading ? "…" : stats?.trial_gyms ?? 0}</p>
          </div>
        </div>
        <div className="rounded-xl border bg-card p-6 flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
            <CreditCard className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Plans</p>
            <p className="text-2xl font-bold">Trial / Starter / Growth</p>
          </div>
        </div>
      </div>
    </SuperAdminLayout>
  );
}
