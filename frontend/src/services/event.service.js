import { api } from "./api.js";

export const eventService = {
  async getPublishedEvents() {
    const response = await api.get("/events");
    return response.data?.events || [];
  },

  async getEventById(eventId) {
    const response = await api.get(`/events/${eventId}`);
    return response.data?.event;
  },

  async registerForEvent(eventId) {
    const response = await api.post(`/events/${eventId}/registrations`);
    return response.data;
  },

  async joinWaitlist(eventId) {
    const response = await api.post(`/events/${eventId}/waitlist`);
    return response.data;
  }
};
