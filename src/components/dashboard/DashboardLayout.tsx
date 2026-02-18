import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/i18n/LanguageContext";
import { useTheme } from "@/contexts/ThemeContext";
import {
  LayoutDashboard, Users, Dumbbell, CreditCard, QrCode,
  BarChart3, Settings, ChevronLeft, LogOut, Building2, UserCog, Ticket,
  Sun, Moon, Monitor, Languages, UserPlus, Shield
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";

const DashboardLayout = ({ children }: { children: React.ReactNode }) => {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();
  const { t, language, setLanguage, isRTL } = useLanguage();
  const { theme, setTheme } = useTheme();

  const navItems = [
    { icon: LayoutDashboard, label: t("overview"), path: "/dashboard" },
    { icon: Users, label: t("members"), path: "/dashboard/members" },
    { icon: UserCog, label: t("trainers"), path: "/dashboard/trainers" },
    { icon: Dumbbell, label: t("workouts"), path: "/dashboard/workouts" },
    { icon: QrCode, label: t("attendance"), path: "/dashboard/attendance" },
    { icon: CreditCard, label: t("payments"), path: "/dashboard/payments" },
    { icon: BarChart3, label: t("reports"), path: "/dashboard/reports" },
    { icon: Building2, label: t("branches"), path: "/dashboard/branches" },
    { icon: Ticket, label: t("subscriptionPlans"), path: "/dashboard/plans" },
    { icon: UserPlus, label: t("dashboardUsers"), path: "/dashboard/users" },
    { icon: Shield, label: t("rolesAndPermissions"), path: "/dashboard/roles" },
    { icon: Settings, label: t("settings"), path: "/dashboard/settings" },
  ];

  return (
    <div className="flex min-h-screen bg-background">
      {/* Sidebar */}
      <aside
        className={cn(
          "fixed top-0 bottom-0 z-40 flex flex-col bg-sidebar border-sidebar-border transition-all duration-300",
          isRTL ? "right-0 border-l" : "left-0 border-r",
          collapsed ? "w-16" : "w-64"
        )}
      >
        {/* Logo */}
        <div className="flex items-center gap-2 h-16 px-4 border-b border-sidebar-border">
          <div className="w-9 h-9 rounded-lg bg-gradient-gold flex items-center justify-center shrink-0">
            <Dumbbell className="w-5 h-5 text-primary-foreground" />
          </div>
          {!collapsed && (
            <span className="font-display text-lg font-bold text-sidebar-foreground">GymFlow</span>
          )}
        </div>

        {/* Nav */}
        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200",
                  isActive
                    ? "bg-sidebar-accent text-sidebar-primary"
                    : "text-sidebar-foreground/60 hover:text-sidebar-foreground hover:bg-sidebar-accent/50"
                )}
              >
                <item.icon className="w-5 h-5 shrink-0" />
                {!collapsed && <span>{item.label}</span>}
              </Link>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="p-3 border-t border-sidebar-border space-y-1">
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-sidebar-foreground/60 hover:text-sidebar-foreground hover:bg-sidebar-accent/50 w-full transition-colors"
          >
            <ChevronLeft className={cn(
              "w-5 h-5 shrink-0 transition-transform",
              collapsed && !isRTL && "rotate-180",
              !collapsed && isRTL && "rotate-180"
            )} />
            {!collapsed && <span>{t("collapse")}</span>}
          </button>
          <Link
            to="/"
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-sidebar-foreground/60 hover:text-sidebar-foreground hover:bg-sidebar-accent/50 w-full transition-colors"
          >
            <LogOut className="w-5 h-5 shrink-0" />
            {!collapsed && <span>{t("backToHome")}</span>}
          </Link>
        </div>
      </aside>

      {/* Main */}
      <main className={cn(
        "flex-1 transition-all duration-300 flex flex-col min-h-screen",
        isRTL
          ? (collapsed ? "mr-16" : "mr-64")
          : (collapsed ? "ml-16" : "ml-64")
      )}>
        {/* Top bar: language + theme */}
        <header className="h-14 border-b border-border bg-background/95 backdrop-blur flex items-center justify-end gap-2 px-4 lg:px-8 shrink-0">
          <div className="flex items-center gap-2">
            <Languages className="w-4 h-4 text-muted-foreground" />
            <Select value={language} onValueChange={(v) => setLanguage(v as "en" | "ar")}>
              <SelectTrigger className="w-[120px] h-9 border-0 bg-transparent shadow-none hover:bg-muted/50">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="en">{t("english")}</SelectItem>
                <SelectItem value="ar">{t("arabic")}</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center gap-1 border-l border-border pl-2">
            <Button
              variant={theme === "light" ? "secondary" : "ghost"}
              size="icon"
              className="h-9 w-9"
              onClick={() => setTheme("light")}
              title={t("light")}
            >
              <Sun className="w-4 h-4" />
            </Button>
            <Button
              variant={theme === "dark" ? "secondary" : "ghost"}
              size="icon"
              className="h-9 w-9"
              onClick={() => setTheme("dark")}
              title={t("dark")}
            >
              <Moon className="w-4 h-4" />
            </Button>
            <Button
              variant={theme === "system" ? "secondary" : "ghost"}
              size="icon"
              className="h-9 w-9"
              onClick={() => setTheme("system")}
              title={t("system")}
            >
              <Monitor className="w-4 h-4" />
            </Button>
          </div>
        </header>
        <div className="flex-1 p-6 lg:p-8 min-h-[60vh] min-w-0 overflow-auto bg-background">
          {children}
        </div>
      </main>
    </div>
  );
};

export default DashboardLayout;
