import { useState, useEffect, useRef } from "react";
import { getMe, logout as apiLogout } from "../lib/api";
import type { User } from "../types";

// Singleton state outside React
let globalUser: User | null = null;
let globalLoading = true;
const globalListeners: Set<(user: User | null, loading: boolean) => void> =
  new Set();

function notifyListeners() {
  globalListeners.forEach((cb) => cb(globalUser, globalLoading));
}

export function useAuth() {
  const [user, setUser] = useState<User | null>(globalUser);
  const [loading, setLoading] = useState(globalLoading);
  const [error, setError] = useState<string | null>(null);
  const checkedRef = useRef(false);

  useEffect(() => {
    const listener = (u: User | null, l: boolean) => {
      setUser(u);
      setLoading(l);
    };
    globalListeners.add(listener);

    // Only run auth check once globally
    if (!checkedRef.current && globalLoading) {
      checkedRef.current = true;
      getMe()
        .then((res) => {
          const data = res.data;
          globalUser = { ...data.user, skills: data.skills || [] };
          globalLoading = false;
          notifyListeners();
        })
        .catch(() => {
          globalUser = null;
          globalLoading = false;
          notifyListeners();
        });
    }

    return () => {
      globalListeners.delete(listener);
    };
  }, []);

  const login = () => {
    const apiBase = import.meta.env.VITE_API_URL || window.location.origin;
    window.location.href = `${apiBase}/auth/gitea`;
  };

  const logout = async () => {
    try {
      await apiLogout();
    } catch (e) {
      console.error("Logout error:", e);
    }
    globalUser = null;
    notifyListeners();
    window.location.href = "/login";
  };

  const checkAuth = async () => {
    globalLoading = true;
    notifyListeners();
    try {
      const response = await getMe();
      const data = response.data;
      globalUser = { ...data.user, skills: data.skills || [] };
      setError(null);
    } catch (err: any) {
      console.error("Auth check failed:", err.message);
      setError("Session expired");
      globalUser = null;
    } finally {
      globalLoading = false;
      notifyListeners();
    }
  };

  return { user, loading, error, login, logout, checkAuth };
}
