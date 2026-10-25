import { api } from "./api.js";

export const analyticsService = {
  async getOrganizerAnalytics() {
    const response = await api.get("/organizer/analytics");
    return response.data?.analytics;
  }
};
