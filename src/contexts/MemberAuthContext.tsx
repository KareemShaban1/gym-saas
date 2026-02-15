import { createContext, useContext, useState, useCallback, useEffect, ReactNode } from "react";
import { memberApi } from "@/lib/api";

export interface MemberGym {
  id: number;
  name: string;
  email?: string;
}

export interface MemberTrainer {
  id: number;
  name: string;
  email?: string;
}

export interface MemberProfile {
  id: number;
  name: string;
  email: string;
  phone?: string;
  gender?: string;
  status?: string;
  plan_type?: string;
  plan_tier?: string;
  expires_at?: string;
  gym_id?: number;
  gym?: MemberGym;
  trainer?: MemberTrainer;
  gym_plan?: { id: number; name: string };
}

interface MemberAuthState {
  member: MemberProfile | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
}

interface MemberAuthContextValue extends MemberAuthState {
  login: (email: string, password: string) => Promise<{ member: MemberProfile }>;
  logout: () => Promise<void>;
  refreshMember: () => Promise<void>;
}

const MemberAuthContext = createContext<MemberAuthContextValue | null>(null);

export function MemberAuthProvider({ children }: { children: ReactNode }) {
  const [member, setMember] = useState<MemberProfile | null>(null);
  const [token, setToken] = useState<string | null>(() => localStorage.getItem("member_token"));
  const [isLoading, setIsLoading] = useState(true);

  const refreshMember = useCallback(async () => {
    if (!memberApi.getToken()) {
      setMember(null);
      setIsLoading(false);
      return;
    }
    try {
      const data = await memberApi.get<MemberProfile>("/me");
      setMember(data);
    } catch {
      setMember(null);
      setToken(null);
      memberApi.setToken(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (token) {
      memberApi.setToken(token);
      refreshMember();
    } else {
      setMember(null);
      setIsLoading(false);
    }
  }, [token, refreshMember]);

  const login = useCallback(async (email: string, password: string) => {
    const res = await memberApi.post<{ member: MemberProfile; token: string }>("/login", { email, password });
    memberApi.setToken(res.token);
    setToken(res.token);
    setMember(res.member);
    return { member: res.member };
  }, []);

  const logout = useCallback(async () => {
    try {
      await memberApi.post("/logout");
    } catch {}
    memberApi.setToken(null);
    setToken(null);
    setMember(null);
  }, []);

  const value: MemberAuthContextValue = {
    member,
    token,
    isLoading,
    isAuthenticated: !!member && !!token,
    login,
    logout,
    refreshMember,
  };

  return (
    <MemberAuthContext.Provider value={value}>
      {children}
    </MemberAuthContext.Provider>
  );
}

export function useMemberAuth() {
  const ctx = useContext(MemberAuthContext);
  if (!ctx) throw new Error("useMemberAuth must be used within MemberAuthProvider");
  return ctx;
}
