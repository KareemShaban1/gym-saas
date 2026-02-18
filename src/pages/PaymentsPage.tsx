import { useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type { ApiPayment, ApiExpense, ApiCommission } from "@/types/api";
import type { Expense } from "@/data/payments";
import type { CommissionRecord } from "@/data/trainers";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import StatCard from "@/components/dashboard/StatCard";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DollarSign, TrendingUp, TrendingDown, Receipt } from "lucide-react";
import { Payment } from "@/data/payments";
import PaymentRecords from "@/components/payments/PaymentRecords";
import ExpenseRecords from "@/components/payments/ExpenseRecords";
import CommissionPanel from "@/components/payments/CommissionPanel";
import RevenueOverview from "@/components/payments/RevenueOverview";
import { useLanguage } from "@/i18n/LanguageContext";
import { useToast } from "@/hooks/use-toast";

export interface MemberForPayment {
  id: number;
  name: string;
  gym_plan?: { id: number; name: string; price: number } | null;
  gymPlan?: { id: number; name: string; price: number } | null;
}

const PaymentsPage = () => {
  const { t } = useLanguage();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: dashboardStats } = useQuery({
    queryKey: ["reports", "dashboard"],
    queryFn: () =>
      api.get<{ revenue_this_month: number; revenue_previous_month: number }>("/reports/dashboard"),
  });

  const { data: paymentsList = [] } = useQuery({
    queryKey: ["payments"],
    queryFn: async () => {
      const res = await api.get<ApiPayment[] | { data: ApiPayment[] }>("/payments");
      return Array.isArray(res) ? res : (res as { data: ApiPayment[] }).data ?? [];
    },
  });

  const { data: membersList = [] } = useQuery({
    queryKey: ["members"],
    queryFn: async () => {
      const res = await api.get<MemberForPayment[] | { data: MemberForPayment[] }>("/members");
      return Array.isArray(res) ? res : (res as { data: MemberForPayment[] }).data ?? [];
    },
  });

  const addPaymentMutation = useMutation({
    mutationFn: (payload: { member_id: number; category: string; amount: number; method: string; date: string; note?: string }) =>
      api.post<ApiPayment>("/payments", payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["payments"] }),
  });

  const { data: expensesList = [] } = useQuery({
    queryKey: ["expenses"],
    queryFn: async () => {
      const res = await api.get<ApiExpense[] | { data: ApiExpense[] }>("/expenses");
      return Array.isArray(res) ? res : (res as { data: ApiExpense[] }).data ?? [];
    },
  });

  const addExpenseMutation = useMutation({
    mutationFn: (payload: { title: string; category_id: number; amount: number; date: string; note?: string }) =>
      api.post<ApiExpense>("/expenses", payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["expenses"] });
      queryClient.invalidateQueries({ queryKey: ["expense-categories"] });
    },
  });

  const { data: commissionsList = [] } = useQuery({
    queryKey: ["commissions"],
    queryFn: async () => {
      const res = await api.get<ApiCommission[] | { data: ApiCommission[] }>("/commissions");
      return Array.isArray(res) ? res : (res as { data: ApiCommission[] }).data ?? [];
    },
  });

  const payments: Payment[] = useMemo(
    () =>
      paymentsList.map((p) => ({
        id: p.id,
        memberName: p.member?.name ?? "—",
        category: p.category as Payment["category"],
        amount: Number(p.amount),
        method: p.method as Payment["method"],
        date: typeof p.date === "string" ? p.date.split("T")[0] : p.date,
        note: p.note ?? undefined,
      })),
    [paymentsList]
  );

  const expenses: Expense[] = useMemo(
    () =>
      expensesList.map((e) => ({
        id: e.id,
        title: e.title,
        categoryId: e.category_id ?? null,
        categoryObj: e.category ? {
          id: e.category.id,
          name: e.category.name,
          slug: e.category.slug,
          color: e.category.color ?? null,
        } : null,
        category: e.category?.slug as Expense["category"] | undefined, // Legacy fallback
        amount: Number(e.amount),
        date: typeof e.date === "string" ? e.date.split("T")[0] : e.date,
        note: e.note ?? undefined,
      })),
    [expensesList]
  );

  const monthlyRevenue = useMemo(() => {
    const byMonth: Record<string, { revenue: number; expenses: number }> = {};
    
    // Calculate revenue by month
    payments.forEach((p) => {
      const month = p.date.slice(0, 7);
      if (!byMonth[month]) byMonth[month] = { revenue: 0, expenses: 0 };
      byMonth[month].revenue += p.amount;
    });
    
    // Calculate expenses by month
    expenses.forEach((e) => {
      const month = e.date.slice(0, 7);
      if (!byMonth[month]) byMonth[month] = { revenue: 0, expenses: 0 };
      byMonth[month].expenses += e.amount;
    });
    
    return Object.entries(byMonth)
      .sort(([a], [b]) => a.localeCompare(b))
      .slice(-6)
      .map(([month, v]) => ({ month, revenue: v.revenue, expenses: v.expenses }));
  }, [payments, expenses]);

  const commissions: CommissionRecord[] = useMemo(
    () =>
      commissionsList.map((c) => ({
        id: c.id,
        trainerId: c.trainer_id,
        trainerName: c.trainer?.name,
        memberName: c.member?.name ?? "—",
        type: c.type as CommissionRecord["type"],
        amount: Number(c.amount),
        date: typeof c.date === "string" ? c.date.split("T")[0] : c.date,
        status: c.status as CommissionRecord["status"],
      })),
    [commissionsList]
  );

  const totalRevenue = useMemo(() => payments.reduce((s, p) => s + p.amount, 0), [payments]);
  const totalExpenses = useMemo(() => expenses.reduce((s, e) => s + e.amount, 0), [expenses]);
  const pendingCommissions = useMemo(() => commissions.filter(c => c.status === "pending").reduce((s, c) => s + c.amount, 0), [commissions]);
  const netProfit = totalRevenue - totalExpenses - pendingCommissions;

  const revenueChange =
    dashboardStats?.revenue_previous_month != null && dashboardStats.revenue_previous_month > 0
      ? (((dashboardStats.revenue_this_month - dashboardStats.revenue_previous_month) / dashboardStats.revenue_previous_month) * 100).toFixed(1)
      : null;

  return (
    <DashboardLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-display font-bold mb-1">{t("paymentsTitle")}</h1>
        <p className="text-muted-foreground">{t("paymentsDescription")}</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard
          title={t("totalRevenue")}
          value={`${totalRevenue.toLocaleString()} EGP`}
          change={revenueChange != null ? `${Number(revenueChange) >= 0 ? "+" : ""}${revenueChange}% ${t("vsLastMonth")}` : undefined}
          changeType={revenueChange != null ? (Number(revenueChange) >= 0 ? "positive" : "negative") : "neutral"}
          icon={DollarSign}
        />
        <StatCard title={t("totalExpenses")} value={`${totalExpenses.toLocaleString()} EGP`} change={t("rentOperations")} changeType="neutral" icon={TrendingDown} />
        <StatCard title={t("pendingCommissions")} value={`${pendingCommissions.toLocaleString()} EGP`} change={commissions.filter(c => c.status === "pending").length ? `${commissions.filter(c => c.status === "pending").length} ${t("unpaid")}` : undefined} changeType="negative" icon={Receipt} />
        <StatCard title={t("netProfit")} value={`${netProfit.toLocaleString()} EGP`} change={netProfit > 0 ? t("profitable") : t("loss")} changeType={netProfit > 0 ? "positive" : "negative"} icon={TrendingUp} />
      </div>

      <Tabs defaultValue="revenue" className="space-y-4">
        <TabsList className="bg-muted">
          <TabsTrigger value="revenue">{t("revenueOverview")}</TabsTrigger>
          <TabsTrigger value="payments">{t("paymentsTab")}</TabsTrigger>
          <TabsTrigger value="expenses">{t("expensesTab")}</TabsTrigger>
          <TabsTrigger value="commissions">{t("commissionsTab")}</TabsTrigger>
        </TabsList>
        <TabsContent value="revenue"><RevenueOverview data={monthlyRevenue} payments={payments} /></TabsContent>
        <TabsContent value="payments">
          <PaymentRecords
            payments={payments}
            members={membersList}
            onAddPayment={(payload) =>
              addPaymentMutation.mutate(payload, {
                onSuccess: () => toast({ title: t("paymentsTab"), description: "Payment recorded" }),
                onError: (e) => toast({ title: "Error", description: e.message, variant: "destructive" }),
              })
            }
          />
        </TabsContent>
        <TabsContent value="expenses">
          <ExpenseRecords
            expenses={expenses}
            onAddExpense={(payload) =>
              addExpenseMutation.mutate(
                { title: payload.title, category_id: payload.category_id, amount: payload.amount, date: payload.date, note: payload.note },
                {
                  onSuccess: () => toast({ title: t("expensesTab"), description: "Expense recorded" }),
                  onError: (e) => toast({ title: "Error", description: e.message, variant: "destructive" }),
                }
              )
            }
          />
        </TabsContent>
        <TabsContent value="commissions"><CommissionPanel commissions={commissions} /></TabsContent>
      </Tabs>
    </DashboardLayout>
  );
};

export default PaymentsPage;
