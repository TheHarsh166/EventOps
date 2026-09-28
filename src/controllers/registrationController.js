import {
  createRegistration,
  getMyRegistrations,
  cancelRegistration,
  getEventRegistrations,
  approveRegistration
} from "../services/registrationService.js";

export const registerForEvent = async (req, res) => {
  try {
    const { eventId } = req.params;
    const userId = req.user.id;

    const registration = await createRegistration(
      userId,
      eventId
    );

    return res.status(201).json({
      success: true,
      message: registration.status === "PENDING"
        ? "Registration submitted for approval"
        : "Registration successful",
      registration
    });

  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

export const getMyRegistrationsController = async (req, res) => {
  try {
    const registrations = await getMyRegistrations(req.user.id);

    res.status(200).json({
      success: true,
      registrations
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

export const cancelRegistrationController = async (req, res) => {
  try {
    const { registrationId } = req.params;
    const userId = req.user.id;

    const registration = await cancelRegistration(
      registrationId,
      userId
    );

    return res.status(200).json({
      success: true,
      message: "Registration cancelled successfully",
      registration
    });

  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

export const getEventRegistrationsController = async (req, res) => {
  try {
    const { eventId } = req.params;
    const organizerId = req.user.id;

    const registrations = await getEventRegistrations(
      eventId,
      organizerId
    );

    return res.status(200).json({
      success: true,
      registrations
    });

  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

export const approveRegistrationController = async (req, res) => {
  try {
    const { registrationId } = req.params;
    const organizerId = req.user.id;

    const registration = await approveRegistration(
      registrationId,
      organizerId
    );

    return res.status(200).json({
      success: true,
      message: "Registration approved successfully",
      registration
    });

  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message
    });
  }
};