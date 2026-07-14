const User = require("../models/User");
const AppError = require("../utils/AppError");
const { redisClient } = require("../config/redis");
const logger = require("../config/logger");

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

module.exports = {
    registerUser,
    loginUser,
    changePasswordUser,
    logoutUser
};