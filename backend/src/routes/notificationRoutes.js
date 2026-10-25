import express from "express";
import {
  getMyNotificationsController,
  markAsReadController,
  markAllAsReadController
} from "../controllers/notificationController.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/", authMiddleware, getMyNotificationsController);
router.patch("/:notificationId/read", authMiddleware, markAsReadController);
router.patch("/read-all", authMiddleware, markAllAsReadController);

export default router;
