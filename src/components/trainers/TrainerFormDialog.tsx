import { useState, useEffect } from "react";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { ScheduleSlot, specialties, weekDays } from "@/data/trainers";
import type { TrainerUI } from "@/types/api";
import { Plus, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface TrainerFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  trainer: TrainerUI | null;
  onSave: (data: Partial<TrainerUI> & { id?: number }) => void;
}

const emptySchedule: ScheduleSlot[] = [];

const TrainerFormDialog = ({ open, onOpenChange, trainer, onSave }: TrainerFormDialogProps) => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [gender, setGender] = useState<"male" | "female">("male");
  const [specialty, setSpecialty] = useState(specialties[0]);
  const [certifications, setCertifications] = useState<string[]>([]);
  const [certInput, setCertInput] = useState("");
  const [hireDate, setHireDate] = useState("");
  const [status, setStatus] = useState<string>("Active");
  const [commissionRate, setCommissionRate] = useState(15);
  const [monthlySalary, setMonthlySalary] = useState(7000);
  const [schedule, setSchedule] = useState<ScheduleSlot[]>(emptySchedule);
  const [bio, setBio] = useState("");

  useEffect(() => {
    if (trainer) {
      setName(trainer.name);
      setEmail(trainer.email);
      setPhone(trainer.phone);
      setGender(trainer.gender);
      setSpecialty(trainer.specialty);
      setCertifications([...trainer.certifications]);
      setHireDate(trainer.hireDate);
      setStatus(trainer.status);
      setCommissionRate(trainer.commissionRate);
      setMonthlySalary(trainer.monthlySalary);
      setSchedule(Array.isArray(trainer.schedule) ? [...trainer.schedule] as ScheduleSlot[] : []);
      setBio(trainer.bio || "");
    } else {
      setName(""); setEmail(""); setPhone(""); setGender("male");
      setSpecialty(specialties[0]); setCertifications([]); setCertInput("");
      setHireDate(""); setStatus("Active"); setCommissionRate(15);
      setMonthlySalary(7000); setSchedule([]); setBio("");
    }
  }, [trainer, open]);

  const addCert = () => {
    if (certInput.trim() && !certifications.includes(certInput.trim())) {
      setCertifications([...certifications, certInput.trim()]);
      setCertInput("");
    }
  };

  const removeCert = (c: string) => setCertifications(certifications.filter((x) => x !== c));

  const toggleDay = (day: ScheduleSlot["day"]) => {
    const exists = schedule.find((s) => s.day === day);
    if (exists) {
      setSchedule(schedule.filter((s) => s.day !== day));
    } else {
      setSchedule([...schedule, { day, startTime: "09:00", endTime: "17:00" }]);
    }
  };

  const updateSlotTime = (day: ScheduleSlot["day"], field: "startTime" | "endTime", value: string) => {
    setSchedule(schedule.map((s) => s.day === day ? { ...s, [field]: value } : s));
  };

  const handleSubmit = () => {
    if (!name || !email || !phone) return;
    onSave({
      ...(trainer ? { id: trainer.id } : {}),
      name, email, phone, gender, specialty, certifications,
      hireDate: hireDate || new Date().toISOString().split("T")[0],
      status, commissionRate, monthlySalary, schedule,
      bio,
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{trainer ? "Edit Trainer" : "Add Trainer"}</DialogTitle>
        </DialogHeader>

        <div className="grid gap-4 py-2">
          {/* Name & Gender */}
          <div className="grid grid-cols-3 gap-3">
            <div className="col-span-2 space-y-1.5">
              <Label>Full Name</Label>
              <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Coach Name" />
            </div>
            <div className="space-y-1.5">
              <Label>Gender</Label>
              <Select value={gender} onValueChange={(v) => setGender(v as "male" | "female")}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="male">Male</SelectItem>
                  <SelectItem value="female">Female</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Contact */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Email</Label>
              <Input value={email} onChange={(e) => setEmail(e.target.value)} type="email" />
            </div>
            <div className="space-y-1.5">
              <Label>Phone</Label>
              <Input value={phone} onChange={(e) => setPhone(e.target.value)} />
            </div>
          </div>

          {/* Specialty & Status */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Specialty</Label>
              <Select value={specialty} onValueChange={setSpecialty}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {specialties.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Status</Label>
              <Select value={status} onValueChange={setStatus}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Active">Active</SelectItem>
                  <SelectItem value="On Leave">On Leave</SelectItem>
                  <SelectItem value="Inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Certifications */}
          <div className="space-y-1.5">
            <Label>Certifications</Label>
            <div className="flex gap-2">
              <Input
                value={certInput} onChange={(e) => setCertInput(e.target.value)}
                placeholder="e.g. NASM CPT"
                onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addCert())}
              />
              <Button type="button" variant="outline" size="icon" onClick={addCert}><Plus className="w-4 h-4" /></Button>
            </div>
            {certifications.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-2">
                {certifications.map((c) => (
                  <span key={c} className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs bg-primary/10 text-primary">
                    {c}
                    <button onClick={() => removeCert(c)} className="hover:text-destructive"><X className="w-3 h-3" /></button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Compensation */}
          <div className="grid grid-cols-3 gap-3">
            <div className="space-y-1.5">
              <Label>Salary (EGP)</Label>
              <Input type="number" value={monthlySalary} onChange={(e) => setMonthlySalary(Number(e.target.value))} />
            </div>
            <div className="space-y-1.5">
              <Label>Commission %</Label>
              <Input type="number" value={commissionRate} onChange={(e) => setCommissionRate(Number(e.target.value))} min={0} max={100} />
            </div>
            <div className="space-y-1.5">
              <Label>Hire Date</Label>
              <Input type="date" value={hireDate} onChange={(e) => setHireDate(e.target.value)} />
            </div>
          </div>

          {/* Schedule */}
          <div className="space-y-2">
            <Label>Weekly Schedule</Label>
            <div className="flex gap-1.5 flex-wrap">
              {weekDays.map((day) => {
                const active = schedule.some((s) => s.day === day);
                return (
                  <button
                    key={day}
                    type="button"
                    onClick={() => toggleDay(day)}
                    className={cn(
                      "w-10 h-10 rounded-lg text-xs font-medium transition-colors",
                      active ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-muted/80"
                    )}
                  >
                    {day}
                  </button>
                );
              })}
            </div>
            {schedule.length > 0 && (
              <div className="space-y-2 mt-2">
                {weekDays.filter((d) => schedule.some((s) => s.day === d)).map((day) => {
                  const slot = schedule.find((s) => s.day === day)!;
                  return (
                    <div key={day} className="flex items-center gap-2 text-sm">
                      <span className="w-10 font-medium text-muted-foreground">{day}</span>
                      <Input
                        type="time" value={slot.startTime}
                        onChange={(e) => updateSlotTime(day, "startTime", e.target.value)}
                        className="w-28 h-8 text-xs"
                      />
                      <span className="text-muted-foreground">to</span>
                      <Input
                        type="time" value={slot.endTime}
                        onChange={(e) => updateSlotTime(day, "endTime", e.target.value)}
                        className="w-28 h-8 text-xs"
                      />
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Bio */}
          <div className="space-y-1.5">
            <Label>Bio (optional)</Label>
            <Textarea value={bio} onChange={(e) => setBio(e.target.value)} rows={2} placeholder="Short bio..." />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button variant="hero" onClick={handleSubmit} disabled={!name || !email || !phone}>
            {trainer ? "Save Changes" : "Add Trainer"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default TrainerFormDialog;
