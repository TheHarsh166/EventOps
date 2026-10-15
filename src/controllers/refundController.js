import {
    cancelPaidRegistrationAndRefund
} from "../services/refundService.js";

export async function requestRefundController(req, res) {
    try {
        const result = await cancelPaidRegistrationAndRefund(
            req.user.id,
            req.params.registrationId
        );

        return res.status(202).json({
            success: true,
            message:
                "Cancellation recorded. Refund status must be reconciled with PayU.",
            ...result
        });
    } catch (error) {
        console.error("Refund request failed:", error);

        return res.status(400).json({
            success: false,
            message: error.message
        });
    }
}