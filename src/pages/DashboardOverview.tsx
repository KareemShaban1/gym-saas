import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { api } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import StatCard from "@/components/dashboard/StatCard";
import { Button } from "@/components/ui/button";
import { Users, CreditCard, QrCode, TrendingUp, AlertTriangle, UserPlus, Building2 } from "lucide-react";
import { motion } from "framer-motion";
import { useLanguage } from "@/i18n/LanguageContext";
import { formatDistanceToNow } from "date-fns";

interface DashboardStats {
  total_members: number;
  active_members: number;
  expiring_soon: number;
  total_revenue: number;
  revenue_this_month: number;
  revenue_previous_month: number;
  check_ins_today: number;
  attendance_by_hour: { hour: number; count: number }[];
}

interface ApiMember {
  id: number;
  name: string;
  email: string;
  plan_type: string;
  plan_tier?: string;
  bundle_months?: number;
  coin_package?: number;
  status: string;
  created_at: string;
}

function formatPlanLabel(m: ApiMember): string {
  if (m.plan_type === "monthly") return `Monthly${m.plan_tier ? ` - ${m.plan_tier.charAt(0).toUpperCase() + m.plan_tier.slice(1)}` : ""}`;
  if (m.plan_type === "coin") return `Coin Pack - ${m.coin_package ?? 0}`;
  if (m.plan_type === "bundle") return `${m.bundle_months ?? 0}-Month Bundle`;
  return m.plan_type;
}

const HOUR_LABELS = ["6 AM", "8 AM", "10 AM", "12 PM", "2 PM", "4 PM", "6 PM", "8 PM"];
const HOURS = [6, 8, 10, 12, 14, 16, 18, 20];

const DashboardOverview = () => {
  const { t } = useLanguage();
  const { user } = useAuth();
  const hasGym = !!user?.gym_id || !!user?.gym;
  const isSuperAdmin = user?.role === "super_admin" || (Array.isArray(user?.role) && user?.role?.includes("super_admin"));

  const { data: stats, isLoading: statsLoading, isError: statsError } = useQuery({
    queryKey: ["dashboard-stats"],
    queryFn: () => api.get<DashboardStats>("/reports/dashboard"),
    enabled: hasGym,
  });

  const { data: membersResponse, isError: membersError } = useQuery({
    queryKey: ["members", "recent"],
    queryFn: () => api.get<{ data: ApiMember[] }>("/members?per_page=5"),
    enabled: hasGym,
  });

  const rawMembers = membersResponse && typeof membersResponse === "object" && "data" in membersResponse
    ? (membersResponse as { data: unknown }).data
    : Array.isArray(membersResponse)
      ? membersResponse
      : [];
  const recentMembers = Array.isArray(rawMembers) ? rawMembers : [];

  const revenueChange =
    stats && stats.revenue_previous_month > 0
      ? (((stats.revenue_this_month - stats.revenue_previous_month) / stats.revenue_previous_month) * 100).toFixed(1)
      : null;

  const attendanceByHour = stats?.attendance_by_hour ?? [];
  const hourCounts = HOURS.map((h) => attendanceByHour.find((x) => x.hour === h)?.count ?? 0);
  const maxHourCount = Math.max(...hourCounts, 1);

  if (!user) {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center min-h-[50vh] gap-4 bg-background">
          <h1 className="text-xl font-display font-bold text-foreground">Dashboard</h1>
          <p className="text-muted-foreground animate-pulse">Loading…</p>
        </div>
      </DashboardLayout>
    );
  }

  if (!isSuperAdmin && !hasGym) {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6 text-center px-4 bg-background">
          <div className="w-16 h-16 rounded-2xl bg-amber-500/10 flex items-center justify-center">
            <Building2 className="w-8 h-8 text-amber-600" />
          </div>
          <div>
            <h2 className="text-xl font-display font-bold text-foreground">No gym assigned</h2>
            <p className="text-muted-foreground mt-1 max-w-sm">
              Your account is not linked to a gym. Register a gym to access the dashboard.
            </p>
          </div>
          <Link to="/register-gym">
            <Button variant="hero" className="gap-2">
              <Building2 className="w-4 h-4" />
              Register your gym
            </Button>
          </Link>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="mb-8" data-page="dashboard-overview">
        <h1 className="text-2xl font-display font-bold mb-1 text-foreground">
          {t("dashboardOverview") || "Dashboard Overview"}
        </h1>
        <p className="text-muted-foreground">{t("welcomeBack") || "Welcome back!"}</p>
      </div>

      {hasGym && (statsError || membersError) && (
        <div className="mb-4 rounded-lg border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-800 dark:text-amber-200">
          {t("errorLoadingDashboard") || "Some dashboard data could not be loaded. You may need to link your account to a gym."}
        </div>
      )}

      {statsLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="rounded-xl border border-border bg-card p-6 animate-pulse h-24" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatCard
            icon={Users}
            title={t("activeMembers2")}
            value={stats ? String(stats.active_members) : "0"}
            change={stats ? `${t("of")} ${stats.total_members}` : undefined}
            changeType="neutral"
          />
          <StatCard
            icon={CreditCard}
            title={t("monthlyRevenue")}
            value={stats ? `${Number(stats.revenue_this_month).toLocaleString()} EGP` : "0 EGP"}
            change={
              revenueChange != null ? `${Number(revenueChange) >= 0 ? "+" : ""}${revenueChange}% ${t("vsLastMonth")}` : undefined
            }
            changeType={revenueChange != null ? (Number(revenueChange) >= 0 ? "positive" : "negative") : "neutral"}
          />
          <StatCard
            icon={QrCode}
            title={t("checkInsToday")}
            value={stats ? String(stats.check_ins_today) : "0"}
            change={t("peakAt")}
            changeType="neutral"
          />
          <StatCard
            icon={AlertTriangle}
            title={t("expiringSoon")}
            value={stats ? String(stats.expiring_soon) : "0"}
            change={t("next7Days")}
            changeType="negative"
          />
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="rounded-xl border border-border bg-card">
          <div className="flex items-center justify-between p-6 pb-4">
            <h2 className="font-display font-semibold text-lg">{t("recentMembers")}</h2>
            <UserPlus className="w-5 h-5 text-muted-foreground" />
          </div>
          <div className="px-6 pb-6">
            <div className="space-y-3">
              {recentMembers.length === 0 ? (
                <p className="text-sm text-muted-foreground py-4">{t("noMembersFound")}</p>
              ) : (
                recentMembers.map((member) => (
                  <div key={member.id} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                    <div>
                      <p className="font-medium text-sm">{member.name}</p>
                      <p className="text-xs text-muted-foreground">{formatPlanLabel(member)}</p>
                    </div>
                    <div className="text-right">
                      <span
                        className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${
                          member.status === "Active" ? "bg-success/10 text-success" : "bg-destructive/10 text-destructive"
                        }`}
                      >
                        {member.status}
                      </span>
                      <p className="text-xs text-muted-foreground mt-1">
                        {formatDistanceToNow(new Date(member.created_at), { addSuffix: true })}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="rounded-xl border border-border bg-card">
          <div className="flex items-center justify-between p-6 pb-4">
            <h2 className="font-display font-semibold text-lg">{t("attendanceToday")}</h2>
            <TrendingUp className="w-5 h-5 text-muted-foreground" />
          </div>
          <div className="px-6 pb-6">
            <div className="space-y-4">
              {HOUR_LABELS.map((time, i) => (
                <div key={time} className="flex items-center gap-3">
                  <span className="text-xs text-muted-foreground w-12">{time}</span>
                  <div className="flex-1 h-6 bg-muted rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${(hourCounts[i] / maxHourCount) * 100}%` }}
                      transition={{ delay: 0.4 + i * 0.05, duration: 0.6 }}
                      className="h-full bg-gradient-gold rounded-full"
                    />
                  </div>
                  <span className="text-xs font-medium w-6 text-right">{hourCounts[i]}</span>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </DashboardLayout>
  );
};

export default DashboardOverview;
