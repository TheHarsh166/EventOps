import express from "express";
import {
  getOrganizerAnalyticsController,
  getPlatformAdminAnalyticsController
} from "../controllers/analyticsController.js";
import authMiddleware from "../middleware/authMiddleware.js";
import { authorizeRoles } from "../middleware/role.middleware.js";

const router = express.Router();

// Organizer personal analytics
router.get(
  "/",
  authMiddleware,
  authorizeRoles("ORGANIZER", "ADMIN"),
  getOrganizerAnalyticsController
);

// Platform admin system-wide analytics
router.get(
  "/platform",
  authMiddleware,
  authorizeRoles("ADMIN"),
  getPlatformAdminAnalyticsController
);

export default router;
