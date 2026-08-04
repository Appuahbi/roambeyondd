const Notification = require("../models/Notification");
const User = require("../models/User");
const { successResponse } = require("../utils/apiResponse");
const AppError = require("../utils/AppError");
const asyncHandler = require("../middlewares/asyncHandler");
const { notifyMultiple } = require("../utils/notify");

/*
|--------------------------------------------------------------------------
| GET /api/admin/notifications
| List all notifications (most recent first), with light filters.
|--------------------------------------------------------------------------
*/
const listAllNotifications = asyncHandler(async (req, res) => {
    const {
        page = "1",
        limit = "20",
        type,
        userId
    } = req.query || {};

    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10) || 20));
    const skip = (pageNum - 1) * limitNum;

    const filter = {};
    if (type) filter.type = type;
    if (userId) filter.user = userId;

    const [notifications, total] = await Promise.all([
        Notification.find(filter)
            .populate("user", "name email role")
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limitNum)
            .lean(),
        Notification.countDocuments(filter)
    ]);

    return successResponse(
        res,
        {
            total,
            page: pageNum,
            totalPages: Math.ceil(total / limitNum),
            notifications
        },
        "Notifications fetched successfully"
    );
});

/*
|--------------------------------------------------------------------------
| POST /api/admin/notifications/broadcast
| Send a notification to all users, or to a single role, or to one user.
| body: { title, message, type?, audience?: "all" | "admins" | "users" | { userId } }
|--------------------------------------------------------------------------
*/
const broadcastNotification = asyncHandler(async (req, res) => {
    const { title, message, type = "system", audience = "all" } = req.body || {};

    if (!title || !message) {
        throw new AppError("Title and message are required", 400);
    }

    let userFilter = {};
    if (audience === "admins") userFilter = { role: "admin" };
    else if (audience === "users") userFilter = { role: "user" };
    else if (audience && typeof audience === "object" && audience.userId) {
        userFilter = { _id: audience.userId };
    }

    const users = await User.find(userFilter).select("_id").lean();
    if (users.length === 0) {
        throw new AppError("No users match the audience", 400);
    }

    const inserted = await notifyMultiple(
        users.map((u) => u._id),
        { type, title, message }
    );

    return successResponse(
        res,
        { sent: inserted.length, audience },
        `Notification sent to ${inserted.length} user(s)`
    );
});

/*
|--------------------------------------------------------------------------
| DELETE /api/admin/notifications/:id
| Remove a notification (any user's).
|--------------------------------------------------------------------------
*/
const deleteNotification = asyncHandler(async (req, res) => {
    const n = await Notification.findByIdAndDelete(req.params.id);
    if (!n) throw new AppError("Notification not found", 404);
    return successResponse(res, null, "Notification deleted");
});

module.exports = {
    listAllNotifications,
    broadcastNotification,
    deleteNotification
};
