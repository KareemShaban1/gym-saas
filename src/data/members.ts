export interface Member {
  id: number;
  name: string;
  email: string;
  phone: string;
  gender: "male" | "female";
  dateOfBirth?: string;
  planType: "monthly" | "coin" | "bundle";
  planTier?: "basic" | "pro" | "vip";
  bundleMonths?: number;
  coinBalance?: number;
  coinPackage?: number;
  startDate: string;
  expiresAt?: string;
  status: "Active" | "Expiring" | "Expired" | "Frozen";
  trainer?: string;
  notes?: string;
}

export const subscriptionPlans = [
  { value: "monthly", label: "Monthly Subscription", description: "Recurring monthly plan" },
  { value: "coin", label: "Coin-Based", description: "Pay per session with coins" },
  { value: "bundle", label: "Bundle Package", description: "Multi-month discounted bundle" },
] as const;

export const planTiers = [
  { value: "basic", label: "Basic", price: "300 EGP/mo", features: ["Gym access", "Locker"] },
  { value: "pro", label: "Pro", price: "500 EGP/mo", features: ["Gym access", "Locker", "Group classes"] },
  { value: "vip", label: "VIP", price: "800 EGP/mo", features: ["All Pro features", "Sauna", "Personal locker"] },
] as const;

export const coinPackages = [
  { value: 10, label: "10 Coins", price: "150 EGP" },
  { value: 25, label: "25 Coins", price: "350 EGP" },
  { value: 50, label: "50 Coins", price: "650 EGP" },
  { value: 100, label: "100 Coins", price: "1,200 EGP" },
] as const;

export const bundleOptions = [
  { value: 3, label: "3 Months", discount: "10% off" },
  { value: 6, label: "6 Months", discount: "15% off" },
  { value: 12, label: "12 Months", discount: "25% off" },
] as const;

export const trainers = [
  "Coach Tarek",
  "Coach Amira",
  "Coach Khaled",
  "Coach Dina",
  "Coach Mahmoud",
];

export const initialMembers: Member[] = [
  { id: 1, name: "Ahmed Hassan", email: "ahmed@email.com", phone: "010-1234-5678", gender: "male", planType: "monthly", planTier: "pro", startDate: "2026-01-15", expiresAt: "2026-03-15", status: "Active", trainer: "Coach Tarek" },
  { id: 2, name: "Sara Ibrahim", email: "sara@email.com", phone: "011-9876-5432", gender: "female", planType: "coin", coinBalance: 38, coinPackage: 50, startDate: "2026-01-20", status: "Active" },
  { id: 3, name: "Mohamed Ali", email: "mohamed@email.com", phone: "012-5555-1234", gender: "male", planType: "bundle", planTier: "pro", bundleMonths: 3, startDate: "2026-02-01", expiresAt: "2026-05-01", status: "Active", trainer: "Coach Khaled" },
  { id: 4, name: "Nour Elsayed", email: "nour@email.com", phone: "010-7777-8888", gender: "female", planType: "monthly", planTier: "basic", startDate: "2026-01-18", expiresAt: "2026-02-18", status: "Expiring" },
  { id: 5, name: "Youssef Kamal", email: "youssef@email.com", phone: "011-3333-4444", gender: "male", planType: "coin", coinBalance: 92, coinPackage: 100, startDate: "2026-01-10", status: "Active" },
  { id: 6, name: "Layla Mostafa", email: "layla@email.com", phone: "012-6666-9999", gender: "female", planType: "monthly", planTier: "pro", startDate: "2026-01-01", expiresAt: "2026-02-01", status: "Expired" },
  { id: 7, name: "Omar Farouk", email: "omar@email.com", phone: "010-2222-3333", gender: "male", planType: "bundle", planTier: "vip", bundleMonths: 6, startDate: "2026-02-10", expiresAt: "2026-08-10", status: "Active", trainer: "Coach Mahmoud" },
  { id: 8, name: "Hana Adel", email: "hana@email.com", phone: "011-4444-5555", gender: "female", planType: "monthly", planTier: "basic", startDate: "2026-02-05", expiresAt: "2026-03-05", status: "Active", trainer: "Coach Dina" },
];
