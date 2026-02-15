import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { memberApi } from "@/lib/api";
import { useMemberAuth } from "@/contexts/MemberAuthContext";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CalendarCheck, Dumbbell, CreditCard, MessageCircle, ChevronRight, QrCode } from "lucide-react";
import { format } from "date-fns";
import MemberCheckInQRScanner from "@/components/member/MemberCheckInQRScanner";

function safeFormat(dateInput: string | null | undefined, fmt: string): string {
  if (dateInput == null) return "—";
  const d = new Date(dateInput);
  if (Number.isNaN(d.getTime())) return "—";
  return format(d, fmt);
}

export default function MemberDashboard() {
  const { member } = useMemberAuth();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [checkOutLoading, setCheckOutLoading] = useState(false);

  const { data: openAttendance } = useQuery({
    queryKey: ["member", "attendance", "open"],
    queryFn: async () => {
      const res = await memberApi.get<{ id: number; check_in_at: string } | { data: { id: number; check_in_at: string } } | null>("/attendance/open");
      if (res == null) return null;
      return "data" in res && res.data != null ? res.data : res;
    },
  });

  const { data: recentAttendanceRaw } = useQuery({
    queryKey: ["member", "attendance"],
    queryFn: () => memberApi.get<{ id: number; check_in_at: string; check_out_at: string | null }[] | { data: { id: number; check_in_at: string; check_out_at: string | null }[] }>("/attendance?per_page=5"),
  });
  const recentAttendance = Array.isArray(recentAttendanceRaw) ? recentAttendanceRaw : (recentAttendanceRaw as { data?: unknown[] } | undefined)?.data ?? [];

  const record = openAttendance as { id?: number; data?: { id: number; check_in_at?: string }; check_in_at?: string } | null;
  const openAttendanceId = record?.id ?? record?.data?.id;
  const canCheckIn = !openAttendanceId;
  const canCheckOut = !!openAttendanceId;
  const [qrScanOpen, setQrScanOpen] = useState(false);

  const handleCheckOut = async () => {
    if (!openAttendanceId) {
      toast({ title: "Check out", description: "No open attendance found.", variant: "destructive" });
      return;
    }
    setCheckOutLoading(true);
    try {
      await memberApi.post("/attendance/check-out", { attendance_id: openAttendanceId });
      queryClient.invalidateQueries({ queryKey: ["member", "attendance"] });
      toast({ title: "Checked out", description: "You have been checked out." });
    } catch (e) {
      toast({ title: "Check out failed", description: (e as Error).message, variant: "destructive" });
    } finally {
      setCheckOutLoading(false);
    }
  };

  return (
    <div className="p-4 space-y-6 max-w-lg mx-auto">
      <div>
        <h1 className="text-xl font-display font-bold">Hi, {member?.name?.split(" ")[0] ?? "Member"}</h1>
        <p className="text-muted-foreground text-sm mt-0.5">
          {member?.gym?.name} · {member?.status ?? "Active"}
        </p>
      </div>

      <Card className="overflow-hidden border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
        <CardContent className="p-4">
          <div className="flex flex-col gap-4">
            <div>
              <p className="font-medium">{canCheckIn ? "Check in at the gym" : "You're checked in"}</p>
              <p className="text-sm text-muted-foreground">
                {canCheckIn
                  ? "Scan the gym's QR at the entrance or ask staff to check you in"
                  : `Since ${safeFormat(record?.check_in_at ?? record?.data?.check_in_at, "h:mm a")}`}
              </p>
            </div>
            {canCheckIn && (
              <Button onClick={() => setQrScanOpen(true)} variant="hero" size="lg" className="gap-2 w-full">
                <QrCode className="w-5 h-5" />
                Scan QR to check in
              </Button>
            )}
            {canCheckOut && (
              <Button onClick={handleCheckOut} variant="outline" size="lg" className="gap-2 w-full sm:w-auto" disabled={checkOutLoading}>
                {checkOutLoading ? "Checking out…" : "Check out"}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      <MemberCheckInQRScanner
        open={qrScanOpen}
        onOpenChange={setQrScanOpen}
        onSuccess={() => queryClient.invalidateQueries({ queryKey: ["member", "attendance"] })}
      />

      <div className="grid grid-cols-2 gap-3">
        <Link to="/member/workouts">
          <Card className="h-full transition-colors hover:bg-muted/50 active:scale-[0.98]">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <Dumbbell className="w-5 h-5 text-primary" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-medium text-sm">My workouts</p>
                <p className="text-xs text-muted-foreground">Exercises & plans</p>
              </div>
              <ChevronRight className="w-4 h-4 text-muted-foreground shrink-0" />
            </CardContent>
          </Card>
        </Link>
        <Link to="/member/chat">
          <Card className="h-full transition-colors hover:bg-muted/50 active:scale-[0.98]">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <MessageCircle className="w-5 h-5 text-primary" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-medium text-sm">Chat</p>
                <p className="text-xs text-muted-foreground">Trainer support</p>
              </div>
              <ChevronRight className="w-4 h-4 text-muted-foreground shrink-0" />
            </CardContent>
          </Card>
        </Link>
        <Link to="/member/payments" className="col-span-2">
          <Card className="transition-colors hover:bg-muted/50 active:scale-[0.98]">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <CreditCard className="w-5 h-5 text-primary" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-medium text-sm">Payments</p>
                <p className="text-xs text-muted-foreground">History & receipts</p>
              </div>
              <ChevronRight className="w-4 h-4 text-muted-foreground shrink-0" />
            </CardContent>
          </Card>
        </Link>
      </div>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2">
            <CalendarCheck className="w-4 h-4" />
            Recent visits
          </CardTitle>
        </CardHeader>
        <CardContent>
          {recentAttendance.length === 0 ? (
            <p className="text-sm text-muted-foreground">No visits yet. Check in when you're at the gym.</p>
          ) : (
            <ul className="space-y-2">
              {recentAttendance.slice(0, 5).map((a) => (
                <li key={a.id} className="flex justify-between text-sm">
                  <span>{safeFormat(a.check_in_at, "EEE, MMM d")}</span>
                  <span className="text-muted-foreground">
                    {safeFormat(a.check_in_at, "h:mm a")}
                    {a.check_out_at ? ` – ${safeFormat(a.check_out_at, "h:mm a")}` : " – …"}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
