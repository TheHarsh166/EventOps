import React, { createContext, useContext, useState, useEffect } from "react";
import { authService } from "../services/auth.service.js";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => authService.getStoredUser());
  const [token, setToken] = useState(() => authService.getStoredToken());
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const handleLogout = () => {
      setUser(null);
      setToken(null);
    };

    window.addEventListener("eventops_logout", handleLogout);
    return () => window.removeEventListener("eventops_logout", handleLogout);
  }, []);

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
