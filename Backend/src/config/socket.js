const { Server } = require("socket.io");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const { redisClient } = require("./redis");
const { AUTH_COOKIE_NAME } = require("../utils/authCookie");
const logger = require("./logger");

let io;

const parseCookieToken = (cookieHeader) => {
    if (!cookieHeader) return null;
    const match = cookieHeader.match(new RegExp(`(?:^|;\\s*)${AUTH_COOKIE_NAME}=([^;]+)`));
    return match ? decodeURIComponent(match[1]) : null;
};

const initSocket = (httpServer) => {
    io = new Server(httpServer, {
        cors: {
            origin: process.env.CORS_ORIGIN || "http://localhost:3000",
            credentials: true,
            methods: ["GET", "POST"]
        },
        pingInterval: 25000,
        pingTimeout: 20000
    });

    io.use(async (socket, next) => {
        try {
            const token =
                socket.handshake.auth?.token ||
                parseCookieToken(socket.handshake.headers?.cookie);

            if (!token) {
                return next(new Error("Authentication required"));
            }

            // Reject blacklisted (logged out) tokens
            try {
                const isBlacklisted = await redisClient.get(`blacklist:${token}`);
                if (isBlacklisted) {
                    return next(new Error("Token has been invalidated"));
                }
            } catch (err) {
                logger.warn({ err }, "Redis unavailable — skip socket blacklist check");
            }

            let decoded;
            try {
                decoded = jwt.verify(token, process.env.JWT_SECRET);
            } catch (err) {
                return next(new Error("Invalid or expired token"));
            }

            const user = await User.findById(decoded.id).select(
                "_id name email role passwordChangedAt"
            );
            if (!user) {
                return next(new Error("User not found"));
            }

            // Reject tokens issued before the last password change
            if (user.passwordChangedAt && decoded.iat) {
                const changedTimestamp = Math.floor(
                    user.passwordChangedAt.getTime() / 1000
                );
                if (decoded.iat < changedTimestamp) {
                    return next(new Error("Token has been invalidated"));
                }
            }

            socket.user = user;
            next();
        } catch (err) {
            next(err);
        }
    });

    io.on("connection", (socket) => {
        const room = `user:${socket.user._id}`;
        socket.join(room);
        logger.info(`Socket connected: ${socket.user.email} (socket=${socket.id})`);

        socket.on("disconnect", (reason) => {
            logger.info(`Socket disconnected: ${socket.user.email} reason=${reason}`);
        });
    });

    return io;
};

const getIO = () => {
    if (!io) throw new Error("Socket.io not initialized. Call initSocket() first.");
    return io;
};

const emitToUser = (userId, event, payload) => {
    if (!io) return;
    io.to(`user:${userId}`).emit(event, payload);
};

module.exports = { initSocket, getIO, emitToUser };
