import express from "express";

import {
    initiatePaymentController,
    payUSuccessController,
    payUFailureController,
    getPaymentController
} from "../controllers/paymentController.js";

import authMiddleware
    from "../middleware/authMiddleware.js";

import {
    authorizeRoles
} from "../middleware/role.middleware.js";


const router = express.Router();


// =====================================================
// ATTENDEE - INITIATE PAYMENT
// =====================================================

router.post(
    "/payments/:registrationId/initiate",

    authMiddleware,

    authorizeRoles("ATTENDEE"),

    initiatePaymentController
);


// =====================================================
// PAYU SUCCESS CALLBACK
// =====================================================

router.post(
    "/payments/payu/success",

    payUSuccessController
);


// =====================================================
// PAYU FAILURE CALLBACK
// =====================================================

router.post(
    "/payments/payu/failure",

    payUFailureController
);


// =====================================================
// ATTENDEE - GET PAYMENT
// =====================================================

router.get(
    "/payments/:registrationId",

    authMiddleware,

    authorizeRoles("ATTENDEE"),

    getPaymentController
);


export default router;