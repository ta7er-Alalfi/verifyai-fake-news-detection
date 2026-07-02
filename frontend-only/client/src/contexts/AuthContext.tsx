import React, { createContext, useContext, useState, useEffect } from "react";
import type { AxiosError } from "axios";
import api from "../lib/api";

interface User {
  id: number;
  email: string;
  username: string;
  avatar_url: string;
  provider: string;
  is_active?: boolean;
  created_at: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (username: string, email: string, password: string) => Promise<void>;
  googleLogin: (idToken: string) => Promise<void>;
  logout: () => Promise<void>;
  updateUser: (username: string, avatarUrl?: string) => Promise<void>;
  initialized: boolean;
  hadStoredAuth: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

/** Persist both tokens to localStorage */
function saveTokens(accessToken: string, refreshToken: string) {
  localStorage.setItem("token", accessToken);
  localStorage.setItem("refresh_token", refreshToken);
}

/** Clear all auth data from localStorage */
function clearTokens() {
  localStorage.removeItem("token");
  localStorage.removeItem("refresh_token");
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [initialized, setInitialized] = useState(false);
  const [hadStoredAuth] = useState(!!localStorage.getItem("token") || !!localStorage.getItem("refresh_token"));

  /** Fetch the current user from the backend using the stored token */
  const refreshTokens = async (): Promise<boolean> => {
    const refreshToken = localStorage.getItem("refresh_token");
    if (!refreshToken) {
      return false;
    }

    try {
      const res = await api.post("/auth/refresh", { refresh_token: refreshToken });
      saveTokens(res.data.access_token, res.data.refresh_token);
      return true;
    } catch {
      clearTokens();
      setUser(null);
      return false;
    }
  };

  const fetchUser = async () => {
    try {
      const res = await api.get("/auth/me");
      setUser(res.data);
    } catch {
      setUser(null);
      clearTokens();
    } finally {
      setLoading(false);
    }
  };

  const restoreSession = async () => {
    try {
      const token = localStorage.getItem("token");
      const refreshToken = localStorage.getItem("refresh_token");

      if (!token && refreshToken) {
        await refreshTokens();
      }

      if (localStorage.getItem("token")) {
        await fetchUser();
      } else {
        setLoading(false);
      }
    } finally {
      setInitialized(true);
    }
  };

  useEffect(() => {
    restoreSession();
  }, []);

  useEffect(() => {
    const interceptorId = api.interceptors.response.use(
      (response) => response,
      async (error: AxiosError) => {
        const originalRequest = error.config as any;

        if (
          error.response?.status === 401 &&
          originalRequest &&
          !originalRequest._retry
        ) {
          originalRequest._retry = true;
          const refreshed = await refreshTokens();
          if (refreshed) {
            return api(originalRequest);
          }
        }

        return Promise.reject(error);
      }
    );

    return () => {
      api.interceptors.response.eject(interceptorId);
    };
  }, []);

  /** Email/Password Login */
  const login = async (email: string, password: string) => {
    const res = await api.post("/auth/login", { email, password });
    saveTokens(res.data.access_token, res.data.refresh_token);
    setUser(res.data.user);
  };

  /** Email/Password Registration */
  const register = async (username: string, email: string, password: string) => {
    const res = await api.post("/auth/register", { username, email, password });
    saveTokens(res.data.access_token, res.data.refresh_token);
    setUser(res.data.user);
  };

  /** Google OAuth Sign-In/Sign-Up (sends Google ID token to backend) */
  const googleLogin = async (idToken: string) => {
    const res = await api.post("/auth/google", { id_token: idToken });
    saveTokens(res.data.access_token, res.data.refresh_token);
    setUser(res.data.user);
  };

  /** Logout: blacklist access and refresh tokens server-side, then clear local state */
  const logout = async () => {
    try {
      await api.post("/auth/logout", {
        refresh_token: localStorage.getItem("refresh_token"),
      });
    } catch {
      // Proceed with client-side logout even if server call fails
    }
    clearTokens();
    setUser(null);
  };

  /** Update user profile */
  const updateUser = async (username: string, avatarUrl?: string) => {
    const res = await api.put("/auth/me", { username, avatar_url: avatarUrl });
    setUser(res.data);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, googleLogin, logout, updateUser, initialized, hadStoredAuth }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
