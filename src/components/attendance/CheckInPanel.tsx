import { useState } from "react";
import { Search, UserCheck, AlertCircle, CheckCircle2, Coins } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import type { MemberUI } from "@/types/api";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

interface CheckInPanelProps {
  members?: MemberUI[];
  onCheckIn: (member: MemberUI, method: "qr" | "manual") => void;
}

const CheckInPanel = ({ members = [], onCheckIn }: CheckInPanelProps) => {
  const [search, setSearch] = useState("");
  const [scannedMember, setScannedMember] = useState<MemberUI | null>(null);
  const [checkInResult, setCheckInResult] = useState<{ success: boolean; message: string } | null>(null);

  const filteredMembers = search.length >= 2
    ? members.filter(
        (m) =>
          m.name.toLowerCase().includes(search.toLowerCase()) ||
          m.phone.includes(search) ||
          String(m.id) === search
      )
    : [];

  const handleQuickCheckIn = (member: MemberUI) => {
    setScannedMember(member);
    if (member.status === "Expired") {
      setCheckInResult({ success: false, message: `${member.name}'s subscription has expired.` });
    } else if (member.planType === "coin" && (member.coinBalance ?? 0) <= 0) {
      setCheckInResult({ success: false, message: `${member.name} has no coins remaining.` });
    } else {
      onCheckIn(member, "manual");
      setCheckInResult({
        success: true,
        message: member.planType === "coin"
          ? `${member.name} checked in! 1 coin deducted (${(member.coinBalance ?? 1) - 1} remaining).`
          : `${member.name} checked in successfully!`,
      });
    }
    setSearch("");
    setTimeout(() => {
      setCheckInResult(null);
      setScannedMember(null);
    }, 4000);
  };

  const simulateQRScan = () => {
    const activeMembers = members.filter((m) => m.status === "Active" || m.status === "Expiring");
    if (activeMembers.length === 0) return;
    const random = activeMembers[Math.floor(Math.random() * activeMembers.length)];
    setScannedMember(random);
    onCheckIn(random, "qr");
    setCheckInResult({
      success: true,
      message: random.planType === "coin"
        ? `${random.name} scanned in! 1 coin deducted.`
        : `${random.name} scanned in successfully!`,
    });
    setTimeout(() => {
      setCheckInResult(null);
      setScannedMember(null);
    }, 4000);
  };

  return (
    <div className="space-y-6">
      {/* QR Scanner Simulation */}
      <div className="rounded-2xl border-2 border-dashed border-border bg-muted/30 p-8 text-center">
        <div className="relative mx-auto w-48 h-48 mb-4">
          <div className="absolute inset-0 rounded-2xl border-2 border-primary/30" />
          <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-primary rounded-tl-lg" />
          <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-primary rounded-tr-lg" />
          <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-primary rounded-bl-lg" />
          <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-primary rounded-br-lg" />
          <motion.div
            className="absolute left-2 right-2 h-0.5 bg-primary/80"
            animate={{ top: ["10%", "90%", "10%"] }}
            transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
          />
          <div className="flex items-center justify-center h-full">
            <p className="text-sm text-muted-foreground">QR Scanner Area</p>
          </div>
        </div>
        <Button variant="hero" onClick={simulateQRScan} className="gap-2">
          <UserCheck className="w-4 h-4" /> Simulate QR Scan
        </Button>
        <p className="text-xs text-muted-foreground mt-2">
          In production, this connects to a camera-based QR reader
        </p>
      </div>

      {/* Check-in Result */}
      <AnimatePresence>
        {checkInResult && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            className={cn(
              "p-4 rounded-xl flex items-start gap-3",
              checkInResult.success
                ? "bg-success/10 border border-success/20"
                : "bg-destructive/10 border border-destructive/20"
            )}
          >
            {checkInResult.success ? (
              <CheckCircle2 className="w-5 h-5 text-success mt-0.5 shrink-0" />
            ) : (
              <AlertCircle className="w-5 h-5 text-destructive mt-0.5 shrink-0" />
            )}
            <div>
              <p className={cn("font-medium text-sm", checkInResult.success ? "text-success" : "text-destructive")}>
                {checkInResult.success ? "Check-in Successful" : "Check-in Failed"}
              </p>
              <p className="text-sm text-muted-foreground">{checkInResult.message}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Manual Check-in */}
      <div>
        <h3 className="font-display font-semibold mb-3">Manual Check-in</h3>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search by name, phone, or member ID..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        {filteredMembers.length > 0 && (
          <div className="mt-2 rounded-xl border border-border bg-card overflow-hidden">
            {filteredMembers.map((member) => (
              <button
                key={member.id}
                onClick={() => handleQuickCheckIn(member)}
                className="flex items-center justify-between w-full px-4 py-3 text-left hover:bg-muted/50 transition-colors border-b border-border last:border-0"
              >
                <div>
                  <p className="font-medium text-sm">{member.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {member.phone} • ID #{member.id}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  {member.planType === "coin" && (
                    <span className="flex items-center gap-1 text-xs text-primary">
                      <Coins className="w-3 h-3" /> {member.coinBalance}
                    </span>
                  )}
                  <span className={cn(
                    "px-2 py-0.5 rounded-full text-xs font-medium",
                    member.status === "Active" && "bg-success/10 text-success",
                    member.status === "Expiring" && "bg-primary/10 text-primary",
                    member.status === "Expired" && "bg-destructive/10 text-destructive",
                  )}>
                    {member.status}
                  </span>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default CheckInPanel;
