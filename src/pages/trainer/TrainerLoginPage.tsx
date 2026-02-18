import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dumbbell, ArrowLeft } from "lucide-react";
import { useTrainerAuth } from "@/contexts/TrainerAuthContext";
import { useLanguage } from "@/i18n/LanguageContext";

const TrainerLoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useTrainerAuth();
  const navigate = useNavigate();
  const { t } = useLanguage();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await login(email, password);
      navigate("/trainer", { replace: true });
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background p-4 safe-area-pb">
      <div className="absolute top-4 left-4 sm:left-6">
        <Link to="/" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft className="w-4 h-4" />
          {t("backToHome")}
        </Link>
      </div>
      <div className="flex-1 flex flex-col justify-center max-w-sm mx-auto w-full">
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2">
            <div className="w-12 h-12 rounded-2xl bg-gradient-gold flex items-center justify-center">
              <Dumbbell className="w-7 h-7 text-primary-foreground" />
            </div>
            <span className="font-display text-xl font-bold">GymFlow</span>
          </Link>
          <h1 className="text-xl font-display font-bold mt-6">{t("trainerPortal")}</h1>
          <p className="text-muted-foreground mt-1 text-sm">{t("landingTrainerDesc")}</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4 rounded-2xl border bg-card p-6 shadow-sm">
          {error && (
            <div className="rounded-lg bg-destructive/10 text-destructive text-sm p-3">{error}</div>
          )}
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
              className="h-11"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
              className="h-11"
            />
          </div>
          <Button type="submit" className="w-full h-11" variant="hero" disabled={loading}>
            {loading ? "Signing in…" : t("signInGym")}
          </Button>
          <p className="text-center text-sm text-muted-foreground">
            New trainer? <Link to="/trainer/register" className="text-primary font-medium hover:underline">{t("createAccount")}</Link>
          </p>
        </form>
        <p className="text-center text-sm text-muted-foreground mt-6">
          {t("memberPortal")} · <Link to="/member/login" className="text-primary font-medium hover:underline">{t("signInGym")}</Link>
          {" · "}
          {t("gymLogin")} · <Link to="/login" className="text-primary font-medium hover:underline">{t("signInGym")}</Link>
        </p>
      </div>
    </div>
  );
};

export default TrainerLoginPage;
