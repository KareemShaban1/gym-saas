import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireSuperAdmin?: boolean;
}

export default function ProtectedRoute({ children, requireSuperAdmin }: ProtectedRouteProps) {
  const { user, isAuthenticated, isLoading, isSuperAdmin } = useAuth();
  const location = useLocation();
  const isDashboardRoute = location.pathname.startsWith("/dashboard");

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-pulse text-muted-foreground">Loading…</div>
      </div>
    );
  }
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  if (requireSuperAdmin && !isSuperAdmin) {
    return <Navigate to="/dashboard" replace />;
  }
  if (isDashboardRoute && isSuperAdmin) {
    return <Navigate to="/super-admin" replace />;
  }
  // Gym dashboard routes require a gym; redirect to overview which shows "No gym assigned" if needed
  if (isDashboardRoute && !isSuperAdmin && !location.pathname.startsWith("/super-admin") && !user?.gym_id && !user?.gym) {
    return <Navigate to="/dashboard" replace />;
  }
  return <>{children}</>;
}
