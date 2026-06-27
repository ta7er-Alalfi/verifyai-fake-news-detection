import React, { createContext, useContext, useState, useEffect } from "react";
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

  /** Fetch the current user from the backend using the stored token */
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

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      fetchUser();
    } else {
      setLoading(false);
    }
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

  /** Logout: blacklist token server-side, then clear local state */
  const logout = async () => {
    try {
      await api.post("/auth/logout");
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
    <AuthContext.Provider value={{ user, loading, login, register, googleLogin, logout, updateUser }}>
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
