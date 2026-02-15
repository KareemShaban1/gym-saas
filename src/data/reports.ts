export const memberGrowthData = [
  { month: "Sep 25", newMembers: 12, totalMembers: 45, churned: 3 },
  { month: "Oct 25", newMembers: 18, totalMembers: 60, churned: 3 },
  { month: "Nov 25", newMembers: 14, totalMembers: 71, churned: 3 },
  { month: "Dec 25", newMembers: 22, totalMembers: 88, churned: 5 },
  { month: "Jan 26", newMembers: 25, totalMembers: 108, churned: 5 },
  { month: "Feb 26", newMembers: 19, totalMembers: 122, churned: 5 },
];

export const planDistribution = [
  { name: "Monthly", value: 52, fill: "hsl(var(--primary))" },
  { name: "Coin-Based", value: 35, fill: "hsl(var(--info))" },
  { name: "Bundle", value: 35, fill: "hsl(var(--success))" },
];

export const revenueByMonth = [
  { month: "Sep", subscriptions: 18000, coins: 6000, training: 4000, other: 4000 },
  { month: "Oct", subscriptions: 22000, coins: 7500, training: 4500, other: 4000 },
  { month: "Nov", subscriptions: 20000, coins: 7000, training: 4000, other: 4000 },
  { month: "Dec", subscriptions: 26000, coins: 8000, training: 5000, other: 3000 },
  { month: "Jan", subscriptions: 28000, coins: 8500, training: 5000, other: 3500 },
  { month: "Feb", subscriptions: 30000, coins: 9000, training: 5500, other: 4000 },
];

export const attendanceTrend = [
  { week: "W1 Jan", avgDaily: 32 },
  { week: "W2 Jan", avgDaily: 35 },
  { week: "W3 Jan", avgDaily: 38 },
  { week: "W4 Jan", avgDaily: 34 },
  { week: "W1 Feb", avgDaily: 40 },
  { week: "W2 Feb", avgDaily: 42 },
];

export const trainerPerformance = [
  { name: "Coach Tarek", sessions: 48, revenue: 7200, rating: 4.8 },
  { name: "Coach Amira", sessions: 32, revenue: 4800, rating: 4.9 },
  { name: "Coach Khaled", sessions: 44, revenue: 7920, rating: 4.7 },
  { name: "Coach Dina", sessions: 38, revenue: 5320, rating: 4.6 },
  { name: "Coach Mahmoud", sessions: 28, revenue: 4760, rating: 4.5 },
];

export const financialSummary = {
  totalRevenue: 291300,
  totalExpenses: 154500,
  netProfit: 136800,
  avgRevenuePerMember: 2387,
  retentionRate: 88,
  avgSessionsPerMember: 12.4,
};
