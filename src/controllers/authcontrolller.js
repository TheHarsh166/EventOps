import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { generateAccessToken, generateRefreshToken } from "../utils/token.js";
import prisma from "../config/prisma.js";


const register = async (req, res) => {
    try {
        const { name, email, password } = req.body;

        // 1. Check whether user already exists
        const existingUser = await prisma.user.findUnique({
            where: { email }
        });

        if (existingUser) {
            return res.status(400).json({
                message: "User already exists"
            });
        }

        // 2. Hash password
        const passwordHash = await bcrypt.hash(password, 10);

        // 3. Create user
        const user = await prisma.user.create({
            data: {
                name,
                email,
                passwordHash
            }
        });

        res.status(201).json({
            message: "User registered successfully",
            user: {
                id: user.id,
                name: user.name,
                email: user.email
            }
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: "Server error"
        });
    }
};



const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        // 1. Find user
        const user = await prisma.user.findUnique({
            where: { email }
        });

        if (!user) {
            return res.status(401).json({
                message: "Invalid email or password"
            });
        }

        // 2. Check password
        const passwordCorrect = await bcrypt.compare(
            password,
            user.passwordHash
        );

        if (!passwordCorrect) {
            return res.status(401).json({
                message: "Invalid email or password"
            });
        }

        // 3. Create tokens
        const accessToken = generateAccessToken(user);
        const refreshToken = generateRefreshToken(user);

        // 4. cannot directly Store refresh token information so hash it for security
        const tokenHash = await bcrypt.hash(refreshToken, 10);

        await prisma.refreshToken.create({
            data: {
                tokenHash,
                userId: user.id,
                expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
            }
        });

        // 5. Put refresh token in HTTP-only cookie
        res.cookie("refreshToken", refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            maxAge: 7 * 24 * 60 * 60 * 1000
        });

        // 6. Send access token to frontend
        res.json({
            message: "Login successful",
            accessToken,
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role
            }
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: "Server error"
        });
    }
};

export {
    register,
    login
};