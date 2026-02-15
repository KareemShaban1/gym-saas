import { Navigate, useLocation } from "react-router-dom";
import { useMemberAuth } from "@/contexts/MemberAuthContext";

export default function MemberProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useMemberAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-pulse text-muted-foreground">Loading…</div>
      </div>
    );
  }
  if (!isAuthenticated) {
    return <Navigate to="/member/login" state={{ from: location }} replace />;
  }
  return <>{children}</>;
}
