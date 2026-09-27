import express from "express";

import {
    updateUserRole
} from "../controllers/user.controller.js";

import {
    authenticate
} from "../middleware/auth.middleware.js";

import {
    authorizeRoles
} from "../middleware/role.middleware.js";

const router = express.Router();

router.patch(
    "/:userId/role",
    authenticate,
    authorizeRoles("ADMIN"),
    updateUserRole
);

export default router;