import { useState } from "react";
import { format, isToday, isYesterday } from "date-fns";
import { QrCode, UserCheck, Clock, LogOut, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AttendanceRecord } from "@/data/attendance";
import type { MemberUI } from "@/types/api";
import MemberQRDialog from "./MemberQRDialog";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

interface AttendanceHistoryProps {
  records: AttendanceRecord[];
  members?: MemberUI[];
  onCheckOut: (recordId: number) => void;
}

const AttendanceHistory = ({ records, members = [], onCheckOut }: AttendanceHistoryProps) => {
  const [qrMember, setQrMember] = useState<number | null>(null);

  const formatTime = (iso: string) => format(new Date(iso), "h:mm a");
  const formatDay = (iso: string) => {
    const d = new Date(iso);
    if (isToday(d)) return "Today";
    if (isYesterday(d)) return "Yesterday";
    return format(d, "MMM d, yyyy");
  };

  const getDuration = (checkIn: string, checkOut?: string) => {
    if (!checkOut) return null;
    const diff = new Date(checkOut).getTime() - new Date(checkIn).getTime();
    const mins = Math.round(diff / 60000);
    if (mins < 60) return `${mins}m`;
    return `${Math.floor(mins / 60)}h ${mins % 60}m`;
  };

  // Group records by day
  const grouped = records.reduce<Record<string, AttendanceRecord[]>>((acc, r) => {
    const day = formatDay(r.checkInTime);
    if (!acc[day]) acc[day] = [];
    acc[day].push(r);
    return acc;
  }, {});

  const selectedMember = qrMember ? members.find((m) => m.id === qrMember) ?? null : null;

  return (
    <>
      <div className="space-y-6">
        {Object.entries(grouped).map(([day, dayRecords]) => (
          <div key={day}>
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-display font-semibold text-sm">{day}</h3>
              <span className="text-xs text-muted-foreground">{dayRecords.length} check-ins</span>
            </div>
            <div className="space-y-2">
              {dayRecords.map((record) => (
                <motion.div
                  key={record.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="flex items-center justify-between p-4 rounded-xl border border-border bg-card hover:bg-muted/30 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className={cn(
                      "w-10 h-10 rounded-lg flex items-center justify-center shrink-0",
                      record.method === "qr" ? "bg-primary/10" : "bg-accent"
                    )}>
                      {record.method === "qr" ? (
                        <QrCode className="w-5 h-5 text-primary" />
                      ) : (
                        <UserCheck className="w-5 h-5 text-accent-foreground" />
                      )}
                    </div>
                    <div>
                      <p className="font-medium text-sm">{record.memberName}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                          <Clock className="w-3 h-3" /> {formatTime(record.checkInTime)}
                        </span>
                        {record.checkOutTime && (
                          <span className="text-xs text-muted-foreground flex items-center gap-1">
                            → {formatTime(record.checkOutTime)}
                          </span>
                        )}
                        {getDuration(record.checkInTime, record.checkOutTime) && (
                          <Badge variant="secondary" className="text-xs px-1.5 py-0">
                            {getDuration(record.checkInTime, record.checkOutTime)}
                          </Badge>
                        )}
                        {record.coinDeducted && (
                          <Badge variant="outline" className="text-xs px-1.5 py-0 border-primary/30 text-primary">
                            -1 coin
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {!record.checkOutTime && day === "Today" && (
                      <Button variant="outline" size="sm" className="gap-1 text-xs" onClick={() => onCheckOut(record.id)}>
                        <LogOut className="w-3 h-3" /> Check Out
                      </Button>
                    )}
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setQrMember(record.memberId)}>
                      <Eye className="w-4 h-4" />
                    </Button>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        ))}
      </div>

      <MemberQRDialog
        open={!!qrMember}
        onOpenChange={(open) => !open && setQrMember(null)}
        member={selectedMember}
      />
    </>
  );
};

export default AttendanceHistory;
