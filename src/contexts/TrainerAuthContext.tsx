import { createContext, useContext, useState, useCallback, useEffect, ReactNode } from "react";
import { trainerApi } from "@/lib/api";

export interface TrainerGym {
  id: number;
  name: string;
}

export interface TrainerProfile {
  id: number;
  name: string;
  email: string;
  phone?: string;
  gender?: string;
  specialty?: string;
  status?: string;
  gym_id?: number | null;
  gym?: TrainerGym | null;
  /** All gyms this trainer works at (one, multiple, or empty for personal). */
  gyms?: TrainerGym[];
}

interface TrainerAuthState {
  trainer: TrainerProfile | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
}

interface TrainerAuthContextValue extends TrainerAuthState {
  login: (email: string, password: string) => Promise<{ trainer: TrainerProfile }>;
  register: (data: RegisterData) => Promise<{ trainer: TrainerProfile }>;
  logout: () => Promise<void>;
  refreshTrainer: () => Promise<void>;
}

export interface RegisterData {
  name: string;
  email: string;
  password: string;
  password_confirmation: string;
  phone: string;
  gender: string;
  specialty: string;
}

const TrainerAuthContext = createContext<TrainerAuthContextValue | null>(null);

export function TrainerAuthProvider({ children }: { children: ReactNode }) {
  const [trainer, setTrainer] = useState<TrainerProfile | null>(null);
  const [token, setToken] = useState<string | null>(() => localStorage.getItem("trainer_token"));
  const [isLoading, setIsLoading] = useState(true);

  const refreshTrainer = useCallback(async () => {
    if (!trainerApi.getToken()) {
      setTrainer(null);
      setIsLoading(false);
      return;
    }
    try {
      const data = await trainerApi.get<TrainerProfile>("/me");
      setTrainer(data);
    } catch {
      setTrainer(null);
      setToken(null);
      trainerApi.setToken(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (token) {
      trainerApi.setToken(token);
      refreshTrainer();
    } else {
      setTrainer(null);
      setIsLoading(false);
    }
  }, [token, refreshTrainer]);

  const login = useCallback(async (email: string, password: string) => {
    const res = await trainerApi.post<{ trainer: TrainerProfile; token: string }>("/login", { email, password });
    trainerApi.setToken(res.token);
    setToken(res.token);
    setTrainer(res.trainer);
    return { trainer: res.trainer };
  }, []);

  const register = useCallback(async (data: RegisterData) => {
    const res = await trainerApi.post<{ trainer: TrainerProfile; token: string }>("/register", data);
    trainerApi.setToken(res.token);
    setToken(res.token);
    setTrainer(res.trainer);
    return { trainer: res.trainer };
  }, []);

  const logout = useCallback(async () => {
    try {
      await trainerApi.post("/logout");
    } catch {}
    trainerApi.setToken(null);
    setToken(null);
    setTrainer(null);
  }, []);

  const value: TrainerAuthContextValue = {
    trainer,
    token,
    isLoading,
    isAuthenticated: !!trainer && !!token,
    login,
    register,
    logout,
    refreshTrainer,
  };

  return (
    <TrainerAuthContext.Provider value={value}>
      {children}
    </TrainerAuthContext.Provider>
  );
}

export function useTrainerAuth() {
  const ctx = useContext(TrainerAuthContext);
  if (!ctx) throw new Error("useTrainerAuth must be used within TrainerAuthProvider");
  return ctx;
}
