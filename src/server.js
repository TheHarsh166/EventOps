import express from 'express';
import dotenv from 'dotenv';
import cookieParser from "cookie-parser";
import authRoutes from "./routes/authRoutes.js";
import eventRoutes from "./routes/event.routes.js";
import userRoutes from "./routes/user.routes.js";
import registrationRoutes from "./routes/registrationRoutes.js";

dotenv.config();

const app = express();

app.use(express.json());
app.use(cookieParser());

app.get("/", (req, res) => {
    res.json({
        message: "EventOps API is running"
    });
});

app.use("/api/auth", authRoutes);
app.use("/api/events", eventRoutes);
app.use("/api/users", userRoutes);
app.use("/api", registrationRoutes);


const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});