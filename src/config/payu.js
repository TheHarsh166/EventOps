const PAYU_MERCHANT_KEY =
    process.env.PAYU_MERCHANT_KEY;

const PAYU_MERCHANT_SALT =
    process.env.PAYU_MERCHANT_SALT;

const PAYU_PAYMENT_URL =
    process.env.PAYU_PAYMENT_URL ||
    "https://test.payu.in/_payment";


export {
    PAYU_MERCHANT_KEY,
    PAYU_MERCHANT_SALT,
    PAYU_PAYMENT_URL
};