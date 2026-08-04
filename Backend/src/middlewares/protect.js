const jwt = require("jsonwebtoken");
const User = require("../models/User");
const AppError = require("../utils/AppError");
const { redisClient } = require("../config/redis");
const { AUTH_COOKIE_NAME } = require("../utils/authCookie");
const logger = require("../config/logger");

const protect = async (req, res, next) => {

    try {

        let token;

        // Get token from Authorization header (kept for API clients/tests)
        if (
            req.headers.authorization &&
            req.headers.authorization.startsWith("Bearer ")
        ) {
            token = req.headers.authorization.split(" ")[1];
        }

        // Fall back to the httpOnly auth cookie (browser sessions)
        if (!token && req.cookies && req.cookies[AUTH_COOKIE_NAME]) {
            token = req.cookies[AUTH_COOKIE_NAME];
        }

        // No token
        if (!token) {
            throw new AppError(
                "You are not logged in. Please log in to continue.",
                401
            );
        }

        // Check if token is blacklisted (logged out)
        let isBlacklisted = false;
        try {
            isBlacklisted = await redisClient.get(`blacklist:${token}`);
        } catch (redisError) {
            logger.warn({ err: redisError }, "Redis unavailable — skip blacklist check");
        }
        if (isBlacklisted) {
            throw new AppError(
                "Token has been invalidated. Please log in again.",
                401
            );
        }

        // Verify token
        let decoded;
        try {
            decoded = jwt.verify(
                token,
                process.env.JWT_SECRET
            );
        } catch (jwtError) {
            if (jwtError.name === "JsonWebTokenError") {
                throw new AppError("Invalid token. Please log in again.", 401);
            }
            if (jwtError.name === "TokenExpiredError") {
                throw new AppError("Token has expired. Please log in again.", 401);
            }
            throw jwtError;
        }

        // Try to get user from cache, fall back to DB
        let user;
        const cacheKey = `user:${decoded.id}`;

        try {
            const cached = await redisClient.get(cacheKey);
            if (cached) {
                user = JSON.parse(cached);
                // Reattach Mongoose methods needed downstream
                user = new User(user);
                user.isNew = false;
            }
        } catch (redisError) {
            // Redis unavailable — fall through to DB
        }

        if (!user) {
            user = await User.findById(decoded.id);

            if (!user) {
                throw new AppError(
                    "The user belonging to this token no longer exists.",
                    401
                );
            }

            // Cache user for 5 minutes
            try {
                await redisClient.set(cacheKey, JSON.stringify(user.toObject()), { EX: 300 });
            } catch (redisError) {
                // Redis unavailable — skip caching
            }
        }

        // Reject tokens issued before the last password change
        if (user.passwordChangedAt && decoded.iat) {
            const changedTimestamp = Math.floor(
                user.passwordChangedAt.getTime() / 1000
            );
            if (decoded.iat < changedTimestamp) {
                throw new AppError(
                    "Password was recently changed. Please log in again.",
                    401
                );
            }
        }

        // Make user available in all next middleware/controllers
        req.user = user;
        req.decoded = decoded;
        req.token = token;

        next();

    } catch (error) {
        next(error);
    }

};

module.exports = protect;
