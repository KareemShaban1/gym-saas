import { useState, useRef, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import StatCard from "@/components/dashboard/StatCard";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  BarChart, Bar, LineChart, Line, AreaChart, Area, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from "recharts";
import { DollarSign, Users, TrendingUp, Activity, Download, Star } from "lucide-react";
import { useLanguage } from "@/i18n/LanguageContext";

const tooltipStyle = {
  background: "hsl(var(--card))",
  border: "1px solid hsl(var(--border))",
  borderRadius: 8,
};

const exportToCSV = (data: Record<string, unknown>[], filename: string) => {
  if (!data.length) return;
  const headers = Object.keys(data[0]);
  const csv = [headers.join(","), ...data.map(row => headers.map(h => row[h]).join(","))].join("\n");
  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = `${filename}.csv`; a.click();
  URL.revokeObjectURL(url);
};

const ReportsPage = () => {
  const { t } = useLanguage();

  const { data: dashboardStats } = useQuery({
    queryKey: ["reports", "dashboard"],
    queryFn: () =>
      api.get<{
        total_revenue: number;
        total_members: number;
        active_members: number;
        revenue_this_month: number;
        revenue_previous_month: number;
      }>("/reports/dashboard"),
  });

  const { data: revenueData = [] } = useQuery({
    queryKey: ["reports", "revenue"],
    queryFn: () => api.get<{ month: string; total: number }[]>("/reports/revenue"),
  });
  const { data: memberGrowthApi = [] } = useQuery({
    queryKey: ["reports", "member-growth"],
    queryFn: () => api.get<{ month: string; new_members: number }[]>("/reports/member-growth"),
  });
  const { data: planDistributionApi = [] } = useQuery({
    queryKey: ["reports", "plan-distribution"],
    queryFn: () => api.get<{ name: string; value: number; fill: string }[]>("/reports/plan-distribution"),
  });
  const { data: attendanceTrendApi = [] } = useQuery({
    queryKey: ["reports", "attendance-trend"],
    queryFn: () => api.get<{ week: string; avgDaily: number }[]>("/reports/attendance-trend"),
  });
  const { data: trainerPerfApi = [] } = useQuery({
    queryKey: ["reports", "trainer-performance"],
    queryFn: () =>
      api.get<{ name: string; sessions: number; revenue: number; rating: string }[]>("/reports/trainer-performance"),
  });

  const totalRevenue = dashboardStats?.total_revenue ?? 0;
  const activeMembers = dashboardStats?.active_members ?? 1;
  const netProfit = totalRevenue; // no expenses in API
  const avgRevenuePerMember = activeMembers > 0 ? Math.round(totalRevenue / activeMembers) : 0;
  const retentionRate = 0; // not computed in API yet

  const revenueByMonth = revenueData.map((r) => ({ month: r.month, total: Number(r.total) }));
  const memberGrowthChart = memberGrowthApi.map((r) => ({ month: r.month, newMembers: r.new_members, churned: 0 }));
  const planDistribution = planDistributionApi.length ? planDistributionApi : [{ name: "—", value: 0, fill: "hsl(var(--muted))" }];
  const attendanceTrend = attendanceTrendApi;
  const trainerPerformance = trainerPerfApi;

  return (
    <DashboardLayout>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-display font-bold mb-1">{t("reportsTitle")}</h1>
          <p className="text-muted-foreground">{t("reportsDescription")}</p>
        </div>
        <Button variant="outline" size="sm" onClick={() => exportToCSV(revenueByMonth as Record<string, unknown>[], "revenue-report")}>
          <Download className="w-4 h-4 me-1" /> {t("exportRevenue")}
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard title={t("totalRevenue6mo")} value={`${totalRevenue.toLocaleString()} EGP`} change={dashboardStats ? "From API" : undefined} changeType="neutral" icon={DollarSign} />
        <StatCard title={t("netProfit")} value={`${netProfit.toLocaleString()} EGP`} change={totalRevenue > 0 ? `${Math.round((netProfit / totalRevenue) * 100)}% margin` : undefined} changeType="positive" icon={TrendingUp} />
        <StatCard title={t("avgRevenuePerMember")} value={`${avgRevenuePerMember.toLocaleString()} EGP`} changeType="neutral" icon={Users} />
        <StatCard title={t("retentionRate")} value={retentionRate > 0 ? `${retentionRate}%` : "—"} changeType="neutral" icon={Activity} />
      </div>

      <Tabs defaultValue="financial" className="space-y-4">
        <TabsList className="bg-muted">
          <TabsTrigger value="financial">{t("financial")}</TabsTrigger>
          <TabsTrigger value="members">{t("memberGrowth")}</TabsTrigger>
          <TabsTrigger value="attendance">{t("attendance")}</TabsTrigger>
          <TabsTrigger value="trainers">{t("trainerPerformance")}</TabsTrigger>
        </TabsList>

        <TabsContent value="financial">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <Card className="lg:col-span-2">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-base">{t("revenueOverview")}</CardTitle>
                <Button variant="ghost" size="sm" onClick={() => exportToCSV(revenueByMonth as Record<string, unknown>[], "revenue-breakdown")}><Download className="w-4 h-4" /></Button>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={320}>
                  <AreaChart data={revenueByMonth}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                    <XAxis dataKey="month" className="text-xs fill-muted-foreground" />
                    <YAxis className="text-xs fill-muted-foreground" tickFormatter={v => `${(v / 1000).toFixed(0)}k`} />
                    <Tooltip contentStyle={tooltipStyle} formatter={(v: number) => [`${Number(v).toLocaleString()} EGP`]} />
                    <Legend />
                    <Area type="monotone" dataKey="total" name="Revenue" fill="hsl(var(--primary))" stroke="hsl(var(--primary))" fillOpacity={0.6} />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
            <Card>
              <CardHeader><CardTitle className="text-base">{t("netProfit")}</CardTitle></CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-3">
                  {[
                    { label: t("totalRevenue"), value: totalRevenue, color: "text-success" },
                    { label: t("netProfit"), value: netProfit, color: "text-primary" },
                  ].map(item => (
                    <div key={item.label} className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">{item.label}</span>
                      <span className={`font-display font-bold ${item.color}`}>{item.value.toLocaleString()} EGP</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="members">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <Card className="lg:col-span-2">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-base">{t("memberGrowth")}</CardTitle>
                <Button variant="ghost" size="sm" onClick={() => exportToCSV(memberGrowthChart as unknown as Record<string, unknown>[], "member-growth")}><Download className="w-4 h-4" /></Button>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={320}>
                  <BarChart data={memberGrowthChart}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                    <XAxis dataKey="month" className="text-xs fill-muted-foreground" />
                    <YAxis className="text-xs fill-muted-foreground" />
                    <Tooltip contentStyle={tooltipStyle} />
                    <Legend />
                    <Bar dataKey="newMembers" name="New" fill="hsl(var(--success))" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="churned" name="Churned" fill="hsl(var(--destructive))" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
            <Card>
              <CardHeader><CardTitle className="text-base">Plan Distribution</CardTitle></CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie data={planDistribution} dataKey="value" cx="50%" cy="50%" outerRadius={80} innerRadius={45} paddingAngle={4}>
                      {planDistribution.map((entry, i) => <Cell key={i} fill={entry.fill} />)}
                    </Pie>
                    <Tooltip contentStyle={tooltipStyle} formatter={(v: number) => [`${v} members`]} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="space-y-2 mt-2">
                  {planDistribution.map(p => (
                    <div key={p.name} className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full" style={{ background: p.fill }} />
                        <span className="text-muted-foreground">{p.name}</span>
                      </div>
                      <span className="font-medium">{p.value}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="attendance">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-base">{t("attendance")}</CardTitle>
              <Button variant="ghost" size="sm" onClick={() => exportToCSV(attendanceTrend as unknown as Record<string, unknown>[], "attendance-trend")}><Download className="w-4 h-4" /></Button>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={320}>
                <LineChart data={attendanceTrend}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                  <XAxis dataKey="week" className="text-xs fill-muted-foreground" />
                  <YAxis className="text-xs fill-muted-foreground" />
                  <Tooltip contentStyle={tooltipStyle} />
                  <Line type="monotone" dataKey="avgDaily" name="Avg Daily" stroke="hsl(var(--primary))" strokeWidth={3} dot={{ fill: "hsl(var(--primary))", r: 5 }} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="trainers">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-base">{t("trainerPerformance")}</CardTitle>
              <Button variant="ghost" size="sm" onClick={() => exportToCSV(trainerPerformance as unknown as Record<string, unknown>[], "trainer-perf")}><Download className="w-4 h-4" /></Button>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t("trainer")}</TableHead>
                    <TableHead>{t("sessions")}</TableHead>
                    <TableHead>{t("totalRevenue")}</TableHead>
                    <TableHead>Rating</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {trainerPerformance.map(tp => (
                    <TableRow key={tp.name}>
                      <TableCell className="font-medium">{tp.name}</TableCell>
                      <TableCell>{tp.sessions}</TableCell>
                      <TableCell className="font-semibold">{tp.revenue.toLocaleString()} EGP</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1"><Star className="w-4 h-4 fill-primary text-primary" /><span>{tp.rating}</span></div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </DashboardLayout>
  );
};

export default ReportsPage;
