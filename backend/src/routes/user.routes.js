import express from "express";

import {
    updateUserRole
} from "../controllers/user.controller.js";

import authMiddleware from "../middleware/authMiddleware.js";

import {
    authorizeRoles
} from "../middleware/role.middleware.js";

const router = express.Router();

router.patch(
    "/:userId/role",
    authMiddleware,
    authorizeRoles("ADMIN"),
    updateUserRole
);

export default router;