import express from 'express';
import dotenv from 'dotenv';

// Load .env from the parent directory since server.js is in src/ and .env is in backend/
dotenv.config({ path: '../.env' });

const app = express();

app.use(express.json());

app.get("/", (req, res) => {
    res.json({
        message: "EventOps API is running"
    });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});