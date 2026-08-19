import { createContext, useContext, useState, useCallback, ReactNode } from "react";
import { User } from "../types";
import * as authService from "../services/authService";

interface AuthContextValue {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string, remember?: boolean) => Promise<void>;
  register: (payload: {
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
    password: string;
  }) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

function readStoredUser(): User | null {
  const stored = localStorage.getItem("user") || sessionStorage.getItem("user");
  return stored ? JSON.parse(stored) : null;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(() => readStoredUser());

  const persist = useCallback((token: string, user: User, remember: boolean) => {
    // Clear both storages first so we never end up with stale duplicate data.
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    sessionStorage.removeItem("token");
    sessionStorage.removeItem("user");

    const storage = remember ? localStorage : sessionStorage;
    storage.setItem("token", token);
    storage.setItem("user", JSON.stringify(user));
    setUser(user);
  }, []);

  const login = useCallback(
    async (email: string, password: string, remember = true) => {
      const { token, user } = await authService.login(email, password);
      persist(token, user, remember);
    },
    [persist]
  );

  const register = useCallback(
    async (payload: { firstName: string; lastName: string; email: string; phone?: string; password: string }) => {
      const { token, user } = await authService.register(payload);
      persist(token, user, true);
    },
    [persist]
  );

  const logout = useCallback(() => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    sessionStorage.removeItem("token");
    sessionStorage.removeItem("user");
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within an AuthProvider");
  return ctx;
}