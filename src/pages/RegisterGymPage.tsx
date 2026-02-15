import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dumbbell } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import type { RegisterGymData } from "@/contexts/AuthContext";

const RegisterGymPage = () => {
  const [data, setData] = useState<RegisterGymData>({
    gym_name: "",
    gym_email: "",
    gym_phone: "",
    admin_name: "",
    admin_email: "",
    password: "",
    password_confirmation: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { registerGym } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (data.password !== data.password_confirmation) {
      setError("Passwords do not match");
      return;
    }
    setLoading(true);
    try {
      const { user } = await registerGym(data);
      navigate(user.role === "super_admin" ? "/super-admin" : "/dashboard");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-lg space-y-8">
        <div className="text-center">
          <Link to="/" className="inline-flex items-center gap-2 mb-6">
            <div className="w-10 h-10 rounded-xl bg-gradient-gold flex items-center justify-center">
              <Dumbbell className="w-6 h-6 text-primary-foreground" />
            </div>
            <span className="font-display text-2xl font-bold">GymFlow</span>
          </Link>
          <h1 className="text-2xl font-display font-bold">Register your gym</h1>
          <p className="text-muted-foreground mt-1">Create your gym account and start your free trial</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4 rounded-xl border bg-card p-6 shadow-sm">
          {error && (
            <div className="rounded-lg bg-destructive/10 text-destructive text-sm p-3">{error}</div>
          )}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2 space-y-2">
              <Label>Gym name</Label>
              <Input
                placeholder="Your Gym Name"
                value={data.gym_name}
                onChange={(e) => setData((d) => ({ ...d, gym_name: e.target.value }))}
                required
              />
            </div>
            <div className="space-y-2">
              <Label>Gym email</Label>
              <Input
                type="email"
                placeholder="gym@example.com"
                value={data.gym_email}
                onChange={(e) => setData((d) => ({ ...d, gym_email: e.target.value }))}
                required
              />
            </div>
            <div className="space-y-2">
              <Label>Gym phone (optional)</Label>
              <Input
                placeholder="+20 123 456 7890"
                value={data.gym_phone || ""}
                onChange={(e) => setData((d) => ({ ...d, gym_phone: e.target.value }))}
              />
            </div>
            <div className="sm:col-span-2 space-y-2">
              <Label>Admin name</Label>
              <Input
                placeholder="Your full name"
                value={data.admin_name}
                onChange={(e) => setData((d) => ({ ...d, admin_name: e.target.value }))}
                required
              />
            </div>
            <div className="sm:col-span-2 space-y-2">
              <Label>Admin email</Label>
              <Input
                type="email"
                placeholder="you@example.com"
                value={data.admin_email}
                onChange={(e) => setData((d) => ({ ...d, admin_email: e.target.value }))}
                required
              />
            </div>
            <div className="space-y-2">
              <Label>Password</Label>
              <Input
                type="password"
                value={data.password}
                onChange={(e) => setData((d) => ({ ...d, password: e.target.value }))}
                required
                minLength={8}
              />
            </div>
            <div className="space-y-2">
              <Label>Confirm password</Label>
              <Input
                type="password"
                value={data.password_confirmation}
                onChange={(e) => setData((d) => ({ ...d, password_confirmation: e.target.value }))}
                required
              />
            </div>
          </div>
          <Button type="submit" className="w-full" variant="hero" disabled={loading}>
            {loading ? "Creating account…" : "Register gym"}
          </Button>
          <p className="text-center text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link to="/login" className="text-primary font-medium hover:underline">
              Sign in
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
};

export default RegisterGymPage;
