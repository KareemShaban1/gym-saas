export type PaymentMethod = "cash" | "card" | "bank_transfer" | "mobile_wallet";
export type PaymentCategory = "subscription" | "coin_purchase" | "personal_training" | "supplement" | "merchandise" | "other";
export type ExpenseCategory = "rent" | "utilities" | "equipment" | "maintenance" | "marketing" | "supplies" | "other"; // Legacy type

export interface Payment {
  id: number;
  memberName: string;
  category: PaymentCategory;
  amount: number;
  method: PaymentMethod;
  date: string;
  note?: string;
}

export interface Expense {
  id: number;
  title: string;
  categoryId?: number | null;
  categoryObj?: { id: number; name: string; slug: string; color?: string | null } | null; // Dynamic category from API
  category?: ExpenseCategory; // Legacy fallback for display
  amount: number;
  date: string;
  note?: string;
}

export const paymentCategoryLabels: Record<PaymentCategory, string> = {
  subscription: "Subscription",
  coin_purchase: "Coin Purchase",
  personal_training: "Personal Training",
  supplement: "Supplement",
  merchandise: "Merchandise",
  other: "Other",
};

export const expenseCategoryLabels: Record<ExpenseCategory, string> = {
  rent: "Rent",
  utilities: "Utilities",
  equipment: "Equipment",
  maintenance: "Maintenance",
  marketing: "Marketing",
  supplies: "Supplies",
  other: "Other",
};

export const paymentMethodLabels: Record<PaymentMethod, string> = {
  cash: "Cash",
  card: "Card",
  bank_transfer: "Bank Transfer",
  mobile_wallet: "Mobile Wallet",
};

export const initialPayments: Payment[] = [
  { id: 1, memberName: "Ahmed Hassan", category: "subscription", amount: 500, method: "cash", date: "2026-02-01" },
  { id: 2, memberName: "Sara Ibrahim", category: "coin_purchase", amount: 650, method: "card", date: "2026-02-02" },
  { id: 3, memberName: "Mohamed Ali", category: "subscription", amount: 1350, method: "bank_transfer", date: "2026-02-01" },
  { id: 4, memberName: "Nour Elsayed", category: "subscription", amount: 300, method: "cash", date: "2026-01-18" },
  { id: 5, memberName: "Youssef Kamal", category: "coin_purchase", amount: 1200, method: "mobile_wallet", date: "2026-01-10" },
  { id: 6, memberName: "Omar Farouk", category: "subscription", amount: 4800, method: "bank_transfer", date: "2026-02-10" },
  { id: 7, memberName: "Hana Adel", category: "personal_training", amount: 400, method: "cash", date: "2026-02-05" },
  { id: 8, memberName: "Ahmed Hassan", category: "supplement", amount: 250, method: "card", date: "2026-02-08" },
  { id: 9, memberName: "Layla Mostafa", category: "subscription", amount: 500, method: "cash", date: "2026-01-01" },
  { id: 10, memberName: "Sara Ibrahim", category: "personal_training", amount: 350, method: "mobile_wallet", date: "2026-02-11" },
];

export const initialExpenses: Expense[] = [
  { id: 1, title: "Monthly Rent", category: "rent", amount: 15000, date: "2026-02-01" },
  { id: 2, title: "Electricity Bill", category: "utilities", amount: 3200, date: "2026-02-03" },
  { id: 3, title: "Water Bill", category: "utilities", amount: 800, date: "2026-02-03" },
  { id: 4, title: "New Dumbbells Set", category: "equipment", amount: 4500, date: "2026-02-05" },
  { id: 5, title: "AC Repair", category: "maintenance", amount: 1200, date: "2026-02-07" },
  { id: 6, title: "Facebook Ads", category: "marketing", amount: 2000, date: "2026-02-01" },
  { id: 7, title: "Cleaning Supplies", category: "supplies", amount: 450, date: "2026-02-04" },
  { id: 8, title: "Treadmill Belt Replacement", category: "maintenance", amount: 1800, date: "2026-02-10" },
];

export const monthlyRevenue = [
  { month: "Sep", revenue: 32000, expenses: 24000 },
  { month: "Oct", revenue: 38000, expenses: 25500 },
  { month: "Nov", revenue: 35000, expenses: 23000 },
  { month: "Dec", revenue: 42000, expenses: 28000 },
  { month: "Jan", revenue: 45000, expenses: 26000 },
  { month: "Feb", revenue: 48500, expenses: 28950 },
];
