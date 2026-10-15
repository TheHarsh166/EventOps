import crypto from "crypto";
import prisma from "../config/prisma.js";

const PAYU_KEY = process.env.PAYU_MERCHANT_KEY;
const PAYU_SALT = process.env.PAYU_MERCHANT_SALT;

const PAYU_REFUND_URL =
    process.env.PAYU_REFUND_URL ||
    "https://test.payu.in/merchant/postservice.php?form=2";

function sha512(value) {
    return crypto.createHash("sha512").update(value).digest("hex");
}

function createRefundToken() {
    // PayU's legacy refund token is limited to 23 characters.
    return `RF${crypto.randomBytes(10).toString("hex")}`;
}

export async function requestPayURefund(refundId) {
    if (!PAYU_KEY || !PAYU_SALT) {
        throw new Error("PayU credentials are not configured");
    }

    const refund = await prisma.refund.findUnique({
        where: { id: refundId },
        include: {
            payment: {
                include: {
                    registration: true
                }
            }
        }
    });

    if (!refund) {
        throw new Error("Refund request not found");
    }

    if (refund.status === "PROCESSED") {
        return refund;
    }

    const payment = refund.payment;

    if (payment.status !== "SUCCEEDED") {
        throw new Error("Only successful payments can be refunded");
    }

    if (!payment.payuPaymentId) {
        throw new Error(
            "Missing PayU mihpayid. Store it from the verified payment response."
        );
    }

    const token = refund.idempotencyKey;

    // Legacy PayU command API hash:
    // sha512(key|command|var1|salt)
    const command = "cancel_refund_transaction";
    const var1 = payment.payuPaymentId;
    const hash = sha512(
        `${PAYU_KEY}|${command}|${var1}|${PAYU_SALT}`
    );

    const amountInRupees = (refund.amount / 100).toFixed(2);

    const body = new URLSearchParams({
        key: PAYU_KEY,
        command,
        var1,
        var2: token,
        var3: amountInRupees,
        hash
    });

    const response = await fetch(PAYU_REFUND_URL, {
        method: "POST",
        headers: {
            "Content-Type": "application/x-www-form-urlencoded",
            Accept: "application/json"
        },
        body
    });

    if (!response.ok) {
        throw new Error(`PayU refund API returned HTTP ${response.status}`);
    }

    const result = await response.json();

    /*
     * A successful API call can mean the refund was queued,
     * not that it has completed. Keep the refund PENDING.
     * Reconcile it through PayU's refund-status API.
     */
    if (Number(result.status) !== 1) {
        throw new Error(result.msg || "PayU did not accept the refund request");
    }

    return {
        refundId: refund.id,
        status: "PENDING",
        payuRequestId: result.request_id ?? null,
        message: result.msg ?? "Refund request submitted; final status pending"
    };
}