import {
  approveRegistration,
  rejectRegistration
} from "../services/registrationService.js";

function getUserId(req) {
  return req.user?.id ?? req.user?.userId;
}

function sendRegistrationError(res, error) {
  const message = error.message || "Registration operation failed";

  const clientErrors = [
    "Registration not found",
    "Only pending registrations can be approved",
    "Only pending registrations can be rejected",
    "You are not allowed to approve this registration",
    "You are not allowed to reject this registration",
    "Resolve the existing payment before approving this registration",
    "Cannot reject a registration with a processing or successful payment. Resolve the payment or refund first.",
    "Registration status changed. Refresh and try again."
  ];

  const status = clientErrors.includes(message) ? 400 : 500;

  if (status === 500) {
    console.error("Registration approval/rejection error:", error);
  }

  return res.status(status).json({
    success: false,
    message
  });
}

export async function approveRegistrationController(req, res) {
  try {
    const organizerId = getUserId(req);

    if (!organizerId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required"
      });
    }

    const registration = await approveRegistration(
      req.params.registrationId,
      organizerId
    );

    return res.status(200).json({
      success: true,
      message: "Registration approved successfully",
      registration
    });
  } catch (error) {
    return sendRegistrationError(res, error);
  }
}

export async function rejectRegistrationController(req, res) {
  try {
    const organizerId = getUserId(req);

    if (!organizerId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required"
      });
    }

    const result = await rejectRegistration(
      req.params.registrationId,
      organizerId
    );

    return res.status(200).json({
      success: true,
      message: "Registration rejected successfully",
      ...result
    });
  } catch (error) {
    return sendRegistrationError(res, error);
  }
}
