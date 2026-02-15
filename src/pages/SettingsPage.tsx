import { useState } from "react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { toast } from "@/hooks/use-toast";
import { Building2, Bell, Palette, Shield, Save, Sun, Moon, Monitor } from "lucide-react";
import { useLanguage } from "@/i18n/LanguageContext";

interface GymProfile {
  name: string;
  phone: string;
  email: string;
  address: string;
  city: string;
  description: string;
  openingHours: string;
  currency: string;
}

interface NotificationPrefs {
  emailNewMember: boolean;
  emailExpiring: boolean;
  emailPayment: boolean;
  pushCheckIn: boolean;
  pushLowCoins: boolean;
  pushTrainerSchedule: boolean;
  smsReminders: boolean;
  smsPromotions: boolean;
  digestFrequency: string;
}

type ThemeMode = "light" | "dark" | "system";

const SettingsPage = () => {
  const { t, language, setLanguage } = useLanguage();

  const [profile, setProfile] = useState<GymProfile>({
    name: "GymFlow Fitness Center",
    phone: "02-2345-6789",
    email: "info@gymflow.com",
    address: "12 Tahrir Square, Downtown",
    city: "Cairo",
    description: "Premium fitness center offering state-of-the-art equipment, certified trainers, and a wide range of group classes.",
    openingHours: "6:00 AM - 11:00 PM",
    currency: "EGP",
  });

  const [notifications, setNotifications] = useState<NotificationPrefs>({
    emailNewMember: true, emailExpiring: true, emailPayment: true,
    pushCheckIn: false, pushLowCoins: true, pushTrainerSchedule: true,
    smsReminders: true, smsPromotions: false, digestFrequency: "daily",
  });

  const [theme, setTheme] = useState<ThemeMode>("light");
  const [accentColor, setAccentColor] = useState("gold");
  const [compactMode, setCompactMode] = useState(false);
  const [animationsEnabled, setAnimationsEnabled] = useState(true);

  const handleSaveProfile = () => {
    toast({ title: t("profileSaved"), description: t("profileSavedDesc") });
  };

  const handleSaveNotifications = () => {
    toast({ title: t("preferencesSaved"), description: t("preferencesSavedDesc") });
  };

  const handleThemeChange = (mode: ThemeMode) => {
    setTheme(mode);
    const root = document.documentElement;
    if (mode === "dark") root.classList.add("dark");
    else if (mode === "light") root.classList.remove("dark");
    else {
      const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
      root.classList.toggle("dark", prefersDark);
    }
    toast({ title: t("themeUpdated"), description: `${t("switchedTo")} ${mode} ${t("mode")}` });
  };

  const handleSaveAppearance = () => {
    toast({ title: t("appearanceSaved"), description: t("appearanceSavedDesc") });
  };

  const themeOptions: { value: ThemeMode; label: string; icon: typeof Sun }[] = [
    { value: "light", label: t("light"), icon: Sun },
    { value: "dark", label: t("dark"), icon: Moon },
    { value: "system", label: t("system"), icon: Monitor },
  ];

  const accentOptions = [
    { value: "gold", label: t("egyptianGold"), preview: "bg-primary" },
    { value: "blue", label: t("oceanBlue"), preview: "bg-info" },
    { value: "green", label: t("freshGreen"), preview: "bg-success" },
    { value: "red", label: t("powerRed"), preview: "bg-destructive" },
  ];

  return (
    <DashboardLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-display font-bold mb-1">{t("settingsTitle")}</h1>
        <p className="text-muted-foreground">{t("settingsDescription")}</p>
      </div>

      <Tabs defaultValue="profile" className="space-y-4">
        <TabsList className="bg-muted">
          <TabsTrigger value="profile" className="gap-1.5"><Building2 className="w-4 h-4" /> {t("profile")}</TabsTrigger>
          <TabsTrigger value="notifications" className="gap-1.5"><Bell className="w-4 h-4" /> {t("notifications")}</TabsTrigger>
          <TabsTrigger value="appearance" className="gap-1.5"><Palette className="w-4 h-4" /> {t("appearance")}</TabsTrigger>
          <TabsTrigger value="security" className="gap-1.5"><Shield className="w-4 h-4" /> {t("security")}</TabsTrigger>
        </TabsList>

        {/* Profile Tab */}
        <TabsContent value="profile">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">{t("gymProfile")}</CardTitle>
              <CardDescription>{t("gymProfileDesc")}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2"><Label>{t("gymName")}</Label><Input value={profile.name} onChange={e => setProfile(p => ({ ...p, name: e.target.value }))} /></div>
                <div className="space-y-2"><Label>{t("phone")}</Label><Input value={profile.phone} onChange={e => setProfile(p => ({ ...p, phone: e.target.value }))} /></div>
                <div className="space-y-2"><Label>{t("email")}</Label><Input type="email" value={profile.email} onChange={e => setProfile(p => ({ ...p, email: e.target.value }))} /></div>
                <div className="space-y-2"><Label>{t("city")}</Label><Input value={profile.city} onChange={e => setProfile(p => ({ ...p, city: e.target.value }))} /></div>
              </div>
              <div className="space-y-2"><Label>{t("address")}</Label><Input value={profile.address} onChange={e => setProfile(p => ({ ...p, address: e.target.value }))} /></div>
              <div className="space-y-2"><Label>{t("description")}</Label><Textarea value={profile.description} onChange={e => setProfile(p => ({ ...p, description: e.target.value }))} rows={3} /></div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2"><Label>{t("openingHours")}</Label><Input value={profile.openingHours} onChange={e => setProfile(p => ({ ...p, openingHours: e.target.value }))} /></div>
                <div className="space-y-2"><Label>{t("currency")}</Label>
                  <Select value={profile.currency} onValueChange={v => setProfile(p => ({ ...p, currency: v }))}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="EGP">EGP (Egyptian Pound)</SelectItem>
                      <SelectItem value="USD">USD (US Dollar)</SelectItem>
                      <SelectItem value="SAR">SAR (Saudi Riyal)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2"><Label>{t("language")}</Label>
                  <Select value={language} onValueChange={v => setLanguage(v as "en" | "ar")}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="en">English</SelectItem>
                      <SelectItem value="ar">العربية (Arabic)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <Button onClick={handleSaveProfile}><Save className="w-4 h-4 me-1" /> {t("saveProfile")}</Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Notifications Tab */}
        <TabsContent value="notifications">
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">{t("emailNotifications")}</CardTitle>
                <CardDescription>{t("emailNotificationsDesc")}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {[
                  { key: "emailNewMember" as const, label: t("newMemberReg"), desc: t("newMemberRegDesc") },
                  { key: "emailExpiring" as const, label: t("expiringSubscriptions"), desc: t("expiringSubscriptionsDesc") },
                  { key: "emailPayment" as const, label: t("paymentReceived"), desc: t("paymentReceivedDesc") },
                ].map(item => (
                  <div key={item.key} className="flex items-center justify-between">
                    <div><p className="text-sm font-medium">{item.label}</p><p className="text-xs text-muted-foreground">{item.desc}</p></div>
                    <Switch checked={notifications[item.key]} onCheckedChange={v => setNotifications(n => ({ ...n, [item.key]: v }))} />
                  </div>
                ))}
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-base">{t("pushNotifications")}</CardTitle>
                <CardDescription>{t("pushNotificationsDesc")}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {[
                  { key: "pushCheckIn" as const, label: t("memberCheckIns"), desc: t("memberCheckInsDesc") },
                  { key: "pushLowCoins" as const, label: t("lowCoinBalance"), desc: t("lowCoinBalanceDesc") },
                  { key: "pushTrainerSchedule" as const, label: t("trainerScheduleChanges"), desc: t("trainerScheduleChangesDesc") },
                ].map(item => (
                  <div key={item.key} className="flex items-center justify-between">
                    <div><p className="text-sm font-medium">{item.label}</p><p className="text-xs text-muted-foreground">{item.desc}</p></div>
                    <Switch checked={notifications[item.key]} onCheckedChange={v => setNotifications(n => ({ ...n, [item.key]: v }))} />
                  </div>
                ))}
              </CardContent>
            </Card>
            <Card>
              <CardHeader><CardTitle className="text-base">{t("smsDigest")}</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div><p className="text-sm font-medium">{t("smsReminders")}</p><p className="text-xs text-muted-foreground">{t("smsRemindersDesc")}</p></div>
                  <Switch checked={notifications.smsReminders} onCheckedChange={v => setNotifications(n => ({ ...n, smsReminders: v }))} />
                </div>
                <div className="flex items-center justify-between">
                  <div><p className="text-sm font-medium">{t("smsPromotions")}</p><p className="text-xs text-muted-foreground">{t("smsPromotionsDesc")}</p></div>
                  <Switch checked={notifications.smsPromotions} onCheckedChange={v => setNotifications(n => ({ ...n, smsPromotions: v }))} />
                </div>
                <Separator />
                <div className="space-y-2"><Label>{t("emailDigestFrequency")}</Label>
                  <Select value={notifications.digestFrequency} onValueChange={v => setNotifications(n => ({ ...n, digestFrequency: v }))}>
                    <SelectTrigger className="w-48"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="realtime">{t("realtime")}</SelectItem>
                      <SelectItem value="daily">{t("daily")}</SelectItem>
                      <SelectItem value="weekly">{t("weekly")}</SelectItem>
                      <SelectItem value="never">{t("never")}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button onClick={handleSaveNotifications}><Save className="w-4 h-4 me-1" /> {t("savePreferences")}</Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Appearance Tab */}
        <TabsContent value="appearance">
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">{t("themeMode")}</CardTitle>
                <CardDescription>{t("themeModeDesc")}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-3">
                  {themeOptions.map(opt => {
                    const Icon = opt.icon;
                    return (
                      <button key={opt.value} onClick={() => handleThemeChange(opt.value)}
                        className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all ${theme === opt.value ? "border-primary bg-accent" : "border-border hover:border-primary/40"}`}>
                        <Icon className={`w-6 h-6 ${theme === opt.value ? "text-primary" : "text-muted-foreground"}`} />
                        <span className="text-sm font-medium">{opt.label}</span>
                      </button>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-base">{t("accentColor")}</CardTitle>
                <CardDescription>{t("accentColorDesc")}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {accentOptions.map(opt => (
                    <button key={opt.value} onClick={() => setAccentColor(opt.value)}
                      className={`flex items-center gap-3 p-3 rounded-xl border-2 transition-all ${accentColor === opt.value ? "border-primary bg-accent" : "border-border hover:border-primary/40"}`}>
                      <div className={`w-6 h-6 rounded-full ${opt.preview}`} />
                      <span className="text-sm font-medium">{opt.label}</span>
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader><CardTitle className="text-base">{t("displayOptions")}</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div><p className="text-sm font-medium">{t("compactMode")}</p><p className="text-xs text-muted-foreground">{t("compactModeDesc")}</p></div>
                  <Switch checked={compactMode} onCheckedChange={setCompactMode} />
                </div>
                <div className="flex items-center justify-between">
                  <div><p className="text-sm font-medium">{t("animations")}</p><p className="text-xs text-muted-foreground">{t("animationsDesc")}</p></div>
                  <Switch checked={animationsEnabled} onCheckedChange={setAnimationsEnabled} />
                </div>
                <Button onClick={handleSaveAppearance}><Save className="w-4 h-4 me-1" /> {t("saveAppearance")}</Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Security Tab */}
        <TabsContent value="security">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">{t("securityAccess")}</CardTitle>
              <CardDescription>{t("securityAccessDesc")}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2"><Label>{t("currentPassword")}</Label><Input type="password" placeholder="••••••••" /></div>
                <div />
                <div className="space-y-2"><Label>{t("newPassword")}</Label><Input type="password" placeholder="••••••••" /></div>
                <div className="space-y-2"><Label>{t("confirmNewPassword")}</Label><Input type="password" placeholder="••••••••" /></div>
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div><p className="text-sm font-medium">{t("twoFactorAuth")}</p><p className="text-xs text-muted-foreground">{t("twoFactorAuthDesc")}</p></div>
                <Button variant="outline" size="sm" disabled>{t("enable2FA")}</Button>
              </div>
              <p className="text-xs text-muted-foreground">{t("requiresCloud")}</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </DashboardLayout>
  );
};

export default SettingsPage;
