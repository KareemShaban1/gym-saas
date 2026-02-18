import { useTrainerAuth } from "@/contexts/TrainerAuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { LogOut, User } from "lucide-react";

export default function TrainerProfilePage() {
  const { trainer, logout } = useTrainerAuth();

  return (
    <div className="space-y-6 max-w-md">
      <h1 className="text-2xl font-display font-bold">Profile</h1>
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <User className="w-4 h-4" />
            {trainer?.name}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <p><span className="text-muted-foreground">Email:</span> {trainer?.email}</p>
          {trainer?.phone && <p><span className="text-muted-foreground">Phone:</span> {trainer.phone}</p>}
          {trainer?.specialty && <p><span className="text-muted-foreground">Specialty:</span> {trainer.specialty}</p>}
          {trainer?.gyms && trainer.gyms.length > 0 ? (
            <p><span className="text-muted-foreground">Gym(s):</span> {trainer.gyms.map((g) => g.name).join(", ")}</p>
          ) : trainer?.gym ? (
            <p><span className="text-muted-foreground">Gym:</span> {trainer.gym.name}</p>
          ) : (
            <p className="text-muted-foreground">Personal trainer (no gym)</p>
          )}
        </CardContent>
      </Card>
      <Button variant="outline" className="gap-2 w-full sm:w-auto" onClick={() => logout()}>
        <LogOut className="w-4 h-4" />
        Sign out
      </Button>
    </div>
  );
}
