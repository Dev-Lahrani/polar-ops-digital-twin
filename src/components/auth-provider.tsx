"use client";

import { createContext, useContext, useState, useEffect, useCallback } from "react";
import { useRouter, usePathname } from "next/navigation";
import { AuthUser } from "@/types";
import { getStoredUser, storeUser, clearUser, authenticateUser } from "@/lib/auth";

interface AuthContextType {
  user: AuthUser | null;
  login: (email: string, password: string) => boolean;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  login: () => false,
  logout: () => {},
  isAuthenticated: false,
});

export const useAuth = () => useContext(AuthContext);

const PUBLIC_ROUTES = ["/login"];

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loaded, setLoaded] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const stored = getStoredUser();
    setUser(stored);
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (loaded && !user && !PUBLIC_ROUTES.includes(pathname)) {
      router.push("/login");
    }
  }, [loaded, user, pathname, router]);

  const login = useCallback((email: string, password: string) => {
    const authUser = authenticateUser(email, password);
    if (authUser) {
      setUser(authUser);
      storeUser(authUser);
      router.push("/");
      return true;
    }
    return false;
  }, [router]);

  const logout = useCallback(() => {
    setUser(null);
    clearUser();
    router.push("/login");
  }, [router]);

  if (!loaded) return null;

  if (!user && !PUBLIC_ROUTES.includes(pathname)) {
    return null;
  }

  return (
    <AuthContext.Provider value={{ user, login, logout, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  );
}
