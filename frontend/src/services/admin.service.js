import { api } from "./api.js";

export const adminService = {
  /**
   * Fetch system-wide platform metrics (users, events, revenue, waitlists)
   */
  async getPlatformAnalytics() {
    const response = await api.get("/organizer/analytics/platform");
    return response.data?.analytics;
  },

  /**
   * Fetch paginated list of users with search and role filters
   */
  async getUsers({ search = "", role = "", page = 1, limit = 20 } = {}) {
    const params = new URLSearchParams();
    if (search) params.append("search", search);
    if (role && role !== "ALL") params.append("role", role);
    if (page) params.append("page", page);
    if (limit) params.append("limit", limit);

    const response = await api.get(`/users?${params.toString()}`);
    return response.data;
  },

  /**
   * Update a user's role (ATTENDEE, ORGANIZER, ADMIN)
   */
  async updateUserRole(userId, newRole) {
    const response = await api.patch(`/users/${userId}/role`, { role: newRole });
    return response.data;
  },

  /**
   * Fetch all platform events across all organizers for administrative oversight
   */
  async getAllEvents({ status = "", search = "", page = 1, limit = 20 } = {}) {
    const params = new URLSearchParams();
    if (status && status !== "ALL") params.append("status", status);
    if (search) params.append("search", search);
    if (page) params.append("page", page);
    if (limit) params.append("limit", limit);

    const response = await api.get(`/events/admin/all?${params.toString()}`);
    return response.data;
  },

  /**
   * Cancel an event administratively
   */
  async cancelEvent(eventId) {
    const response = await api.post(`/events/${eventId}/cancel`);
    return response.data;
  },

  /**
   * Publish a draft event administratively
   */
  async publishEvent(eventId) {
    const response = await api.post(`/events/${eventId}/publish`);
    return response.data;
  }
};
