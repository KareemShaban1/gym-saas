import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { LayoutDashboard, Building2, CreditCard, Megaphone, LogOut, Dumbbell, Receipt } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";

const navItems = [
  { icon: LayoutDashboard, label: "Dashboard", path: "/super-admin" },
  { icon: Building2, label: "Gyms", path: "/super-admin/gyms" },
  { icon: CreditCard, label: "Subscription plans", path: "/super-admin/plans" },
  { icon: Receipt, label: "Subscriptions & payments", path: "/super-admin/subscriptions" },
  { icon: Megaphone, label: "Announcements", path: "/super-admin/announcements" },
];

export default function SuperAdminLayout({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const { user, logout } = useAuth();
  return (
    <div className="flex min-h-screen bg-background">
      <aside className="fixed top-0 bottom-0 left-0 z-40 w-64 flex flex-col bg-sidebar border-r border-sidebar-border">
        <div className="flex items-center gap-2 h-16 px-4 border-b border-sidebar-border">
          <div className="w-9 h-9 rounded-lg bg-gradient-gold flex items-center justify-center shrink-0">
            <Dumbbell className="w-5 h-5 text-primary-foreground" />
          </div>
          <span className="font-display text-lg font-bold text-sidebar-foreground">GymFlow Admin</span>
        </div>
        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          {navItems.map((item) => (
            <Link key={item.path} to={item.path} className={cn("flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium", location.pathname === item.path ? "bg-sidebar-accent text-sidebar-primary" : "text-sidebar-foreground/60 hover:bg-sidebar-accent/50")}>
              <item.icon className="w-5 h-5 shrink-0" />
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="p-3 border-t border-sidebar-border">
          <p className="px-3 text-xs text-muted-foreground truncate">{user?.email}</p>
          <Button variant="ghost" size="sm" className="w-full justify-start gap-3 mt-2" onClick={() => logout().then(() => window.location.assign("/login"))}>
            <LogOut className="w-4 h-4" />
            Log out
          </Button>
        </div>
      </aside>
      <main className="flex-1 pl-64">
        <div className="p-6 md:p-8">{children}</div>
      </main>
    </div>
  );
}
