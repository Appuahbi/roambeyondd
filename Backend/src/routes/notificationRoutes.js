const express = require("express");
const router = express.Router();
const notificationController = require("../controllers/notificationController");
const protect = require("../middlewares/protect");

router.get("/unread-count", protect, notificationController.getUnreadCount);
router.get("/", protect, notificationController.getNotifications);
router.patch("/read-all", protect, notificationController.markAllAsRead);
router.patch("/:id/read", protect, notificationController.markAsRead);

module.exports = router;
