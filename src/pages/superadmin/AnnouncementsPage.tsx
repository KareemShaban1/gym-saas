import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import SuperAdminLayout from "@/components/superadmin/SuperAdminLayout";
import { Badge } from "@/components/ui/badge";
import { Megaphone } from "lucide-react";

interface Announcement {
  id: number;
  title: string;
  body: string | null;
  type: string;
  gym_id: number | null;
  is_published: boolean;
  gym?: { name: string } | null;
}

export default function AnnouncementsPage() {
  const { data: announcements, isLoading } = useQuery({
    queryKey: ["super-admin-announcements"],
    queryFn: () => api.get<Announcement[]>("/super-admin/announcements"),
  });

  return (
    <SuperAdminLayout>
      <h1 className="text-2xl font-display font-bold mb-2">Announcements</h1>
      <p className="text-muted-foreground mb-8">Platform-wide and per-gym announcements</p>
      <div className="rounded-xl border bg-card overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center text-muted-foreground">Loading…</div>
        ) : (
          <div className="divide-y">
            {(announcements ?? []).map((a) => (
              <div key={a.id} className="p-4">
                <div className="flex gap-3">
                  <Megaphone className="w-5 h-5 text-muted-foreground shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium">{a.title}</p>
                    {a.body && <p className="text-sm text-muted-foreground mt-1">{a.body}</p>}
                    <div className="flex items-center gap-2 mt-2">
                      <Badge variant="outline">{a.type}</Badge>
                      {a.gym_id ? <span className="text-xs text-muted-foreground">Gym: {a.gym?.name ?? a.gym_id}</span> : <span className="text-xs text-muted-foreground">Platform-wide</span>}
                      {!a.is_published && <Badge variant="secondary">Draft</Badge>}
                    </div>
                  </div>
                </div>
              </div>
            ))}
            {(!announcements || announcements.length === 0) && <div className="p-8 text-center text-muted-foreground">No announcements.</div>}
          </div>
        )}
      </div>
    </SuperAdminLayout>
  );
}
