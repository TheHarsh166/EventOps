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
  },

  // Organizer methods
  async getOrganizerEvents() {
    const response = await api.get("/events/organizer/me");
    return response.data?.events || [];
  },

  async createEvent(data) {
    const response = await api.post("/events", data);
    return response.data;
  },

  async updateEvent(eventId, data) {
    const response = await api.patch(`/events/${eventId}`, data);
    return response.data;
  },

  async publishEvent(eventId) {
    const response = await api.post(`/events/${eventId}/publish`);
    return response.data;
  },

  async cancelEvent(eventId) {
    const response = await api.post(`/events/${eventId}/cancel`);
    return response.data;
  }
};

