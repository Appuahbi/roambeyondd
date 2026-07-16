const User = require("../models/User");
const crypto = require("crypto");
const AppError = require("../utils/AppError");
const { redisClient } = require("../config/redis");
const logger = require("../config/logger");
const { sendPasswordResetEmail, sendVerificationEmail } = require("./emailService");

const registerUser = async (userData) => {

    // Check if email already exists
    const existingUser = await User.findOne({
        email: userData.email
    });

    if (existingUser) {
        throw new AppError(
            "Email is already registered",
            409
        );
    }

    // Create user
    const user = await User.create({
        name: userData.name,
        email: userData.email,
        phone: userData.phone,
        password: userData.password,
        role: "user"
    });

    // Generate JWT
    const token = user.generateAuthToken();

    // Send verification email
    const rawVerifyToken = crypto.randomBytes(32).toString("hex");
    const hashedVerifyToken = crypto.createHash("sha256").update(rawVerifyToken).digest("hex");

    try {
        await redisClient.setEx(
            `verify:${hashedVerifyToken}`,
            86400,
            user._id.toString()
        );
        await sendVerificationEmail(user, rawVerifyToken);
    } catch (err) {
        logger.warn({ err }, "Failed to send verification email during registration");
    }

    // Return only the fields we want the frontend to see
    return {
        token,
        user: {
            id: user._id,
            name: user.name,
            email: user.email,
            phone: user.phone,
            role: user.role,
            avatar: user.avatar,
            isVerified: user.isVerified
        }
    };
};

const loginUser = async (loginData) => {

    // Find user by email and include password
    const user = await User.findOne({
        email: loginData.email
    }).select("+password");

    // User not found
    if (!user) {
        throw new AppError(
            "Invalid email or password",
            401
        );
    }

    // Compare password
    const isPasswordCorrect = await user.comparePassword(
        loginData.password
    );

    if (!isPasswordCorrect) {
        throw new AppError(
            "Invalid email or password",
            401
        );
    }

    // Generate JWT
    const token = user.generateAuthToken();

    return {
        token,
        user: {
            id: user._id,
            name: user.name,
            email: user.email,
            phone: user.phone,
            role: user.role,
            avatar: user.avatar,
            isVerified: user.isVerified
        }
    };
};

const changePasswordUser = async (userId, currentPassword, newPassword) => {
    const user = await User.findById(userId).select("+password");

    if (!user) {
        throw new AppError("User not found", 404);
    }

    const isPasswordCorrect = await user.comparePassword(currentPassword);

    if (!isPasswordCorrect) {
        throw new AppError("Current password is incorrect", 401);
    }

    user.password = newPassword;
    user.passwordChangedAt = new Date();
    await user.save();

    // Invalidate cached user so next request re-fetches from DB
    try {
        await redisClient.del(`user:${userId}`);
    } catch (err) {
        logger.warn({ err }, "Failed to invalidate user cache on password change");
    }

    return { message: "Password changed successfully" };
};

const logoutUser = async (token, decoded) => {
    const ttl = decoded.exp - Math.floor(Date.now() / 1000);

    if (ttl > 0) {
        try {
            await redisClient.setEx(`blacklist:${token}`, ttl, "true");
        } catch (err) {
            logger.warn({ err }, "Redis unavailable, token blacklist skipped");
        }
    }

    // Invalidate cached user so next login re-fetches fresh data
    try {
        await redisClient.del(`user:${decoded.id}`);
    } catch (err) {
        logger.warn({ err }, "Failed to invalidate user cache on logout");
    }

    return { message: "Logged out successfully" };
};

const forgotPasswordUser = async (email) => {
    const user = await User.findOne({ email });

    if (!user) {
        return { message: "Password reset email sent" };
    }

    const rawToken = crypto.randomBytes(32).toString("hex");
    const hashedToken = crypto.createHash("sha256").update(rawToken).digest("hex");

    try {
        await redisClient.setEx(
            `reset:${hashedToken}`,
            900,
            user._id.toString()
        );
    } catch (err) {
        logger.warn({ err }, "Redis unavailable, cannot store reset token");
        throw new AppError("Service temporarily unavailable. Please try again later.", 503);
    }

    try {
        await sendPasswordResetEmail(user, rawToken);
    } catch (err) {
        logger.warn({ err }, "Failed to send password reset email");
        throw new AppError("Failed to send reset email. Please try again later.", 500);
    }

    return { message: "Password reset email sent" };
};

const resetPasswordUser = async (token, newPassword) => {
    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

    let userId;
    try {
        userId = await redisClient.get(`reset:${hashedToken}`);
    } catch (err) {
        logger.warn({ err }, "Redis unavailable, cannot verify reset token");
        throw new AppError("Service temporarily unavailable. Please try again later.", 503);
    }

    if (!userId) {
        throw new AppError("Invalid or expired reset token", 400);
    }

    const user = await User.findById(userId).select("+password");

    if (!user) {
        throw new AppError("User not found", 404);
    }

    user.password = newPassword;
    user.passwordChangedAt = new Date();
    await user.save();

    try {
        await redisClient.del(`reset:${hashedToken}`);
        await redisClient.del(`user:${userId}`);
    } catch (err) {
        logger.warn({ err }, "Failed to clean up after password reset");
    }

    return { message: "Password reset successful" };
};

const verifyEmailUser = async (token) => {
    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

    let userId;
    try {
        userId = await redisClient.get(`verify:${hashedToken}`);
    } catch (err) {
        logger.warn({ err }, "Redis unavailable, cannot verify email token");
        throw new AppError("Service temporarily unavailable. Please try again later.", 503);
    }

    if (!userId) {
        throw new AppError("Invalid or expired verification token", 400);
    }

    const user = await User.findById(userId);

    if (!user) {
        throw new AppError("User not found", 404);
    }

    if (user.isVerified) {
        try {
            await redisClient.del(`verify:${hashedToken}`);
        } catch (err) {
            // ignore cleanup error
        }
        return { message: "Email already verified" };
    }

    user.isVerified = true;
    await user.save();

    try {
        await redisClient.del(`verify:${hashedToken}`);
        await redisClient.del(`user:${userId}`);
    } catch (err) {
        logger.warn({ err }, "Failed to clean up after email verification");
    }

    return { message: "Email verified successfully" };
};

const resendVerificationUser = async (userId) => {
    const user = await User.findById(userId);

    if (!user) {
        throw new AppError("User not found", 404);
    }

    if (user.isVerified) {
        return { message: "Email already verified" };
    }

    // Invalidate any existing verification tokens for this user
    // TODO: Consider per-user Redis Set (verify:user:{userId}) for large scale
    try {
        for await (const key of redisClient.scanIterator({ MATCH: "verify:*", COUNT: 100 })) {
            const storedUserId = await redisClient.get(key);
            if (storedUserId === userId.toString()) {
                await redisClient.del(key);
            }
        }
    } catch (err) {
        logger.warn({ err }, "Failed to clear old verification tokens");
    }

    const rawToken = crypto.randomBytes(32).toString("hex");
    const hashedToken = crypto.createHash("sha256").update(rawToken).digest("hex");

    try {
        await redisClient.setEx(
            `verify:${hashedToken}`,
            86400,
            user._id.toString()
        );
    } catch (err) {
        logger.warn({ err }, "Redis unavailable, cannot store verification token");
        throw new AppError("Service temporarily unavailable. Please try again later.", 503);
    }

    try {
        await sendVerificationEmail(user, rawToken);
    } catch (err) {
        logger.warn({ err }, "Failed to send verification email");
        throw new AppError("Failed to send verification email. Please try again later.", 500);
    }

    return { message: "Verification email sent" };
};

module.exports = {
    registerUser,
    loginUser,
    changePasswordUser,
    logoutUser,
    forgotPasswordUser,
    resetPasswordUser,
    verifyEmailUser,
    resendVerificationUser
};