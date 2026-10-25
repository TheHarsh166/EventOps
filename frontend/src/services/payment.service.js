import { api } from "./api.js";

export const paymentService = {
  /**
   * Initiate PayU payment for a pending registration.
   * Returns { success, action, fields }
   */
  async initiatePayment(registrationId) {
    const response = await api.post(`/payments/${registrationId}/initiate`);
    return response.data;
  },

  /**
   * Fetch payment details for a registration
   */
  async getPayment(registrationId) {
    const response = await api.get(`/payments/${registrationId}`);
    return response.data?.payment;
  },

  /**
   * Helper to submit form dynamically to PayU URL
   */
  submitPayUForm(action, fields) {
    const form = document.createElement("form");
    form.method = "POST";
    form.action = action;
    form.style.display = "none";

    Object.entries(fields).forEach(([key, value]) => {
      const input = document.createElement("input");
      input.type = "hidden";
      input.name = key;
      input.value = value ?? "";
      form.appendChild(input);
    });

    document.body.appendChild(form);
    form.submit();
  }
};
