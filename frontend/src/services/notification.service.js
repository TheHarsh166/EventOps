import { api } from "./api.js";

export const notificationService = {
  async getNotifications() {
    const response = await api.get("/notifications");
    return response.data?.notifications || [];
  },

  async markAsRead(notificationId) {
    const response = await api.patch(`/notifications/${notificationId}/read`);
    return response.data;
  },

  async markAllAsRead() {
    const response = await api.patch("/notifications/read-all");
    return response.data;
  }
};
