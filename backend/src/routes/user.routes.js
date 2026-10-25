import express from "express";

import {
    updateUserRole
} from "../controllers/user.controller.js";

import authMiddleware from "../middleware/authMiddleware.js";

import {
    authorizeRoles
} from "../middleware/role.middleware.js";

const router = express.Router();

router.get(
    "/me",
    authMiddleware,
    async (req, res) => {
        try {
            return res.status(200).json({
                user: req.user
            });
        } catch (error) {
            return res.status(500).json({ message: "Server error" });
        }
    }
);

router.patch(
    "/:userId/role",
    authMiddleware,
    authorizeRoles("ADMIN"),
    updateUserRole
);

export default router;