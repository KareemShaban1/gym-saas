import { useState, useEffect } from "react";
import { format } from "date-fns";
import { CalendarIcon, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  subscriptionPlans,
  planTiers,
  coinPackages,
  bundleOptions,
} from "@/data/members";
import type { MemberUI } from "@/types/api";
import type { ApiGymPlan } from "@/types/api";
import { useLanguage } from "@/i18n/LanguageContext";

interface MemberFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  member?: MemberUI | null;
  trainers?: { id: number; name: string }[];
  gymPlans?: ApiGymPlan[];
  onSave: (member: Partial<MemberUI> & { id?: number }) => void;
}

const MemberFormDialog = ({ open, onOpenChange, member, trainers = [], gymPlans = [], onSave }: MemberFormDialogProps) => {
  const { t } = useLanguage();
  const isEditing = !!member;

  const [name, setName] = useState(member?.name ?? "");
  const [email, setEmail] = useState(member?.email ?? "");
  const [phone, setPhone] = useState(member?.phone ?? "");
  const [gender, setGender] = useState<"male" | "female">(member?.gender ?? "male");
  const [selectedPlanId, setSelectedPlanId] = useState<string>(member?.gymPlanId != null ? String(member.gymPlanId) : "");
  const [planType, setPlanType] = useState<"monthly" | "coin" | "bundle">(member?.planType ?? "monthly");
  const [planTier, setPlanTier] = useState<string>(member?.planTier ?? "basic");
  const [coinPackage, setCoinPackage] = useState<string>(String(member?.coinPackage ?? "25"));
  const [bundleMonths, setBundleMonths] = useState<string>(String(member?.bundleMonths ?? "3"));
  const [startDate, setStartDate] = useState<Date | undefined>(
    member?.startDate ? new Date(member.startDate) : new Date()
  );
  const [expiresAt, setExpiresAt] = useState<Date | undefined>(
    member?.expiresAt ? new Date(member.expiresAt) : undefined
  );
  const [trainerId, setTrainerId] = useState<string>(member?.trainerId != null ? String(member.trainerId) : "none");
  const [status, setStatus] = useState<MemberUI["status"]>(member?.status ?? "Active");
  const [notes, setNotes] = useState(member?.notes ?? "");
  const [password, setPassword] = useState("");
  const [passwordConfirmation, setPasswordConfirmation] = useState("");

  const plansForCurrentType = gymPlans.filter((p) => p.plan_type === planType);
  const selectedPlanStillValid = !!selectedPlanId && plansForCurrentType.some((p) => String(p.id) === selectedPlanId);

  useEffect(() => {
    if (!open) return;
    setName(member?.name ?? "");
    setEmail(member?.email ?? "");
    setPhone(member?.phone ?? "");
    setGender(member?.gender ?? "male");
    setPlanType(member?.planType ?? "monthly");
    setPlanTier(member?.planTier ?? "basic");
    setCoinPackage(String(member?.coinPackage ?? "25"));
    setBundleMonths(String(member?.bundleMonths ?? "3"));
    setStartDate(member?.startDate ? new Date(member.startDate) : new Date());
    setExpiresAt(member?.expiresAt ? new Date(member.expiresAt) : undefined);
    setTrainerId(member?.trainerId != null ? String(member.trainerId) : "none");
    setStatus(member?.status ?? "Active");
    setNotes(member?.notes ?? "");
    setPassword("");
    setPasswordConfirmation("");
    if (member?.gymPlanId != null) {
      setSelectedPlanId(String(member.gymPlanId));
    } else if (gymPlans.length > 0) {
      const type = member?.planType ?? "monthly";
      const firstOfType = gymPlans.find((p) => p.plan_type === type) ?? gymPlans[0];
      if (firstOfType) {
        setSelectedPlanId(String(firstOfType.id));
        setPlanType(firstOfType.plan_type as "monthly" | "coin" | "bundle");
        setPlanTier((firstOfType.plan_tier as string) ?? "basic");
        setCoinPackage(String(firstOfType.coin_package ?? 25));
        setBundleMonths(String(firstOfType.bundle_months ?? 3));
      } else {
        setSelectedPlanId("");
      }
    } else {
      setSelectedPlanId("");
    }
  }, [open, member, gymPlans]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const data: Partial<MemberUI> & { id?: number; password?: string; password_confirmation?: string } = {
      ...(member?.id && { id: member.id }),
      name,
      email,
      phone,
      gender,
      gymPlanId: selectedPlanId ? Number(selectedPlanId) : null,
      planType,
      planTier: planType !== "coin" ? (planTier as "basic" | "pro" | "vip") : undefined,
      coinBalance: planType === "coin" ? Number(coinPackage) : undefined,
      coinPackage: planType === "coin" ? Number(coinPackage) : undefined,
      bundleMonths: planType === "bundle" ? Number(bundleMonths) : undefined,
      startDate: startDate ? format(startDate, "yyyy-MM-dd") : format(new Date(), "yyyy-MM-dd"),
      expiresAt: expiresAt ? format(expiresAt, "yyyy-MM-dd") : undefined,
      status,
      trainerId: trainerId && trainerId !== "none" ? Number(trainerId) : null,
      notes: notes || undefined,
    };
    if (password.trim().length >= 6) {
      data.password = password.trim();
      data.password_confirmation = passwordConfirmation.trim() || password.trim();
    }
    onSave(data);
    onOpenChange(false);
  };

  const handlePlanTypeChange = (value: "monthly" | "coin" | "bundle") => {
    setPlanType(value);
    const filtered = gymPlans.filter((p) => p.plan_type === value);
    const currentPlanInFiltered = filtered.some((p) => String(p.id) === selectedPlanId);
    if (!currentPlanInFiltered) {
      const first = filtered[0];
      if (first) {
        setSelectedPlanId(String(first.id));
        setPlanTier((first.plan_tier as string) ?? "basic");
        setCoinPackage(String(first.coin_package ?? 25));
        setBundleMonths(String(first.bundle_months ?? 3));
      } else {
        setSelectedPlanId("");
      }
    }
  };

  const handleSelectGymPlan = (value: string) => {
    setSelectedPlanId(value);
    const plan = gymPlans.find((p) => String(p.id) === value);
    if (plan) {
      setPlanType(plan.plan_type as "monthly" | "coin" | "bundle");
      setPlanTier((plan.plan_tier as string) ?? "basic");
      setCoinPackage(String(plan.coin_package ?? 25));
      setBundleMonths(String(plan.bundle_months ?? 3));
    }
  };

  const planOptionLabel = (p: ApiGymPlan) => {
    const priceStr = p.price != null && Number(p.price) > 0 ? ` — ${Number(p.price).toLocaleString()} EGP` : "";
    if (p.plan_type === "monthly" || p.plan_type === "bundle") {
      const tier = p.plan_tier ? ` ${p.plan_tier}` : "";
      const extra = p.plan_type === "bundle" && p.bundle_months ? `, ${p.bundle_months} ${t("months")}` : "";
      return `${p.name}${tier}${extra}${priceStr}`;
    }
    if (p.plan_type === "coin" && p.coin_package != null) {
      return `${p.name} — ${p.coin_package} ${t("coins")}${priceStr}`;
    }
    return `${p.name}${priceStr}`;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-display text-xl">
            {isEditing ? t("editMember") : t("addMember")}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 mt-2">
          {/* Personal Info */}
          <div>
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">
              {t("personalInfo")}
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">{t("fullName")} *</Label>
                <Input id="name" value={name} onChange={(e) => setName(e.target.value)} required placeholder={t("fullName")} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">{t("email")}</Label>
                <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder={t("email")} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">{t("phone")} *</Label>
                <Input id="phone" value={phone} onChange={(e) => setPhone(e.target.value)} required placeholder={t("phone")} />
              </div>
              <div className="space-y-2">
                <Label>{t("gender")}</Label>
                <Select value={gender} onValueChange={(v) => setGender(v as "male" | "female")}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="male">Male</SelectItem>
                    <SelectItem value="female">Female</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            {/* Member portal password - for login to member dashboard */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4 pt-4 border-t border-border">
              <div className="space-y-2">
                <Label htmlFor="member-password">{isEditing ? t("setPortalPassword") ?? "Set portal password (optional)" : t("portalPassword") ?? "Portal password (optional)"}</Label>
                <Input
                  id="member-password"
                  type="password"
                  autoComplete="new-password"
                  placeholder={isEditing ? "Leave blank to keep current" : "Min 6 characters"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="member-password-confirm">{t("confirmPassword") ?? "Confirm password"}</Label>
                <Input
                  id="member-password-confirm"
                  type="password"
                  autoComplete="new-password"
                  placeholder="Repeat password"
                  value={passwordConfirmation}
                  onChange={(e) => setPasswordConfirmation(e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* Subscription Plan */}
          <div>
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">
              {t("subscriptionPlan")}
            </h3>

            {gymPlans.length > 0 ? (
              <Tabs value={planType} onValueChange={(v) => handlePlanTypeChange(v as "monthly" | "coin" | "bundle")} className="w-full">
                <TabsList className="grid w-full grid-cols-3 mb-4">
                  <TabsTrigger value="monthly">{t("monthly")}</TabsTrigger>
                  <TabsTrigger value="coin">{t("coin")}</TabsTrigger>
                  <TabsTrigger value="bundle">{t("bundle")}</TabsTrigger>
                </TabsList>
                {(["monthly", "coin", "bundle"] as const).map((type) => {
                  const plansOfType = gymPlans.filter((p) => p.plan_type === type);
                  return (
                    <TabsContent key={type} value={type} className="mt-0">
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                        {plansOfType.map((p) => {
                          const isSelected = selectedPlanId === String(p.id);
                          return (
                            <button
                              key={p.id}
                              type="button"
                              onClick={() => handleSelectGymPlan(String(p.id))}
                              className={cn(
                                "p-4 rounded-xl border-2 text-left transition-all duration-200",
                                isSelected
                                  ? "border-primary bg-accent glow-gold"
                                  : "border-border hover:border-primary/50"
                              )}
                            >
                              <p className="font-semibold text-sm">{p.name}</p>
                              {(p.plan_type === "monthly" || p.plan_type === "bundle") && p.plan_tier && (
                                <p className="text-xs text-muted-foreground mt-0.5 capitalize">{p.plan_tier}</p>
                              )}
                              {p.plan_type === "bundle" && p.bundle_months != null && (
                                <p className="text-xs text-muted-foreground">{p.bundle_months} {t("months")}</p>
                              )}
                              {p.plan_type === "coin" && p.coin_package != null && (
                                <p className="text-xs text-muted-foreground mt-0.5">{p.coin_package} {t("coins")}</p>
                              )}
                              {p.price != null && Number(p.price) > 0 && (
                                <p className="text-sm font-medium text-primary mt-2">{Number(p.price).toLocaleString()} EGP</p>
                              )}
                            </button>
                          );
                        })}
                      </div>
                      {plansOfType.length === 0 && (
                        <p className="text-sm text-muted-foreground py-4">{t("noPlansForType")}</p>
                      )}
                    </TabsContent>
                  );
                })}
              </Tabs>
            ) : (
              <>
                {/* Plan type cards when no gym plans */}
                <div className="space-y-2 mb-3">
                  <Label>{t("planType")}</Label>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {subscriptionPlans.map((plan) => (
                      <button
                        key={plan.value}
                        type="button"
                        onClick={() => handlePlanTypeChange(plan.value)}
                        className={cn(
                          "p-4 rounded-xl border-2 text-left transition-all duration-200",
                          planType === plan.value
                            ? "border-primary bg-accent glow-gold"
                            : "border-border hover:border-border/80"
                        )}
                      >
                        <p className="font-semibold text-sm">{plan.label}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">{plan.description}</p>
                      </button>
                    ))}
                  </div>
                </div>
              </>
            )}

            {/* Manual tier/coin/bundle only when no gym plans */}
            {gymPlans.length === 0 && (planType === "monthly" || planType === "bundle") && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>{t("planTier")}</Label>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {planTiers.map((tier) => (
                      <button
                        key={tier.value}
                        type="button"
                        onClick={() => setPlanTier(tier.value)}
                        className={cn(
                          "p-4 rounded-xl border-2 text-left transition-all duration-200",
                          planTier === tier.value
                            ? "border-primary bg-accent"
                            : "border-border hover:border-border/80"
                        )}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <p className="font-semibold text-sm">{tier.label}</p>
                          <p className="text-xs font-medium text-primary">{tier.price}</p>
                        </div>
                        <ul className="space-y-0.5">
                          {tier.features.map((f) => (
                            <li key={f} className="text-xs text-muted-foreground">• {f}</li>
                          ))}
                        </ul>
                      </button>
                    ))}
                  </div>
                </div>

                {planType === "bundle" && (
                  <div className="space-y-2">
                    <Label>Bundle Duration</Label>
                    <div className="grid grid-cols-3 gap-3">
                      {bundleOptions.map((opt) => (
                        <button
                          key={opt.value}
                          type="button"
                          onClick={() => setBundleMonths(String(opt.value))}
                          className={cn(
                            "p-3 rounded-xl border-2 text-center transition-all duration-200",
                            bundleMonths === String(opt.value)
                              ? "border-primary bg-accent"
                              : "border-border hover:border-border/80"
                          )}
                        >
                          <p className="font-semibold text-sm">{opt.label}</p>
                          <p className="text-xs text-primary font-medium">{opt.discount}</p>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {gymPlans.length === 0 && planType === "coin" && (
              <div className="space-y-2">
                <Label>{t("coinPackage")}</Label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {coinPackages.map((pkg) => (
                    <button
                      key={pkg.value}
                      type="button"
                      onClick={() => setCoinPackage(String(pkg.value))}
                      className={cn(
                        "p-4 rounded-xl border-2 text-center transition-all duration-200",
                        coinPackage === String(pkg.value)
                          ? "border-primary bg-accent"
                          : "border-border hover:border-border/80"
                      )}
                    >
                      <p className="font-bold text-lg">{pkg.value}</p>
                      <p className="text-xs text-muted-foreground">coins</p>
                      <p className="text-xs font-medium text-primary mt-1">{pkg.price}</p>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Dates & Trainer */}
          <div>
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">
              Dates & Assignment
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Start Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className={cn("w-full justify-start text-left font-normal", !startDate && "text-muted-foreground")}>
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {startDate ? format(startDate, "PPP") : "Pick a date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar mode="single" selected={startDate} onSelect={setStartDate} initialFocus className="p-3 pointer-events-auto" />
                  </PopoverContent>
                </Popover>
              </div>

              {planType !== "coin" && (
                <div className="space-y-2">
                  <Label>{t("expirationDate")}</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className={cn("w-full justify-start text-left font-normal", !expiresAt && "text-muted-foreground")}>
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {expiresAt ? format(expiresAt, "PPP") : "Pick a date"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar mode="single" selected={expiresAt} onSelect={setExpiresAt} initialFocus className="p-3 pointer-events-auto" />
                    </PopoverContent>
                  </Popover>
                </div>
              )}

              <div className="space-y-2">
                <Label>{t("assignTrainer")}</Label>
                <Select value={trainerId} onValueChange={setTrainerId}>
                  <SelectTrigger><SelectValue placeholder={t("assignTrainer")} /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">{t("noTrainer")}</SelectItem>
                    {trainers.map((t) => (
                      <SelectItem key={t.id} value={String(t.id)}>{t.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>{t("status")}</Label>
                <Select value={status} onValueChange={(v) => setStatus(v as MemberUI["status"])}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Active">{t("active")}</SelectItem>
                    <SelectItem value="Expiring">{t("expiring")}</SelectItem>
                    <SelectItem value="Expired">{t("expired")}</SelectItem>
                    <SelectItem value="Frozen">{t("frozen")}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label>{t("notes")}</Label>
            <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder={t("notes")} rows={3} />
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>{t("cancel")}</Button>
            <Button type="submit" variant="hero">{isEditing ? t("saveChanges") : t("addMember")}</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default MemberFormDialog;
