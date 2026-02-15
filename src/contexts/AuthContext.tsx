import { createContext, useContext, useState, useCallback, useEffect, ReactNode } from "react";
import { api } from "@/lib/api";

export type UserRole = "super_admin" | "gym_admin";

export interface Gym {
  id: number;
  name: string;
  slug: string;
  email: string;
  phone?: string;
  status: string;
  active_subscription?: { id: number; status: string; plan?: { name: string; slug: string } };
}

export interface User {
  id: number;
  name: string;
  email: string;
  role: UserRole;
  gym_id: number | null;
  gym?: Gym;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  isSuperAdmin: boolean;
}

export interface RegisterGymData {
  gym_name: string;
  gym_email: string;
  gym_phone?: string;
  admin_name: string;
  admin_email: string;
  password: string;
  password_confirmation: string;
}

interface AuthContextValue extends AuthState {
  login: (email: string, password: string) => Promise<{ user: User }>;
  registerGym: (data: RegisterGymData) => Promise<{ user: User }>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(() => localStorage.getItem("auth_token"));
  const [isLoading, setIsLoading] = useState(true);

  const refreshUser = useCallback(async () => {
    if (!api.getToken()) {
      setUser(null);
      setIsLoading(false);
      return;
    }
    try {
      const data = await api.get<User & { gym?: Gym }>("/user");
      setUser(data as User);
    } catch {
      setUser(null);
      setToken(null);
      api.setToken(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (token) {
      api.setToken(token);
      refreshUser();
    } else {
      setUser(null);
      setIsLoading(false);
    }
  }, [token, refreshUser]);

  const login = useCallback(async (email: string, password: string) => {
    const res = await api.post<{ user: User; token: string; gym?: Gym }>("/login", { email, password });
    api.setToken(res.token);
    setToken(res.token);
    const u = { ...res.user, gym: res.gym ?? res.user.gym } as User;
    setUser(u);
    return { user: u };
  }, []);

  const registerGym = useCallback(async (data: RegisterGymData) => {
    const res = await api.post<{ user: User; token: string; gym: Gym }>("/register-gym", data);
    api.setToken(res.token);
    setToken(res.token);
    const u = { ...res.user, gym: res.gym } as User;
    setUser(u);
    return { user: u };
  }, []);

  const logout = useCallback(async () => {
    try {
      await api.post("/logout", {});
    } catch {}
    api.setToken(null);
    setToken(null);
    setUser(null);
  }, []);

  const value: AuthContextValue = {
    user,
    token,
    isLoading,
    isAuthenticated: !!user && !!token,
    isSuperAdmin: user?.role === "super_admin",
    login,
    registerGym,
    logout,
    refreshUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
