import {
  Sheet, SheetContent, SheetHeader, SheetTitle,
} from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { weekDays } from "@/data/trainers";
import type { TrainerUI } from "@/types/api";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import {
  Pencil, Mail, Phone, Calendar, Award, Clock,
  Users, DollarSign, TrendingUp,
} from "lucide-react";

interface CommissionRecord {
  id: number;
  trainerId: number;
  memberName: string;
  type: string;
  amount: number;
  date: string;
  status: string;
}

interface TrainerDetailSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  trainer: TrainerUI | null;
  commissions: CommissionRecord[];
  onEdit: (trainer: TrainerUI) => void;
}

const TrainerDetailSheet = ({ open, onOpenChange, trainer, commissions, onEdit }: TrainerDetailSheetProps) => {
  if (!trainer) return null;

  const trainerCommissions = commissions.filter((c) => c.trainerId === trainer.id);
  const totalEarned = trainerCommissions.filter((c) => c.status === "paid").reduce((a, c) => a + c.amount, 0);
  const totalPending = trainerCommissions.filter((c) => c.status === "pending").reduce((a, c) => a + c.amount, 0);
  const schedule = Array.isArray(trainer.schedule) ? trainer.schedule : [];

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-md overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="flex items-center justify-between pr-4">
            <span>{trainer.name}</span>
            <Button variant="outline" size="sm" className="gap-1.5" onClick={() => { onOpenChange(false); onEdit(trainer); }}>
              <Pencil className="w-3.5 h-3.5" /> Edit
            </Button>
          </SheetTitle>
        </SheetHeader>

        <div className="mt-4 space-y-6">
          {/* Header card */}
          <div className="rounded-xl bg-muted/50 p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-primary">{trainer.specialty}</span>
              <Badge variant={trainer.status === "Active" ? "default" : trainer.status === "On Leave" ? "secondary" : "destructive"}>
                {trainer.status}
              </Badge>
            </div>
            {trainer.bio && <p className="text-sm text-muted-foreground">{trainer.bio}</p>}
            <div className="flex flex-wrap gap-1.5">
              {trainer.certifications.map((c) => (
                <span key={c} className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs bg-primary/10 text-primary">
                  <Award className="w-3 h-3" /> {c}
                </span>
              ))}
            </div>
          </div>

          {/* Contact */}
          <div className="space-y-2">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Contact</h4>
            <div className="space-y-1.5 text-sm">
              <div className="flex items-center gap-2 text-muted-foreground"><Mail className="w-4 h-4" /> {trainer.email}</div>
              <div className="flex items-center gap-2 text-muted-foreground"><Phone className="w-4 h-4" /> {trainer.phone}</div>
              <div className="flex items-center gap-2 text-muted-foreground"><Calendar className="w-4 h-4" /> Hired {format(new Date(trainer.hireDate), "MMM d, yyyy")}</div>
            </div>
          </div>

          <Tabs defaultValue="schedule" className="w-full">
            <TabsList className="w-full">
              <TabsTrigger value="schedule" className="flex-1 gap-1"><Clock className="w-3.5 h-3.5" /> Schedule</TabsTrigger>
              <TabsTrigger value="members" className="flex-1 gap-1"><Users className="w-3.5 h-3.5" /> Members</TabsTrigger>
              <TabsTrigger value="commissions" className="flex-1 gap-1"><DollarSign className="w-3.5 h-3.5" /> Earnings</TabsTrigger>
            </TabsList>

            {/* Schedule */}
            <TabsContent value="schedule" className="mt-3 space-y-2">
              <div className="flex gap-1.5">
                {weekDays.map((d) => {
                  const active = schedule.some((s) => s.day === d);
                  return (
                    <div key={d} className={cn(
                      "w-9 h-9 rounded-lg flex items-center justify-center text-xs font-medium",
                      active ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                    )}>
                      {d}
                    </div>
                  );
                })}
              </div>
              {schedule.length > 0 ? (
                <div className="space-y-1.5">
                  {weekDays.filter((d) => schedule.some((s) => s.day === d)).map((d) => {
                    const slot = schedule.find((s) => s.day === d)!;
                    return (
                      <div key={d} className="flex items-center gap-3 text-sm rounded-lg bg-muted/30 px-3 py-2">
                        <span className="w-10 font-medium">{d}</span>
                        <span className="text-muted-foreground">{slot.startTime ?? "—"} – {slot.endTime ?? "—"}</span>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">No schedule set.</p>
              )}
            </TabsContent>

            {/* Members */}
            <TabsContent value="members" className="mt-3">
              {trainer.membersCount === 0 ? (
                <p className="text-sm text-muted-foreground py-4 text-center">No members assigned.</p>
              ) : (
                <p className="text-sm text-muted-foreground py-2">{trainer.membersCount} member(s) assigned.</p>
              )}
            </TabsContent>

            {/* Commissions */}
            <TabsContent value="commissions" className="mt-3 space-y-3">
              <div className="grid grid-cols-2 gap-2">
                <div className="rounded-lg bg-success/10 p-3 text-center">
                  <p className="text-lg font-bold text-success">{totalEarned.toLocaleString()} EGP</p>
                  <p className="text-xs text-muted-foreground">Total Paid</p>
                </div>
                <div className="rounded-lg bg-primary/10 p-3 text-center">
                  <p className="text-lg font-bold text-primary">{totalPending.toLocaleString()} EGP</p>
                  <p className="text-xs text-muted-foreground">Pending</p>
                </div>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <TrendingUp className="w-4 h-4" />
                <span>Base salary: {(trainer.monthlySalary ?? 0).toLocaleString()} EGP/mo · {trainer.commissionRate}% commission</span>
              </div>
              {trainerCommissions.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-3">No commission records.</p>
              ) : (
                <div className="space-y-1.5">
                  {trainerCommissions.map((c) => (
                    <div key={c.id} className="flex items-center justify-between rounded-lg bg-muted/30 px-3 py-2 text-sm">
                      <div>
                        <p className="font-medium">{c.memberName}</p>
                        <p className="text-xs text-muted-foreground capitalize">{c.type} · {format(new Date(c.date), "MMM d")}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">{c.amount} EGP</p>
                        <Badge variant={c.status === "paid" ? "default" : "secondary"} className="text-[10px]">{c.status}</Badge>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default TrainerDetailSheet;
