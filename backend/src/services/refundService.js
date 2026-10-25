import crypto from "crypto";
import prisma from "../config/prisma.js";
import { promoteNextAttendee } from "./waitlistService.js";
import { requestPayURefund } from "./payuRefundService.js";

export async function cancelPaidRegistrationAndRefund(
    userId,
    registrationId
) {
    const result = await prisma.$transaction(async (tx) => {
        const registration = await tx.registration.findUnique({
            where: { id: registrationId },
            include: {
                payment: true,
                event: true
            }
        });

        if (!registration) {
            throw new Error("Registration not found");
        }

        if (registration.userId !== userId) {
            throw new Error("You cannot cancel this registration");
        }

        if (registration.status === "CANCELLED") {
            const existingRefund = registration.payment
                ? await tx.refund.findFirst({
                    where: { paymentId: registration.payment.id },
                    orderBy: { createdAt: "desc" }
                })
                : null;

            return {
                alreadyCancelled: true,
                refundId: existingRefund?.id ?? null
            };
        }

        if (registration.status !== "CONFIRMED") {
            throw new Error(
                "Only a confirmed registration can use the paid cancellation flow"
            );
        }

        const payment = registration.payment;

        if (!payment || payment.status !== "SUCCEEDED") {
            throw new Error("A successful payment is required for a refund");
        }

        if (!payment.payuPaymentId) {
            throw new Error("The verified PayU payment ID is missing");
        }

        const existingPendingRefund = await tx.refund.findFirst({
            where: {
                paymentId: payment.id,
                status: "PENDING"
            }
        });

        if (existingPendingRefund) {
            throw new Error("A refund request is already pending");
        }

        const refundToken = `RF${crypto.randomBytes(10).toString("hex")}`;

        const refund = await tx.refund.create({
            data: {
                paymentId: payment.id,
                amount: payment.amount,
                status: "PENDING",
                idempotencyKey: refundToken,
                reason: "Attendee cancellation"
            }
        });

        await tx.registration.update({
            where: { id: registration.id },
            data: { status: "CANCELLED" }
        });

        await tx.event.update({
            where: { id: registration.eventId },
            data: { availableSeats: { increment: 1 } }
        });

        await promoteNextAttendee(tx, registration.eventId);

        return {
            alreadyCancelled: false,
            refundId: refund.id
        };
    });

    if (result.refundId && !result.alreadyCancelled) {
        // External API call happens outside the database transaction.
        try {
            const payuResponse = await requestPayURefund(result.refundId);
            result.payu = payuResponse;
        } catch (payuError) {
            console.error("PayU refund dispatch error:", payuError.message);
            result.payuError = payuError.message;
        }
    }

    return result;
}