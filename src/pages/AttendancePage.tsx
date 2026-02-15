import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type { ApiAttendance, ApiMember } from "@/types/api";
import { apiMemberToMemberUI, type MemberUI } from "@/types/api";
import { format } from "date-fns";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { useState } from "react";
import CheckInPanel from "@/components/attendance/CheckInPanel";
import AttendanceHistory from "@/components/attendance/AttendanceHistory";
import GymCheckInQRDialog from "@/components/attendance/GymCheckInQRDialog";
import StatCard from "@/components/dashboard/StatCard";
import { Button } from "@/components/ui/button";
import { Users, QrCode, Clock, TrendingUp } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AttendanceRecord } from "@/data/attendance";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/i18n/LanguageContext";

const AttendancePage = () => {
  const { toast } = useToast();
  const { t } = useLanguage();
  const queryClient = useQueryClient();
  const [gymQROpen, setGymQROpen] = useState(false);

  const { data: attendanceList = [] } = useQuery({
    queryKey: ["attendance"],
    queryFn: async () => {
      const res = await api.get<ApiAttendance[] | { data: ApiAttendance[] }>("/attendance?per_page=100");
      return Array.isArray(res) ? res : (res as { data: ApiAttendance[] }).data ?? [];
    },
  });

  const { data: membersList = [] } = useQuery({
    queryKey: ["members"],
    queryFn: async () => {
      const res = await api.get<ApiMember[] | { data: ApiMember[] }>("/members");
      const list = Array.isArray(res) ? res : (res as { data: ApiMember[] }).data ?? [];
      return list.map(apiMemberToMemberUI);
    },
  });

  const checkInMutation = useMutation({
    mutationFn: (memberId: number) => api.post<ApiAttendance>("/attendance/check-in", { member_id: memberId }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["attendance"] }),
  });
  const checkOutMutation = useMutation({
    mutationFn: (attendanceId: number) => api.post("/attendance/check-out", { attendance_id: attendanceId }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["attendance"] }),
  });

  const records: AttendanceRecord[] = attendanceList.map((r) => ({
    id: r.id,
    memberId: r.member_id,
    memberName: r.member?.name ?? "—",
    checkInTime: r.check_in_at,
    checkOutTime: r.check_out_at ?? undefined,
    method: "manual" as const,
    coinDeducted: false,
  }));

  const todayRecords = records.filter((r) => new Date(r.checkInTime).toDateString() === new Date().toDateString());
  const activeNow = todayRecords.filter((r) => !r.checkOutTime).length;
  const todayCount = todayRecords.length;
  const avgDuration = (() => {
    const completed = todayRecords.filter((r) => r.checkOutTime);
    if (completed.length === 0) return "—";
    const avg = completed.reduce((sum, r) => sum + (new Date(r.checkOutTime!).getTime() - new Date(r.checkInTime).getTime()), 0) / completed.length;
    const mins = Math.round(avg / 60000);
    return mins < 60 ? `${mins}m` : `${Math.floor(mins / 60)}h ${mins % 60}m`;
  })();

  const handleCheckIn = (member: MemberUI, method: "qr" | "manual") => {
    checkInMutation.mutate(member.id, {
      onSuccess: () => toast({ title: `${member.name} ${t("checkIn").toLowerCase()}`, description: `${t("viaQR")} ${format(new Date(), "h:mm a")}` }),
      onError: (e) => toast({ title: "Error", description: e.message, variant: "destructive" }),
    });
  };

  const handleCheckOut = (recordId: number) => {
    checkOutMutation.mutate(recordId);
  };

  return (
    <DashboardLayout>
      <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-display font-bold mb-1">{t("attendanceTitle")}</h1>
          <p className="text-muted-foreground">{t("attendanceDescription")}</p>
        </div>
        <Button variant="outline" size="sm" className="gap-2" onClick={() => setGymQROpen(true)}>
          <QrCode className="w-4 h-4" /> Show gym check-in QR
        </Button>
      </div>
      <GymCheckInQRDialog open={gymQROpen} onOpenChange={setGymQROpen} />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard icon={Users} title={t("inGymNow")} value={String(activeNow)} change={t("currentlyActive")} changeType="neutral" />
        <StatCard icon={QrCode} title={t("todaysCheckIns")} value={String(todayCount)} changeType="positive" change={`${todayRecords.filter(r => r.method === 'qr').length} ${t("viaQR")}`} />
        <StatCard icon={Clock} title={t("avgDuration")} value={avgDuration} change={t("todaysSessions")} changeType="neutral" />
        <StatCard icon={TrendingUp} title={t("totalThisWeek")} value={String(records.length)} change={`${records.length} ${t("sessions")}`} changeType="positive" />
      </div>

      <Tabs defaultValue="checkin" className="space-y-6">
        <TabsList className="bg-muted">
          <TabsTrigger value="checkin" className="gap-2"><QrCode className="w-4 h-4" /> {t("checkIn")}</TabsTrigger>
          <TabsTrigger value="history" className="gap-2"><Clock className="w-4 h-4" /> {t("sessionHistory")}</TabsTrigger>
        </TabsList>
        <TabsContent value="checkin"><div className="max-w-2xl"><CheckInPanel members={membersList} onCheckIn={handleCheckIn} /></div></TabsContent>
        <TabsContent value="history"><AttendanceHistory records={records} members={membersList} onCheckOut={handleCheckOut} /></TabsContent>
      </Tabs>
    </DashboardLayout>
  );
};

export default AttendancePage;
