import express from "express";

import {
  registerForEvent,
  getMyRegistrationsController,
  cancelRegistrationController,
  getEventRegistrationsController
} from "../controllers/registrationController.js";

import {
  approveRegistrationController,
  rejectRegistrationController
} from "../controllers/registrationApprovalController.js";

import authMiddleware from "../middleware/authMiddleware.js";
import { authorizeRoles } from "../middleware/role.middleware.js";

const router = express.Router();


// ===============================
// ATTENDEE ROUTES
// ===============================

// Register for an event
router.post(
  "/events/:eventId/registrations",
  authMiddleware,
  authorizeRoles("ATTENDEE"),
  registerForEvent
);


// View my registrations
router.get(
  "/registrations/me",
  authMiddleware,
  authorizeRoles("ATTENDEE"),
  getMyRegistrationsController
);


// Cancel my registration
router.patch(
  "/registrations/:registrationId/cancel",
  authMiddleware,
  authorizeRoles("ATTENDEE"),
  cancelRegistrationController
);


// ===============================
// ORGANIZER ROUTES
// ===============================

// View registrations for organizer's event
router.get(
  "/events/:eventId/registrations",
  authMiddleware,
  authorizeRoles("ORGANIZER"),
  getEventRegistrationsController
);


// Approve a pending registration
router.patch(
  "/registrations/:registrationId/approve",
  authMiddleware,
  authorizeRoles("ORGANIZER"),
  approveRegistrationController
);

// Reject a pending registration
router.patch(
  "/registrations/:registrationId/reject",
  authMiddleware,
  authorizeRoles("ORGANIZER"),
  rejectRegistrationController
);


export default router;