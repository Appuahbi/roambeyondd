const express = require("express");
const router = express.Router();

const adminNotificationController = require("../controllers/adminNotificationController");
const protect = require("../middlewares/protect");
const authorize = require("../middlewares/authorize");

router.use(protect, authorize("admin"));

router.get("/", adminNotificationController.listAllNotifications);
router.post("/broadcast", adminNotificationController.broadcastNotification);
router.delete("/:id", adminNotificationController.deleteNotification);

module.exports = router;
