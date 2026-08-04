const User = require("../models/User");
const { successResponse } = require("../utils/apiResponse");
const AppError = require("../utils/AppError");
const asyncHandler = require("../middlewares/asyncHandler");
const { redisClient } = require("../config/redis");
const logger = require("../config/logger");

const invalidateUserCache = async (userId) => {
    try {
        await redisClient.del(`user:${userId}`);
    } catch (err) {
        logger.warn({ err }, "Redis cache clear failed");
    }
};

const getAllUsers = asyncHandler(async (req, res) => {
    const {
        page = "1",
        limit = "20",
        search,
        role
    } = req.query || {};

    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10) || 20));
    const skip = (pageNum - 1) * limitNum;

    const filter = {};

    if (role) {
        filter.role = role;
    }

    if (search) {
        const escaped = search.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
        filter.$or = [
            { name: { $regex: escaped, $options: "i" } },
            { email: { $regex: escaped, $options: "i" } }
        ];
    }

    const [users, total] = await Promise.all([
        User.find(filter)
            .select("-password -passwordChangedAt")
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limitNum)
            .lean(),
        User.countDocuments(filter)
    ]);

    return successResponse(
        res,
        {
            total,
            page: pageNum,
            totalPages: Math.ceil(total / limitNum),
            users
        },
        "Users fetched successfully"
    );
});

const getUserById = asyncHandler(async (req, res) => {
    const user = await User.findById(req.params.id)
        .select("-password -passwordChangedAt")
        .lean();

    if (!user) {
        throw new AppError("User not found", 404);
    }

    return successResponse(
        res,
        user,
        "User fetched successfully"
    );
});

const createUser = asyncHandler(async (req, res) => {
    const { name, email, phone, password, role } = req.body;

    const existing = await User.findOne({ email });
    if (existing) {
        throw new AppError("A user with this email already exists", 409);
    }

    const user = await User.create({ name, email, phone, password, role });
    const { password: _pw, passwordChangedAt: _pca, ...safeUser } = user.toObject({ versionKey: false });

    return successResponse(
        res,
        safeUser,
        "User created successfully",
        201
    );
});

const deleteUser = asyncHandler(async (req, res) => {
    const { id } = req.params;

    if (id === req.user.id) {
        throw new AppError("You cannot delete your own account", 400);
    }

    const user = await User.findByIdAndDelete(id);

    if (!user) {
        throw new AppError("User not found", 404);
    }

    await invalidateUserCache(id);

    return successResponse(
        res,
        null,
        "User deleted successfully"
    );
});

const updateUserRole = asyncHandler(async (req, res) => {
    const { role } = req.body;
    const { id } = req.params;

    if (id === req.user.id) {
        throw new AppError("You cannot change your own role", 400);
    }

    const user = await User.findByIdAndUpdate(
        id,
        { role },
        { new: true, runValidators: true }
    ).select("-password -passwordChangedAt");

    if (!user) {
        throw new AppError("User not found", 404);
    }

    await invalidateUserCache(id);

    return successResponse(
        res,
        user,
        `User role updated to ${role} successfully`
    );
});

module.exports = {
    getAllUsers,
    getUserById,
    updateUserRole,
    createUser,
    deleteUser
};
