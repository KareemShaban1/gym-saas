import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { memberApi } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { QrCode } from "lucide-react";
import { format } from "date-fns";
import MemberCheckInQRScanner from "@/components/member/MemberCheckInQRScanner";

function safeFormat(dateInput: string | null | undefined, fmt: string): string {
  if (dateInput == null) return "—";
  const d = new Date(dateInput);
  if (Number.isNaN(d.getTime())) return "—";
  return format(d, fmt);
}

export default function MemberAttendancePage() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [qrScanOpen, setQrScanOpen] = useState(false);
  const [checkOutLoading, setCheckOutLoading] = useState(false);
  const { data: openAttendance } = useQuery({
    queryKey: ["member", "attendance", "open"],
    queryFn: async () => {
      const res = await memberApi.get<{ id: number; check_in_at: string } | { data: { id: number; check_in_at: string } } | null>("/attendance/open");
      if (res == null) return null;
      return "data" in res && res.data != null ? res.data : res;
    },
  });

  const { data: listRaw, isLoading } = useQuery({
    queryKey: ["member", "attendance", "list"],
    queryFn: () => memberApi.get<{ id: number; check_in_at: string; check_out_at: string | null }[] | { data: { id: number; check_in_at: string; check_out_at: string | null }[] }>("/attendance?per_page=30"),
  });
  const list = Array.isArray(listRaw) ? listRaw : (listRaw as { data?: unknown[] } | undefined)?.data ?? [];

  const record = openAttendance as { id?: number; data?: { id: number; check_in_at?: string }; check_in_at?: string } | null;
  const openAttendanceId = record?.id ?? record?.data?.id;
  const canCheckIn = !openAttendanceId;
  const canCheckOut = !!openAttendanceId;

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
      <h1 className="text-xl font-display font-bold">Attendance</h1>

      <Card className="overflow-hidden border-primary/20">
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
            <div>
              <p className="font-medium">{canCheckIn ? "Check in" : "You're checked in"}</p>
              <p className="text-sm text-muted-foreground">
                {canCheckIn
                  ? "Scan the gym's QR at the entrance or ask staff to check you in"
                  : `Checked in at ${safeFormat(record?.check_in_at ?? record?.data?.check_in_at, "h:mm a")}`}
              </p>
            </div>
            {canCheckIn && (
              <Button onClick={() => setQrScanOpen(true)} variant="hero" size="lg" className="gap-2 shrink-0">
                <QrCode className="w-5 h-5" />
                Scan QR to check in
              </Button>
            )}
            {canCheckOut && (
              <Button onClick={handleCheckOut} variant="outline" size="lg" className="shrink-0" disabled={checkOutLoading}>
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

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Visit history</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <p className="text-sm text-muted-foreground">Loading…</p>
          ) : list.length === 0 ? (
            <p className="text-sm text-muted-foreground">No visits yet.</p>
          ) : (
            <ul className="space-y-3">
              {list.map((a) => (
                <li
                  key={a.id}
                  className="flex justify-between items-center py-2 border-b border-border last:border-0 last:pb-0"
                >
                  <span className="text-sm font-medium">{safeFormat(a.check_in_at, "EEE, MMM d, yyyy")}</span>
                  <span className="text-sm text-muted-foreground">
                    {safeFormat(a.check_in_at, "h:mm a")}
                    {a.check_out_at ? ` – ${safeFormat(a.check_out_at, "h:mm a")}` : " (in)"}
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
