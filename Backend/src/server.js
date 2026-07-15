require("dotenv").config({ path: require("path").resolve(__dirname, "../../.env") });

const app = require("./app");
const connectDB = require("./database/db");
const { connectRedis, redisClient } = require("./config/redis");
const logger = require("./config/logger");

const PORT = process.env.PORT || 5000;

// Warn if JWT secret is weak
if (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 32) {
    logger.warn("JWT_SECRET is weak or missing. Use a strong, random secret (at least 32 characters) for production.");
}

const startServer = async () => {
    try {
        await connectDB();

        await connectRedis();

        const server = app.listen(PORT, () => {
            logger.info(`Server running on http://localhost:${PORT}`);
        });

        const shutdown = async (signal) => {
            logger.info(`${signal} received. Shutting down gracefully...`);
            server.close(async () => {
                try {
                    const mongoose = require("mongoose");
                    await mongoose.connection.close(false);
                    redisClient.quit();
                } catch (err) {
                    logger.error({ err }, "Error during shutdown");
                }
                process.exit(0);
            });
            setTimeout(() => process.exit(1), 10000);
        };

        process.on("SIGTERM", () => shutdown("SIGTERM"));
        process.on("SIGINT", () => shutdown("SIGINT"));

    } catch (error) {
        logger.fatal({ err: error }, "Server failed to start");
        process.exit(1);
    }
};

startServer();
