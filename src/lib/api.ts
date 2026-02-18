const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000/api";

class ApiClient {
  private token: string | null = null;

  constructor() {
    this.token = localStorage.getItem("auth_token");
  }

  setToken(token: string | null) {
    this.token = token;
    if (token) localStorage.setItem("auth_token", token);
    else localStorage.removeItem("auth_token");
  }

  getToken() {
    return this.token;
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const isFormData = options.body instanceof FormData;
    const headers: HeadersInit = {
      Accept: "application/json",
      ...(this.token && { Authorization: `Bearer ${this.token}` }),
      ...(isFormData ? {} : { "Content-Type": "application/json" }),
      ...(options.headers as Record<string, string>),
    };
    const response = await fetch(`${API_BASE_URL}${endpoint}`, { ...options, headers });
    if (!response.ok) {
      if (response.status === 401) {
        this.setToken(null);
        window.location.href = "/login";
      }
      const err = await response.json().catch(() => ({}));
      throw new Error(err.message || "API request failed");
    }
    return response.json();
  }

  get<T>(endpoint: string) {
    return this.request<T>(endpoint);
  }
  post<T>(endpoint: string, data: unknown) {
    const body = data instanceof FormData ? data : JSON.stringify(data);
    return this.request<T>(endpoint, { method: "POST", body });
  }
  put<T>(endpoint: string, data: unknown) {
    const body = data instanceof FormData ? data : JSON.stringify(data);
    return this.request<T>(endpoint, { method: "PUT", body });
  }
  patch<T>(endpoint: string, data: unknown) {
    return this.request<T>(endpoint, { method: "PATCH", body: JSON.stringify(data) });
  }
  delete<T>(endpoint: string) {
    return this.request<T>(endpoint, { method: "DELETE" });
  }
}

/** Member portal API (uses member_token, base path /member). */
class MemberApiClient {
  private token: string | null = null;

  constructor() {
    this.token = localStorage.getItem("member_token");
  }

  setToken(token: string | null) {
    this.token = token;
    if (token) localStorage.setItem("member_token", token);
    else localStorage.removeItem("member_token");
  }

  getToken() {
    return this.token;
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const path = endpoint.startsWith("/") ? endpoint : `/${endpoint}`;
    const url = `${API_BASE_URL}/member${path}`;
    const isFormData = options.body instanceof FormData;
    const headers: HeadersInit = {
      Accept: "application/json",
      ...(this.token && { Authorization: `Bearer ${this.token}` }),
      ...(isFormData ? {} : { "Content-Type": "application/json" }),
      ...(options.headers as Record<string, string>),
    };
    const response = await fetch(url, { ...options, headers });
    if (!response.ok) {
      if (response.status === 401) {
        this.setToken(null);
        window.location.href = "/member/login";
      }
      const err = await response.json().catch(() => ({}));
      throw new Error(err.message || "API request failed");
    }
    return response.json();
  }

  get<T>(endpoint: string) {
    return this.request<T>(endpoint);
  }
  post<T>(endpoint: string, data?: unknown) {
    const body = data instanceof FormData ? data : JSON.stringify(data ?? {});
    return this.request<T>(endpoint, { method: "POST", body });
  }
}

/** Trainer portal API (uses trainer_token, base path /trainer). */
class TrainerApiClient {
  private token: string | null = null;

  constructor() {
    this.token = localStorage.getItem("trainer_token");
  }

  setToken(token: string | null) {
    this.token = token;
    if (token) localStorage.setItem("trainer_token", token);
    else localStorage.removeItem("trainer_token");
  }

  getToken() {
    return this.token;
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const path = endpoint.startsWith("/") ? endpoint : `/${endpoint}`;
    const url = `${API_BASE_URL}/trainer${path}`;
    const isFormData = options.body instanceof FormData;
    const headers: HeadersInit = {
      Accept: "application/json",
      ...(this.token && { Authorization: `Bearer ${this.token}` }),
      ...(isFormData ? {} : { "Content-Type": "application/json" }),
      ...(options.headers as Record<string, string>),
    };
    const response = await fetch(url, { ...options, headers });
    if (!response.ok) {
      if (response.status === 401) {
        this.setToken(null);
        window.location.href = "/trainer/login";
      }
      const err = await response.json().catch(() => ({}));
      throw new Error(err.message || "API request failed");
    }
    return response.json();
  }

  get<T>(endpoint: string) {
    return this.request<T>(endpoint);
  }
  post<T>(endpoint: string, data?: unknown) {
    const body = data instanceof FormData ? data : JSON.stringify(data ?? {});
    return this.request<T>(endpoint, { method: "POST", body });
  }
  put<T>(endpoint: string, data: unknown) {
    const body = data instanceof FormData ? data : JSON.stringify(data);
    return this.request<T>(endpoint, { method: "PUT", body });
  }
  delete<T>(endpoint: string) {
    return this.request<T>(endpoint, { method: "DELETE" });
  }
}

export const api = new ApiClient();
export const memberApi = new MemberApiClient();
export const trainerApi = new TrainerApiClient();