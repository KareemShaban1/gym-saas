import { Link } from "react-router-dom";
import { useMemberAuth } from "@/contexts/MemberAuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { LogOut, User, Building2, Calendar } from "lucide-react";
import { format } from "date-fns";

export default function MemberProfilePage() {
  const { member, logout } = useMemberAuth();

  if (!member) return null;

  return (
    <div className="p-4 space-y-6 max-w-lg mx-auto pb-8">
      <h1 className="text-xl font-display font-bold">Profile</h1>

      <Card>
        <CardContent className="p-4 flex items-center gap-4">
          <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
            <User className="w-7 h-7 text-primary" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="font-semibold text-lg">{member.name}</p>
            <p className="text-sm text-muted-foreground">{member.email}</p>
            {member.phone && <p className="text-sm text-muted-foreground">{member.phone}</p>}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2">
            <Building2 className="w-4 h-4" />
            Membership
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <p><span className="text-muted-foreground">Gym:</span> {member.gym?.name}</p>
          <p><span className="text-muted-foreground">Plan:</span> {member.gym_plan?.name ?? member.plan_type ?? "—"}</p>
          <p><span className="text-muted-foreground">Status:</span> {member.status ?? "Active"}</p>
          {member.expires_at && (
            <p><span className="text-muted-foreground">Expires:</span> {format(new Date(member.expires_at), "MMM d, yyyy")}</p>
          )}
          {member.trainer && (
            <p><span className="text-muted-foreground">Trainer:</span> {member.trainer.name}</p>
          )}
        </CardContent>
      </Card>

      <Button variant="outline" className="w-full gap-2" onClick={() => logout()}>
        <LogOut className="w-4 h-4" />
        Sign out
      </Button>
    </div>
  );
}
