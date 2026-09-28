import express from "express";

import {
    registerAttendee,
    registerOrganizer,
    login,
    refreshAccessToken,
    logout
} from "../controllers/authController.js";

const router = express.Router();

router.post("/register/attendee",registerAttendee);

router.post("/register/organizer",registerOrganizer);

router.post("/login", login);
router.post("/refresh", refreshAccessToken);
router.post("/logout", logout);

export default router;