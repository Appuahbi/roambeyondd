require("dotenv").config();

const app = require("./app");
const connectDB = require("./database/db");
const { connectRedis } = require("./config/redis");

const PORT = process.env.PORT || 5000;

// Warn if JWT secret is weak
if (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 32) {
    console.warn("⚠️  WARNING: JWT_SECRET is weak or missing. Use a strong, random secret (at least 32 characters) for production.");
}

const startServer = async () => {
    try {
        await connectDB();

        await connectRedis();

        app.listen(PORT, () => {
            console.log(`🚀 Server running on http://localhost:${PORT}`);
        });

    } catch (error) {
        console.error(error);
    }
};

startServer();