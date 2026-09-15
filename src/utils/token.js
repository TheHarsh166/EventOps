import jwt from "jsonwebtoken";

function generateAccessToken(user) {
    return jwt.sign(
        {
            userId: user.id,
            role: user.role
        },
        process.env.JWT_ACCESS_SECRET,
        {
            expiresIn: "15m"
        }
    );
}

function generateRefreshToken(user) {
    return jwt.sign(
        {
            userId: user.id
        },
        process.env.JWT_REFRESH_SECRET,
        {
            expiresIn: "7d"
        }
    );
}

export {
    generateAccessToken,
    generateRefreshToken
};