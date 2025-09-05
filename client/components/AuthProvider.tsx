import { createContext, useContext, useEffect, useMemo, useState } from "react";

export interface AuthUser { id: string; name: string; email: string; role: "patient" | "doctor" | "admin"; providerId?: string }

interface AuthContextValue {
  user: AuthUser | null;
  token: string | null;
  login: (token: string, user: AuthUser) => void;
  logout: () => void;
  refresh: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

function getToken() {
  return localStorage.getItem("auth_token");
}
function setToken(token: string) {
  localStorage.setItem("auth_token", token);
}
function clearToken() {
  localStorage.removeItem("auth_token");
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [token, setTok] = useState<string | null>(getToken());

  const refresh = async () => {
    const t = getToken();
    if (!t) {
      setUser(null);
      setTok(null);
      return;
    }
    try {
      const res = await fetch("/api/auth/me", { headers: { Authorization: `Bearer ${t}` } });
      if (!res.ok) throw new Error("unauthorized");
      const u = (await res.json()) as AuthUser;
      setUser(u);
      setTok(t);
    } catch {
      clearToken();
      setUser(null);
      setTok(null);
    }
  };

  useEffect(() => {
    refresh();
  }, []);

  const value = useMemo<AuthContextValue>(() => ({
    user,
    token,
    login: (t, u) => { setToken(t); setTok(t); setUser(u); },
    logout: () => { clearToken(); setUser(null); setTok(null); },
    refresh,
  }), [user, token]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
