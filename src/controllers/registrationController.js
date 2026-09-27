import {
  createRegistration
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