import { api } from "./api.js";

export const registrationService = {
  // Attendee operations
  async getMyRegistrations() {
    const response = await api.get("/registrations/me");
    return response.data?.registrations || [];
  },

  async cancelRegistration(registrationId) {
    const response = await api.patch(`/registrations/${registrationId}/cancel`);
    return response.data;
  },

  async requestRefund(registrationId) {
    const response = await api.post(`/registrations/${registrationId}/refund`);
    return response.data;
  },

  // Organizer operations
  async getEventRegistrations(eventId) {
    const response = await api.get(`/events/${eventId}/registrations`);
    return response.data?.registrations || [];
  },

  async approveRegistration(registrationId) {
    const response = await api.patch(`/registrations/${registrationId}/approve`);
    return response.data;
  },

  async rejectRegistration(registrationId) {
    const response = await api.patch(`/registrations/${registrationId}/reject`);
    return response.data;
  }
};
