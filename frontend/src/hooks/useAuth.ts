import { useState, useEffect, useCallback } from "react";
import { getMe, logout as apiLogout } from "../lib/api";
import type { User } from "../types";

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const login = useCallback(() => {
    // Direct redirect to backend OAuth endpoint (no localStorage clearing needed)
    window.location.href = "/auth/gitea";
  }, []);

  const logout = useCallback(async () => {
    try {
      await apiLogout();
    } catch (e) {
      console.error("Logout error:", e);
    }
    setUser(null);
    window.location.href = "/login";
  }, []);

  const checkAuth = useCallback(async () => {
    try {
      const response = await getMe();
      setUser(response.data);
      setError(null);
    } catch (err: any) {
      console.error("Auth check failed:", err.message);
      setError("Session expired");
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  return { user, loading, error, login, logout, checkAuth };
}
