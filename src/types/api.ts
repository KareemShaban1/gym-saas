/** API response shapes (snake_case) and mappers to UI types (camelCase) */

export interface ApiMember {
  id: number;
  name: string;
  email: string;
  phone: string;
  gender: string;
  date_of_birth?: string;
  plan_type: string;
  plan_tier?: string;
  bundle_months?: number;
  coin_balance?: number;
  coin_package?: number;
  start_date: string;
  expires_at?: string;
  status: string;
  trainer_id?: number | null;
  branch_id?: number | null;
  gym_plan_id?: number | null;
  notes?: string;
  created_at?: string;
  updated_at?: string;
  trainer?: { id: number; name: string } | null;
  branch?: { id: number; name: string } | null;
  gym_plan?: { id: number; name: string; plan_type: string; plan_tier?: string; coin_package?: number; bundle_months?: number } | null;
}

export interface ApiTrainer {
  id: number;
  name: string;
  email: string;
  phone: string;
  gender: string;
  specialty: string;
  hire_date: string;
  status: string;
  commission_rate?: number | null;
  monthly_salary?: number | null;
  branches?: { id: number; name: string }[];
}

export interface ApiBranch {
  id: number;
  name: string;
  address: string;
  city: string;
  phone: string;
  email: string;
  status: string;
  opening_hours: string;
  capacity: number;
  current_members?: number;
  monthly_revenue?: number;
  manager_id?: number | null;
  manager?: { id: number; name: string } | null;
  trainers?: { id: number; name: string }[];
  facilities?: string[];
  opened_date?: string;
}

export interface ApiPayment {
  id: number;
  member_id: number;
  category: string;
  amount: number | string;
  method: string;
  date: string;
  note?: string | null;
  member?: { id: number; name: string; email?: string };
}

export interface ApiAttendance {
  id: number;
  member_id: number;
  check_in_at: string;
  check_out_at?: string | null;
  member?: { id: number; name: string };
}

export interface ApiExercise {
  id: number;
  name: string;
  muscle_group: string;
  equipment: string;
  is_global?: boolean;
  description?: string | null;
  video_url?: string | null;
  image_url?: string | null;
  gif_url?: string | null;
  gym_id?: number | null;
}

export interface TrainerUI {
  id: number;
  name: string;
  email: string;
  phone: string;
  gender: string;
  specialty: string;
  certifications: string[];
  hireDate: string;
  status: string;
  commissionRate: number;
  monthlySalary: number;
  schedule: { day: string; startTime?: string; endTime?: string }[];
  membersCount: number;
  branches?: { id: number; name: string }[];
  branchIds?: number[];
}

export function apiTrainerToTrainerUI(api: ApiTrainer & { members_count?: number }): TrainerUI {
  return {
    id: api.id,
    name: api.name,
    email: api.email,
    phone: api.phone,
    gender: api.gender,
    specialty: api.specialty,
    certifications: Array.isArray(api.certifications) ? api.certifications : [],
    hireDate: api.hire_date,
    status: api.status,
    commissionRate: Number(api.commission_rate ?? 0),
    monthlySalary: Number(api.monthly_salary ?? 0),
    schedule: Array.isArray(api.schedule) ? api.schedule : [],
    membersCount: (api as ApiTrainer & { members_count?: number }).members_count ?? 0,
    branches: api.branches,
    bio: (api as ApiTrainer & { bio?: string }).bio,
  };
}

export function trainerUIToApiPayload(t: Partial<TrainerUI>): Record<string, unknown> {
  return {
    name: t.name,
    email: t.email,
    phone: t.phone,
    gender: t.gender,
    specialty: t.specialty,
    certifications: t.certifications ?? [],
    hire_date: t.hireDate,
    status: t.status ?? "Active",
    commission_rate: t.commissionRate ?? null,
    monthly_salary: t.monthlySalary ?? null,
    schedule: t.schedule ?? [],
    bio: null,
    avatar: null,
    branch_ids: t.branchIds ?? t.branches?.map((b) => b.id) ?? [],
  };
}

export interface BranchUI {
  id: number;
  name: string;
  address: string;
  city: string;
  phone: string;
  email: string;
  status: string;
  openingHours: string;
  capacity: number;
  currentMembers: number;
  monthlyRevenue: number;
  managerId: number | null;
  manager?: { id: number; name: string } | null;
  trainers?: { id: number; name: string }[];
  trainerIds?: number[];
  facilities?: string[];
  openedDate: string;
}

export function apiBranchToBranchUI(api: ApiBranch): BranchUI {
  return {
    id: api.id,
    name: api.name,
    address: api.address,
    city: api.city,
    phone: api.phone,
    email: api.email,
    status: api.status,
    openingHours: api.opening_hours,
    capacity: api.capacity,
    currentMembers: api.current_members ?? 0,
    monthlyRevenue: api.monthly_revenue ?? 0,
    managerId: api.manager_id ?? null,
    manager: api.manager,
    trainers: api.trainers,
    trainerIds: api.trainers?.map((t) => t.id),
    facilities: Array.isArray(api.facilities) ? api.facilities : [],
    openedDate: api.opened_date ?? new Date().toISOString().split("T")[0],
  };
}

export function branchUIToApiPayload(b: Partial<BranchUI>): Record<string, unknown> {
  return {
    name: b.name,
    address: b.address,
    city: b.city,
    phone: b.phone,
    email: b.email,
    status: b.status ?? "Active",
    opening_hours: b.openingHours,
    capacity: b.capacity ?? 0,
    current_members: b.currentMembers ?? 0,
    monthly_revenue: b.monthlyRevenue ?? 0,
    manager_id: b.managerId ?? null,
    trainer_ids: b.trainerIds ?? b.trainers?.map((t) => t.id) ?? [],
    facilities: b.facilities ?? [],
    opened_date: b.openedDate,
  };
}

export interface ApiGymPlan {
  id: number;
  gym_id: number;
  name: string;
  price?: number | string | null;
  plan_type: string;
  plan_tier?: string | null;
  coin_package?: number | null;
  bundle_months?: number | null;
  sort_order: number;
}

export interface ApiExpenseCategory {
  id: number;
  gym_id: number;
  name: string;
  slug: string;
  color?: string | null;
  description?: string | null;
  is_active: boolean;
  sort_order: number;
}

export interface ApiExpense {
  id: number;
  gym_id: number;
  category_id?: number | null;
  title: string;
  category?: string; // Legacy support
  amount: number | string;
  date: string;
  note?: string | null;
  category?: ApiExpenseCategory | null;
}

export interface ApiCommission {
  id: number;
  gym_id: number;
  trainer_id: number;
  member_id?: number | null;
  type: string;
  amount: number | string;
  date: string;
  status: string;
  note?: string | null;
  trainer?: { id: number; name: string } | null;
  member?: { id: number; name: string } | null;
}

export interface ApiWorkoutPlan {
  id: number;
  name: string;
  trainee_id: number;
  trainer_id?: number | null;
  days?: unknown;
  status: string;
  trainee?: { id: number; name: string };
  trainer?: { id: number; name: string } | null;
}

/** UI Member (camelCase) - used by MembersPage, MemberFormDialog, MemberDetailSheet */
export interface MemberUI {
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
  trainerId?: number | null;
  trainer?: string;
  branchId?: number | null;
  gymPlanId?: number | null;
  notes?: string;
}

export function apiMemberToMemberUI(api: ApiMember): MemberUI {
  return {
    id: api.id,
    name: api.name,
    email: api.email,
    phone: api.phone,
    gender: api.gender as "male" | "female",
    dateOfBirth: api.date_of_birth,
    planType: api.plan_type as "monthly" | "coin" | "bundle",
    planTier: api.plan_tier as "basic" | "pro" | "vip" | undefined,
    bundleMonths: api.bundle_months,
    coinBalance: api.coin_balance,
    coinPackage: api.coin_package,
    startDate: api.start_date,
    expiresAt: api.expires_at,
    status: api.status as MemberUI["status"],
    trainerId: api.trainer_id ?? null,
    trainer: api.trainer?.name,
    branchId: api.branch_id ?? null,
    gymPlanId: api.gym_plan_id ?? null,
    notes: api.notes,
  };
}

/** Build API payload for member create/update (snake_case) */
export function memberUIToApiPayload(m: Partial<MemberUI> & { password?: string; password_confirmation?: string }): Record<string, unknown> {
  const payload: Record<string, unknown> = {
    name: m.name,
    email: m.email,
    phone: m.phone,
    gender: m.gender,
    date_of_birth: m.dateOfBirth || null,
    plan_type: m.planType,
    plan_tier: m.planTier || null,
    bundle_months: m.bundleMonths ?? null,
    coin_balance: m.coinBalance ?? null,
    coin_package: m.coinPackage ?? null,
    start_date: m.startDate,
    expires_at: m.expiresAt || null,
    status: m.status ?? "Active",
    trainer_id: m.trainerId ?? null,
    branch_id: m.branchId ?? null,
    gym_plan_id: m.gymPlanId ?? null,
    notes: m.notes || null,
  };
  if (m.password != null && m.password.trim().length >= 6) {
    payload.password = m.password.trim();
    payload.password_confirmation = (m.password_confirmation ?? m.password).trim();
  }
  return payload;
}
