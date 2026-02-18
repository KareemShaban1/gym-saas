import { Link, useLocation, Outlet } from "react-router-dom";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Users,
  Dumbbell,
  ClipboardList,
  BarChart3,
  User,
  LogOut,
} from "lucide-react";
import { useTrainerAuth } from "@/contexts/TrainerAuthContext";
import { Button } from "@/components/ui/button";

const navItems = [
  { icon: LayoutDashboard, label: "Dashboard", path: "/trainer" },
  { icon: Users, label: "Members", path: "/trainer/members" },
  { icon: Dumbbell, label: "Workouts", path: "/trainer/workouts" },
  { icon: ClipboardList, label: "Exercises", path: "/trainer/exercises" },
  { icon: BarChart3, label: "Reports", path: "/trainer/reports" },
];

export default function TrainerLayout() {
  const location = useLocation();
  const { trainer, logout } = useTrainerAuth();

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <header className="sticky top-0 z-30 border-b border-border bg-background/95 backdrop-blur">
        <div className="flex items-center justify-between h-14 px-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-gold flex items-center justify-center">
              <Dumbbell className="w-4 h-4 text-primary-foreground" />
            </div>
            <span className="font-display font-bold text-sm">{trainer?.gym?.name ?? "Trainer portal"}</span>
          </div>
          <div className="flex items-center gap-2">
            <Link to="/trainer/profile" className="p-2 rounded-full hover:bg-muted">
              <User className="w-5 h-5 text-muted-foreground" />
            </Link>
            <Button variant="ghost" size="icon" onClick={() => logout()} className="rounded-full">
              <LogOut className="w-5 h-5 text-muted-foreground" />
            </Button>
          </div>
        </div>
      </header>

      <div className="flex flex-1">
        <aside className="hidden md:flex w-52 border-r border-border flex-col py-4">
          <nav className="px-2 space-y-1">
            {navItems.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                    isActive ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  )}
                >
                  <item.icon className="w-5 h-5 shrink-0" />
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </aside>

        <main className="flex-1 overflow-auto p-4 md:p-6">
          <Outlet />
        </main>
      </div>

      {/* Mobile bottom nav */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 border-t border-border bg-background safe-area-inset-bottom">
        <div className="flex justify-around h-16 items-center px-2">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  "flex flex-col items-center justify-center gap-0.5 flex-1 py-2 rounded-lg text-xs font-medium transition-colors min-w-0",
                  isActive ? "text-primary" : "text-muted-foreground hover:text-foreground"
                )}
              >
                <item.icon className={cn("w-6 h-6 shrink-0", isActive && "text-primary")} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>
      <div className="md:hidden h-16" />
    </div>
  );
}
