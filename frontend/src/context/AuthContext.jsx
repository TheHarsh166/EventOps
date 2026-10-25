import React, { createContext, useContext, useState, useEffect } from "react";
import { authService } from "../services/auth.service.js";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => authService.getStoredUser());
  const [token, setToken] = useState(() => authService.getStoredToken());
  const [loading, setLoading] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);

  // Validate or sync user profile on initial load
  useEffect(() => {
    let mounted = true;
    async function initAuth() {
      const storedToken = authService.getStoredToken();
      if (storedToken) {
        try {
          const freshUser = await authService.getCurrentUser();
          if (mounted && freshUser) {
            setUser(freshUser);
          }
        } catch (err) {
          // If token expired and couldn't be refreshed, api interceptor dispatches eventops_logout
        }
      }
      if (mounted) {
        setIsInitializing(false);
      }
    }
    initAuth();
    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    const handleLogout = () => {
      setUser(null);
      setToken(null);
    };

    window.addEventListener("eventops_logout", handleLogout);
    return () => window.removeEventListener("eventops_logout", handleLogout);
  }, []);

  const refreshUser = async () => {
    try {
      const fresh = await authService.getCurrentUser();
      setUser(fresh);
      return fresh;
    } catch {
      return null;
    }
  };

  const login = async (email, password) => {
    setLoading(true);
    try {
      const data = await authService.login({ email, password });
      setUser(data.user);
      setToken(data.accessToken);
      return data;
    } finally {
      setLoading(false);
    }
  };

  const registerAttendee = async (payload) => {
    setLoading(true);
    try {
      return await authService.registerAttendee(payload);
    } finally {
      setLoading(false);
    }
  };

  const registerOrganizer = async (payload) => {
    setLoading(true);
    try {
      return await authService.registerOrganizer(payload);
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      await authService.logout();
    } finally {
      setUser(null);
      setToken(null);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!token && !!user,
        role: user?.role,
        loading,
        isInitializing,
        refreshUser,
        login,
        registerAttendee,
        registerOrganizer,
        logout
      }}
    >
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

