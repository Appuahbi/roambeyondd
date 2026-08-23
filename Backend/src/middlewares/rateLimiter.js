const rateLimit = require("express-rate-limit");

const isDev = process.env.NODE_ENV === "development";

const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: isDev ? 10000 : 100,
    skip: () => isDev,
    message: {
        success: false,
        message: "Too many requests. Try again later.",
    },
});

const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: isDev ? 10000 : 10,
    skip: () => isDev,
    message: {
        success: false,
        message: "Too many authentication attempts. Try again later.",
    },
});

const forgotPasswordLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: isDev ? 10000 : 5,
    skip: () => isDev,
    message: {
        success: false,
        message: "Too many requests. Please try again later.",
    },
});

const otpLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: isDev ? 10000 : 10,
    skip: () => isDev,
    message: {
        success: false,
        message: "Too many OTP requests. Please try again later.",
    },
});

module.exports = limiter;
module.exports.authLimiter = authLimiter;
module.exports.forgotPasswordLimiter = forgotPasswordLimiter;
module.exports.otpLimiter = otpLimiter;
