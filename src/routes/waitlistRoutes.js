import express from "express";
import { joinWaitlistController } from "../controllers/waitlistController.js";
import authMiddleware from "../middleware/authMiddleware.js";
import { authorizeRoles } from "../middleware/role.middleware.js";

const router = express.Router();

router.post(
    "/events/:eventId/waitlist",
    authMiddleware,
    authorizeRoles("ATTENDEE"),
    joinWaitlistController
);

export default router;