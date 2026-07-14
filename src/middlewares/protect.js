const jwt = require("jsonwebtoken");
const User = require("../models/User");
const AppError = require("../utils/AppError");
const { redisClient } = require("../config/redis");

const protect = async (req, res, next) => {

    try {

        let token;

        // Get token from Authorization header
        if (
            req.headers.authorization &&
            req.headers.authorization.startsWith("Bearer ")
        ) {
            token = req.headers.authorization.split(" ")[1];
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
            // Redis unavailable — skip blacklist check
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

        // Find user
        const user = await User.findById(decoded.id);

        if (!user) {
            throw new AppError(
                "The user belonging to this token no longer exists.",
                401
            );
        }

        // Make user available in all next middleware/controllers
        req.user = user;
        req.decoded = decoded;

        next();

    } catch (error) {
        next(error);
    }

};

module.exports = protect;