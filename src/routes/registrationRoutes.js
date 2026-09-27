import express from "express";

import {
  registerForEvent,
  getMyRegistrationsController,
  cancelRegistrationController,
  getEventRegistrationsController,
  approveRegistrationController
} from "../controllers/registrationController.js";

import authMiddleware from "../middleware/authMiddleware.js";
import roleMiddleware from "../middleware/roleMiddleware.js";

const router = express.Router();


// ===============================
// ATTENDEE ROUTES
// ===============================

// Register for an event
router.post(
  "/events/:eventId/registrations",
  authMiddleware,
  roleMiddleware("ATTENDEE"),
  registerForEvent
);


// View my registrations
router.get(
  "/registrations/me",
  authMiddleware,
  roleMiddleware("ATTENDEE"),
  getMyRegistrationsController
);


// Cancel my registration
router.patch(
  "/registrations/:registrationId/cancel",
  authMiddleware,
  roleMiddleware("ATTENDEE"),
  cancelRegistrationController
);


// ===============================
// ORGANISER ROUTES
// ===============================

// View registrations for organiser's event
router.get(
  "/events/:eventId/registrations",
  authMiddleware,
  roleMiddleware("ORGANISER"),
  getEventRegistrationsController
);


// Approve a pending registration
router.patch(
  "/registrations/:registrationId/approve",
  authMiddleware,
  roleMiddleware("ORGANISER"),
  approveRegistrationController
);


export default router;