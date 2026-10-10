import crypto from "crypto";

import prisma from "../config/prisma.js";

import {
    PAYU_MERCHANT_KEY,
    PAYU_MERCHANT_SALT,
    PAYU_PAYMENT_URL
} from "../config/payu.js";

import {
    generatePaymentHash,
    generateResponseHash
} from "../utils/payuHash.js";


// =====================================================
// CREATE UNIQUE PAYU TRANSACTION ID
// =====================================================

const generateTxnId = () => {

    return `EVT_${Date.now()}_${crypto
        .randomBytes(6)
        .toString("hex")}`;
};


// =====================================================
// CREATE PAYU PAYMENT REQUEST
// =====================================================

const createPaymentRequest = async (
    userId,
    registrationId
) => {

    // -------------------------------------------------
    // 1. FIND REGISTRATION
    // -------------------------------------------------

    const registration =
        await prisma.registration.findUnique({

            where: {
                id: registrationId
            },

            include: {
                event: true,
                user: true,
                payment: true
            }
        });


    if (!registration) {

        throw new Error(
            "Registration not found"
        );
    }


    // -------------------------------------------------
    // 2. CHECK OWNERSHIP
    // -------------------------------------------------

    if (
        registration.userId !==
        userId
    ) {

        throw new Error(
            "You are not allowed to pay for this registration"
        );
    }


    // -------------------------------------------------
    // 3. CHECK REGISTRATION STATUS
    // -------------------------------------------------

    if (
        registration.status !==
        "PAYMENT_PENDING"
    ) {

        throw new Error(
            "This registration is not awaiting payment"
        );
    }


    // -------------------------------------------------
    // 4. CHECK EVENT
    // -------------------------------------------------

    if (!registration.event) {

        throw new Error(
            "Event not found"
        );
    }


    // -------------------------------------------------
    // 5. CHECK PRICE
    // -------------------------------------------------

    if (
        registration.event.price <= 0
    ) {

        throw new Error(
            "This event does not require payment"
        );
    }


    // -------------------------------------------------
    // 6. DON'T PAY TWICE
    // -------------------------------------------------

    if (
        registration.payment?.status ===
        "SUCCEEDED"
    ) {

        throw new Error(
            "This registration has already been paid"
        );
    }


    // -------------------------------------------------
    // 7. CREATE PAYMENT RECORD
    // -------------------------------------------------

    let payment =
        registration.payment;


    if (!payment) {

        const txnId =
            generateTxnId();


        payment =
            await prisma.payment.create({

                data: {

                    registrationId:
                        registration.id,

                    /*
                    Store amount in paise.

                    Example:
                    ₹999 = 99900 paise
                    */

                    amount:
                        Math.round(
                            registration.event.price * 100
                        ),

                    currency:
                        "INR",

                    status:
                        "PENDING",

                    payuTxnId:
                        txnId
                }
            });
    }


    // -------------------------------------------------
    // 8. GENERATE AMOUNT STRING
    // -------------------------------------------------

    const amount =
        (
            payment.amount / 100
        ).toFixed(2);


    // -------------------------------------------------
    // 9. CUSTOMER INFORMATION
    // -------------------------------------------------

    const firstname =
        registration.user.name
            ?.trim()
            .split(" ")[0] ||
        "Attendee";


    const email =
        registration.user.email;


    // -------------------------------------------------
    // 10. PRODUCT INFO
    // -------------------------------------------------

    const productinfo =
        registration.event.title;


    // -------------------------------------------------
    // 11. CALLBACK URLS
    // -------------------------------------------------

    const surl =
        `${process.env.BACKEND_URL}/api/payments/payu/success`;

    const furl =
        `${process.env.BACKEND_URL}/api/payments/payu/failure`;


    // -------------------------------------------------
    // 12. UDF5 STORES REGISTRATION ID
    // -------------------------------------------------

    const udf5 =
        registration.id;


    // -------------------------------------------------
    // 13. GENERATE PAYU HASH
    // -------------------------------------------------

    const hash =
        generatePaymentHash({

            key:
                PAYU_MERCHANT_KEY,

            txnid:
                payment.payuTxnId,

            amount,

            productinfo,

            firstname,

            email,

            udf5,

            salt:
                PAYU_MERCHANT_SALT
        });


    // -------------------------------------------------
    // 14. UPDATE PAYMENT STATUS
    // -------------------------------------------------

    await prisma.payment.update({

        where: {
            id: payment.id
        },

        data: {
            status: "PROCESSING"
        }
    });


    // -------------------------------------------------
    // 15. RETURN PAYU FORM DATA
    // -------------------------------------------------

    return {

        action:
            PAYU_PAYMENT_URL,

        fields: {

            key:
                PAYU_MERCHANT_KEY,

            txnid:
                payment.payuTxnId,

            amount,

            productinfo,

            firstname,

            email,

            phone:
                registration.user.phone ||
                "",

            surl,

            furl,

            hash,

            udf1: "",

            udf2: "",

            udf3: "",

            udf4: "",

            udf5:
                registration.id
        }
    };
};


// =====================================================
// HANDLE PAYU RESPONSE
// =====================================================

const handlePayUResponse = async (
    response
) => {

    // -------------------------------------------------
    // 1. GET RESPONSE VALUES
    // -------------------------------------------------

    const {

        status,

        key,

        txnid,

        amount,

        productinfo,

        firstname,

        email,

        udf1 = "",

        udf2 = "",

        udf3 = "",

        udf4 = "",

        udf5 = "",

        hash,

        mihpayid

    } = response;


    // -------------------------------------------------
    // 2. BASIC VALIDATION
    // -------------------------------------------------

    if (
        !key ||
        !txnid ||
        !hash
    ) {

        throw new Error(
            "Invalid PayU response"
        );
    }


    // -------------------------------------------------
    // 3. CHECK MERCHANT KEY
    // -------------------------------------------------

    if (
        key !==
        PAYU_MERCHANT_KEY
    ) {

        throw new Error(
            "Invalid PayU merchant key"
        );
    }


    // -------------------------------------------------
    // 4. FIND PAYMENT
    // -------------------------------------------------

    const payment =
        await prisma.payment.findUnique({

            where: {
                payuTxnId: txnid
            },

            include: {
                registration: true
            }
        });


    if (!payment) {

        throw new Error(
            "Payment transaction not found"
        );
    }


    // -------------------------------------------------
    // 5. VERIFY RESPONSE HASH
    // -------------------------------------------------

    const generatedHash =
        generateResponseHash({

            status,

            udf1,

            udf2,

            udf3,

            udf4,

            udf5,

            email,

            firstname,

            productinfo,

            amount,

            txnid,

            key,

            salt:
                PAYU_MERCHANT_SALT
        });


    if (
        generatedHash.toLowerCase() !==
        hash.toLowerCase()
    ) {

        throw new Error(
            "PayU response hash verification failed"
        );
    }


    // -------------------------------------------------
    // 6. CHECK PAYMENT AMOUNT
    // -------------------------------------------------

    const expectedAmount =
        (
            payment.amount / 100
        ).toFixed(2);


    if (
        Number(amount) !==
        Number(expectedAmount)
    ) {

        throw new Error(
            "Payment amount mismatch"
        );
    }


    // -------------------------------------------------
    // 7. HANDLE SUCCESS
    // -------------------------------------------------

    if (
        status ===
        "success"
    ) {

        return await markPaymentSuccessful({

            paymentId:
                payment.id,

            registrationId:
                payment.registrationId,

            payuPaymentId:
                mihpayid
        });
    }


    // -------------------------------------------------
    // 8. HANDLE FAILURE
    // -------------------------------------------------

    if (
        status ===
        "failure"
    ) {

        return await markPaymentFailed({

            paymentId:
                payment.id
        });
    }


    // -------------------------------------------------
    // 9. UNKNOWN STATUS
    // -------------------------------------------------

    throw new Error(
        `Unknown PayU payment status: ${status}`
    );
};


// =====================================================
// MARK PAYMENT SUCCESSFUL
// =====================================================

const markPaymentSuccessful = async ({
    paymentId,
    registrationId,
    payuPaymentId
}) => {

    return await prisma.$transaction(
        async (tx) => {

            // -----------------------------------------
            // GET CURRENT PAYMENT
            // -----------------------------------------

            const payment =
                await tx.payment.findUnique({

                    where: {
                        id: paymentId
                    }
                });


            if (!payment) {

                throw new Error(
                    "Payment not found"
                );
            }


            // -----------------------------------------
            // IDEMPOTENCY
            // -----------------------------------------

            if (
                payment.status ===
                "SUCCEEDED"
            ) {

                return payment;
            }


            // -----------------------------------------
            // UPDATE PAYMENT
            // -----------------------------------------

            const updatedPayment =
                await tx.payment.update({

                    where: {
                        id: paymentId
                    },

                    data: {

                        status:
                            "SUCCEEDED",

                        payuPaymentId:
                            payuPaymentId ||
                            null,

                        paidAt:
                            new Date()
                    }
                });


            // -----------------------------------------
            // CONFIRM REGISTRATION
            // -----------------------------------------

            await tx.registration.update({

                where: {
                    id: registrationId
                },

                data: {

                    status:
                        "CONFIRMED"
                }
            });


            return updatedPayment;
        }
    );
};


// =====================================================
// MARK PAYMENT FAILED
// =====================================================

const markPaymentFailed = async ({
    paymentId
}) => {

    return await prisma.payment.update({

        where: {
            id: paymentId
        },

        data: {

            status:
                "FAILED",

            failedAt:
                new Date()
        }
    });
};


// =====================================================
// GET PAYMENT
// =====================================================

const getPayment = async (
    userId,
    registrationId
) => {

    const registration =
        await prisma.registration.findUnique({

            where: {
                id: registrationId
            },

            include: {
                payment: true
            }
        });


    if (!registration) {

        throw new Error(
            "Registration not found"
        );
    }


    if (
        registration.userId !==
        userId
    ) {

        throw new Error(
            "You are not allowed to view this payment"
        );
    }


    if (!registration.payment) {

        throw new Error(
            "Payment not found"
        );
    }


    return registration.payment;
};


export {
    createPaymentRequest,
    handlePayUResponse,
    getPayment
};