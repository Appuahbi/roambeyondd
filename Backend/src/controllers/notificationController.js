const Notification = require("../models/Notification");
const asyncHandler = require("../middlewares/asyncHandler");

const getNotifications = asyncHandler(async (req, res) => {
    const { page = "1", limit = "20" } = req.query || {};
    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.min(50, parseInt(limit, 10) || 20);
    const skip = (pageNum - 1) * limitNum;

    const [notifications, total] = await Promise.all([
        Notification.find({ user: req.user.id })
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limitNum)
            .lean(),
        Notification.countDocuments({ user: req.user.id })
    ]);

    return res.json({
        success: true,
        data: { notifications, pagination: { total, page: pageNum, totalPages: Math.ceil(total / limitNum) } }
    });
});

const getUnreadCount = asyncHandler(async (req, res) => {
    const count = await Notification.countDocuments({ user: req.user.id, isRead: false });
    return res.json({ success: true, data: { count } });
});

const markAsRead = asyncHandler(async (req, res) => {
    const notification = await Notification.findOneAndUpdate(
        { _id: req.params.id, user: req.user.id },
        { isRead: true, readAt: new Date() },
        { new: true }
    );
    if (!notification) return res.status(404).json({ success: false, message: "Not found" });
    return res.json({ success: true, data: notification });
});

const markAllAsRead = asyncHandler(async (req, res) => {
    await Notification.updateMany(
        { user: req.user.id, isRead: false },
        { isRead: true, readAt: new Date() }
    );
    return res.json({ success: true, message: "All notifications marked as read" });
});

module.exports = { getNotifications, getUnreadCount, markAsRead, markAllAsRead };
