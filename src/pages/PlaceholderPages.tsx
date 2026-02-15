import DashboardLayout from "@/components/dashboard/DashboardLayout";

const PlaceholderPage = ({ title, description }: { title: string; description: string }) => (
  <DashboardLayout>
    <div className="mb-8">
      <h1 className="text-2xl font-display font-bold mb-1">{title}</h1>
      <p className="text-muted-foreground">{description}</p>
    </div>
    <div className="rounded-xl border border-border bg-card p-12 text-center">
      <p className="text-muted-foreground">This section is coming soon. Stay tuned!</p>
    </div>
  </DashboardLayout>
);



export const AttendancePage = () => <PlaceholderPage title="Attendance" description="Track member check-ins with QR codes." />; // kept as fallback




