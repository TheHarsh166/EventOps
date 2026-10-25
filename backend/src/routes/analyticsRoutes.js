import express from "express";
import { getOrganizerAnalyticsController } from "../controllers/analyticsController.js";
import authMiddleware from "../middleware/authMiddleware.js";
import { authorizeRoles } from "../middleware/role.middleware.js";

const router = express.Router();

router.get(
  "/",
  authMiddleware,
  authorizeRoles("ORGANIZER", "ADMIN"),
  getOrganizerAnalyticsController
);

export default router;
