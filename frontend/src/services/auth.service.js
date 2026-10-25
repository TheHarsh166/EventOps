import { api } from "./api.js";

export const authService = {
  async registerAttendee({ name, email, password }) {
    const response = await api.post("/auth/register/attendee", { name, email, password });
    return response.data;
  },

  async registerOrganizer({ name, email, password }) {
    const response = await api.post("/auth/register/organizer", { name, email, password });
    return response.data;
  },

  async login({ email, password }) {
    const response = await api.post("/auth/login", { email, password });
    if (response.data.accessToken) {
      localStorage.setItem("eventops_token", response.data.accessToken);
      localStorage.setItem("eventops_user", JSON.stringify(response.data.user));
    }
    return response.data;
  },

  async logout() {
    try {
      await api.post("/auth/logout");
    } finally {
      localStorage.removeItem("eventops_token");
      localStorage.removeItem("eventops_user");
    }
  },

  getStoredUser() {
    try {
      const u = localStorage.getItem("eventops_user");
      return u ? JSON.parse(u) : null;
    } catch {
      return null;
    }
  },

  getStoredToken() {
    return localStorage.getItem("eventops_token");
  }
};
