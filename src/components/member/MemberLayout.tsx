import { Link, useLocation, Outlet } from "react-router-dom";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  CalendarCheck,
  MessageCircle,
  CreditCard,
  Dumbbell,
  User,
  LogOut,
  TrendingUp,
} from "lucide-react";
import { useMemberAuth } from "@/contexts/MemberAuthContext";
import { Button } from "@/components/ui/button";

const navItems = [
  { icon: LayoutDashboard, label: "Home", path: "/member" },
  { icon: CalendarCheck, label: "Attendance", path: "/member/attendance" },
  { icon: Dumbbell, label: "Workouts", path: "/member/workouts" },
  { icon: TrendingUp, label: "Progress", path: "/member/progress" },
  { icon: MessageCircle, label: "Chat", path: "/member/chat" },
  { icon: CreditCard, label: "Payments", path: "/member/payments" },
];

export default function MemberLayout() {
  const location = useLocation();
  const { member, logout } = useMemberAuth();

  return (
    <div className="min-h-screen flex flex-col bg-background pb-20 safe-area-pb">
      {/* Top bar - compact on mobile */}
      <header className="sticky top-0 z-30 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="flex items-center justify-between h-14 px-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-gold flex items-center justify-center">
              <Dumbbell className="w-4 h-4 text-primary-foreground" />
            </div>
            <span className="font-display font-bold text-sm">{member?.gym?.name ?? "My Gym"}</span>
          </div>
          <Link to="/member/profile" className="p-2 rounded-full hover:bg-muted">
            <User className="w-5 h-5 text-muted-foreground" />
          </Link>
        </div>
      </header>

      <main className="flex-1 overflow-auto">
        <Outlet />
      </main>

      {/* Bottom navigation - mobile first */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 border-t border-border bg-background/95 backdrop-blur safe-area-inset-bottom">
        <div className="flex items-center justify-around h-16 px-2">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  "flex flex-col items-center justify-center gap-0.5 flex-1 py-2 rounded-lg text-xs font-medium transition-colors min-w-0",
                  isActive
                    ? "text-primary"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                <item.icon className={cn("w-6 h-6 shrink-0", isActive && "text-primary")} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}

export function MemberProfileActions() {
  const { logout } = useMemberAuth();
  return (
    <Button variant="outline" size="sm" onClick={() => logout()} className="gap-2">
      <LogOut className="w-4 h-4" />
      Sign out
    </Button>
  );
}
