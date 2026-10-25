import express from "express";

import {
    getEvents,
    getEventById,
    createEvent,
    updateEvent,
    publishEvent,
    cancelEvent
} from "../controllers/event.controller.js";

import authMiddleware from "../middleware/authMiddleware.js";
import { authorizeRoles } from "../middleware/role.middleware.js";
import { canManageEvent } from "../middleware/eventAccess.middleware.js";

const router = express.Router();


// Public routes

router.get(
    "/",
    getEvents
);

router.get(
    "/:eventId",
    getEventById
);


// Organizer/Admin routes

router.post(
    "/",
    authMiddleware,
    authorizeRoles("ORGANIZER", "ADMIN"),
    createEvent
);


// Organizer's own event OR Admin

router.patch(
    "/:eventId",
    authMiddleware,
    authorizeRoles("ORGANIZER", "ADMIN"),
    canManageEvent,
    updateEvent
);

router.post(
    "/:eventId/publish",
    authMiddleware,
    authorizeRoles("ORGANIZER", "ADMIN"),
    canManageEvent,
    publishEvent
);

router.post(
    "/:eventId/cancel",
    authMiddleware,
    authorizeRoles("ORGANIZER", "ADMIN"),
    canManageEvent,
    cancelEvent
);

export default router;