import {
    createPaymentRequest,
    handlePayUResponse,
    getPayment
} from "../services/paymentService.js";


// =====================================================
// INITIATE PAYMENT
// =====================================================

const initiatePaymentController = async (
    req,
    res
) => {

    try {

        const {
            registrationId
        } = req.params;


        const paymentRequest =
            await createPaymentRequest(

                req.user.id,

                registrationId
            );


        return res.status(200).json({

            success: true,

            message:
                "PayU payment request created",

            action:
                paymentRequest.action,

            fields:
                paymentRequest.fields
        });

    } catch (error) {

        console.error(error);

        return res.status(400).json({

            success: false,

            message:
                error.message
        });
    }
};


// =====================================================
// PAYU SUCCESS CALLBACK
// =====================================================

const payUSuccessController = async (
    req,
    res
) => {

    try {

        await handlePayUResponse(
            req.body
        );


        /*
        Redirect frontend.

        IMPORTANT:
        Database was already updated
        only after PayU hash verification.
        */

        return res.redirect(
            `${process.env.FRONTEND_URL}/payment/success`
        );

    } catch (error) {

        console.error(
            "PayU success callback error:",
            error
        );


        return res.redirect(
            `${process.env.FRONTEND_URL}/payment/failed`
        );
    }
};


// =====================================================
// PAYU FAILURE CALLBACK
// =====================================================

const payUFailureController = async (
    req,
    res
) => {

    try {

        await handlePayUResponse(
            req.body
        );

    } catch (error) {

        console.error(
            "PayU failure callback error:",
            error
        );
    }


    return res.redirect(
        `${process.env.FRONTEND_URL}/payment/failed`
    );
};


// =====================================================
// GET PAYMENT
// =====================================================

const getPaymentController = async (
    req,
    res
) => {

    try {

        const {
            registrationId
        } = req.params;


        const payment =
            await getPayment(

                req.user.id,

                registrationId
            );


        return res.status(200).json({

            success: true,

            payment
        });

    } catch (error) {

        console.error(error);

        return res.status(400).json({

            success: false,

            message:
                error.message
        });
    }
};


export {
    initiatePaymentController,
    payUSuccessController,
    payUFailureController,
    getPaymentController
};