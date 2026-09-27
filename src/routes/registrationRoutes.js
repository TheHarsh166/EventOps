import express from "express";

import {
  registerForEvent
} from "../controllers/registrationController.js";

import authMiddleware from "../middleware/authMiddleware.js";
import roleMiddleware from "../middleware/roleMiddleware.js";

const router = express.Router();

router.post(
  "/events/:eventId/registrations",
  authMiddleware,
  roleMiddleware("ATTENDEE"),
  registerForEvent
);

router.get(
  "/registrations/me",
  authMiddleware,
  roleMiddleware("ATTENDEE"),
  getMyRegistrationsController
);

export default router;