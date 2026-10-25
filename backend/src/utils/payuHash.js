import crypto from "crypto";


// =====================================================
// GENERATE SHA-512 HASH
// =====================================================

const generateSHA512 = (text) => {

    return crypto
        .createHash("sha512")
        .update(text)
        .digest("hex");
};


// =====================================================
// GENERATE PAYU PAYMENT REQUEST HASH
// =====================================================

const generatePaymentHash = ({
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
    salt
}) => {

    /*
    PayU Hosted Checkout request hash:

    sha512(
        key|
        txnid|
        amount|
        productinfo|
        firstname|
        email|
        udf1|
        udf2|
        udf3|
        udf4|
        udf5|
        ||||||
        SALT
    )
    */

    const hashString =
        `${key}|${txnid}|${amount}|${productinfo}|${firstname}|${email}|${udf1}|${udf2}|${udf3}|${udf4}|${udf5}||||||${salt}`;


    return generateSHA512(
        hashString
    );
};


// =====================================================
// VERIFY PAYU RESPONSE HASH
// =====================================================

const generateResponseHash = ({
    status,
    udf1 = "",
    udf2 = "",
    udf3 = "",
    udf4 = "",
    udf5 = "",
    email,
    firstname,
    productinfo,
    amount,
    txnid,
    key,
    salt
}) => {

    /*
    PayU response reverse hash:

    sha512(
        SALT|
        status|
        |||||| 
        udf5|
        udf4|
        udf3|
        udf2|
        udf1|
        email|
        firstname|
        productinfo|
        amount|
        txnid|
        key
    )
    */

    const hashString =
        `${salt}|${status}||||||${udf5}|${udf4}|${udf3}|${udf2}|${udf1}|${email}|${firstname}|${productinfo}|${amount}|${txnid}|${key}`;


    return generateSHA512(
        hashString
    );
};


export {
    generatePaymentHash,
    generateResponseHash
};