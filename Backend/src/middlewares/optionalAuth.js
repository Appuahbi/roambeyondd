const jwt = require("jsonwebtoken");
const User = require("../models/User");
const { redisClient } = require("../config/redis");

const optionalAuth = async (req, res, next) => {
    try {
        let token;

        if (
            req.headers.authorization &&
            req.headers.authorization.startsWith("Bearer ")
        ) {
            token = req.headers.authorization.split(" ")[1];
        }

        if (!token) {
            return next();
        }

        let decoded;
        try {
            decoded = jwt.verify(token, process.env.JWT_SECRET);
        } catch (jwtError) {
            return next();
        }

        let isBlacklisted = false;
        try {
            isBlacklisted = await redisClient.get(`blacklist:${token}`);
        } catch (redisError) {
            // Redis unavailable — skip blacklist check
        }
        if (isBlacklisted) {
            return next();
        }

        let user;
        const cacheKey = `user:${decoded.id}`;

        try {
            const cached = await redisClient.get(cacheKey);
            if (cached) {
                user = JSON.parse(cached);
                user = new User(user);
                user.isNew = false;
            }
        } catch (redisError) {
            // Redis unavailable — fall through to DB
        }

        if (!user) {
            user = await User.findById(decoded.id);
        }

        if (user) {
            req.user = user;
            req.decoded = decoded;
        }

        next();
    } catch (error) {
        next();
    }
};

module.exports = optionalAuth;
