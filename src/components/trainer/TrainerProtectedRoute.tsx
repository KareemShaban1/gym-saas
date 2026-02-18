import { Navigate, useLocation } from "react-router-dom";
import { useTrainerAuth } from "@/contexts/TrainerAuthContext";

export default function TrainerProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useTrainerAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-pulse text-muted-foreground">Loading…</div>
      </div>
    );
  }
  if (!isAuthenticated) {
    return <Navigate to="/trainer/login" state={{ from: location }} replace />;
  }
  return <>{children}</>;
}
