import express from "express";
import { requestRefundController } from "../controllers/refundController.js";
import authMiddleware from "../middleware/authMiddleware.js";
import { authorizeRoles } from "../middleware/role.middleware.js";

const router = express.Router();

router.post(
    "/registrations/:registrationId/refund",
    authMiddleware,
    authorizeRoles("ATTENDEE"),
    requestRefundController
);

export default router;