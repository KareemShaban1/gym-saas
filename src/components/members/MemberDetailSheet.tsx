import { format } from "date-fns";
import { Mail, Phone, Dumbbell, CalendarDays, Coins, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { MemberUI } from "@/types/api";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/i18n/LanguageContext";

interface MemberDetailSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  member: MemberUI | null;
  onEdit: (member: MemberUI) => void;
  onStatusChange?: (member: MemberUI, status: MemberUI["status"]) => void;
}

const statusColors: Record<string, string> = {
  Active: "bg-success/10 text-success border-success/30",
  Expiring: "bg-primary/10 text-primary border-primary/30",
  Expired: "bg-destructive/10 text-destructive border-destructive/30",
  Frozen: "bg-info/10 text-info border-info/30",
};

const MemberDetailSheet = ({ open, onOpenChange, member, onEdit, onStatusChange }: MemberDetailSheetProps) => {
  const { t } = useLanguage();
  if (!member) return null;

  const planLabel = member.planType === "monthly"
    ? `Monthly - ${member.planTier?.charAt(0).toUpperCase()}${member.planTier?.slice(1)}`
    : member.planType === "bundle"
    ? `${member.bundleMonths}-Month Bundle${member.planTier ? ` - ${member.planTier.charAt(0).toUpperCase()}${member.planTier.slice(1)}` : ""}`
    : `Coin Pack (${member.coinPackage ?? 0} coins)`;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-md overflow-y-auto">
        <SheetHeader className="pb-4">
          <div className="flex items-center justify-between gap-2">
            <SheetTitle className="font-display text-xl truncate">{member.name}</SheetTitle>
          </div>
          <div className="flex items-center gap-2">
            {onStatusChange ? (
              <Select
                value={member.status}
                onValueChange={(v) => onStatusChange(member, v as MemberUI["status"])}
              >
                <SelectTrigger className={cn("w-[130px] border-2", statusColors[member.status])}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Active">{t("active")}</SelectItem>
                  <SelectItem value="Expiring">{t("expiring")}</SelectItem>
                  <SelectItem value="Expired">{t("expired")}</SelectItem>
                  <SelectItem value="Frozen">{t("frozen")}</SelectItem>
                </SelectContent>
              </Select>
            ) : (
              <span className={cn("inline-flex items-center rounded-md border px-2.5 py-0.5 text-sm font-medium", statusColors[member.status])}>
                {member.status}
              </span>
            )}
          </div>
        </SheetHeader>

        <div className="space-y-6 mt-4">
          {/* Contact */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Contact</h4>
            <div className="space-y-2">
              <div className="flex items-center gap-3 text-sm">
                <Mail className="w-4 h-4 text-muted-foreground" />
                <span>{member.email}</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <Phone className="w-4 h-4 text-muted-foreground" />
                <span>{member.phone}</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <User className="w-4 h-4 text-muted-foreground" />
                <span className="capitalize">{member.gender}</span>
              </div>
            </div>
          </div>

          {/* Subscription */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Subscription</h4>
            <div className="p-4 rounded-xl border border-border bg-muted/30 space-y-3">
              <div className="flex items-center gap-3">
                <Dumbbell className="w-4 h-4 text-primary" />
                <span className="font-medium text-sm">{planLabel}</span>
              </div>
              {member.planType === "coin" && (
                <div className="flex items-center gap-3">
                  <Coins className="w-4 h-4 text-primary" />
                  <span className="text-sm">{member.coinBalance} coins remaining</span>
                </div>
              )}
              <div className="flex items-center gap-3">
                <CalendarDays className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm">Started: {format(new Date(member.startDate), "PPP")}</span>
              </div>
              {member.expiresAt && (
                <div className="flex items-center gap-3">
                  <CalendarDays className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm">Expires: {format(new Date(member.expiresAt), "PPP")}</span>
                </div>
              )}
            </div>
          </div>

          {/* Trainer */}
          {member.trainer && (
            <div className="space-y-3">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Trainer</h4>
              <p className="text-sm">{member.trainer}</p>
            </div>
          )}

          {/* Notes */}
          {member.notes && (
            <div className="space-y-3">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Notes</h4>
              <p className="text-sm text-muted-foreground">{member.notes}</p>
            </div>
          )}

          <div className="flex gap-3 pt-4">
            <Button variant="hero" className="flex-1" onClick={() => { onEdit(member); onOpenChange(false); }}>
              Edit Member
            </Button>
            <Button variant="outline" className="flex-1" onClick={() => onOpenChange(false)}>
              Close
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default MemberDetailSheet;
