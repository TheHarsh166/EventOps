import express from 'express';
import dotenv from 'dotenv';

dotenv.config({ path: '../.env' });

const app = express();

app.use(express.json());
app.use(cookieParser());

app.get("/", (req, res) => {
    res.json({
        message: "EventOps API is running"
    });
});



const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});