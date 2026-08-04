const express = require("express");

const router = express.Router();

const homeController = require("../controllers/homeController");

const authRoutes = require("./authRoutes");

const packageRoutes = require("./packageRoutes");

const enquiryRoutes = require("./enquiryRoutes");

const adminRoutes = require("./adminRoutes");

const dashboardRoutes = require("./dashboardRoutes");

const contactRequestRoutes = require("./contactRequestRoutes");

const blogRoutes = require("./blogRoutes");

const newsletterRoutes = require("./newsletterRoutes");

const adminUserRoutes = require("./adminUserRoutes");

const adminNewsletterRoutes = require("./adminNewsletterRoutes");

const statsRoutes = require("./statsRoutes");

const searchRoutes = require("./searchRoutes");

const destinationRoutes = require("./destinationRoutes");

const categoryRoutes = require("./categoryRoutes");

const reviewRoutes = require("./reviewRoutes");

const wishlistRoutes = require("./wishlistRoutes");

const tripRequestRoutes = require("./tripRequestRoutes");

const notificationRoutes = require("./notificationRoutes");

const siteContentRoutes = require("./siteContentRoutes");

const categoryAdminRoutes = require("./categoryAdminRoutes");

const adminNotificationRoutes = require("./adminNotificationRoutes");

const chatRoutes = require("./chatRoutes");

router.get("/", homeController.home);

router.use("/auth", authRoutes);

router.use("/packages", packageRoutes);

router.use("/enquiries", enquiryRoutes);

router.use("/admin/dashboard", dashboardRoutes);

router.use("/admin/users", adminUserRoutes);

router.use("/admin/newsletter", adminNewsletterRoutes);

router.use("/admin", adminRoutes);

router.use("/contact", contactRequestRoutes);

router.use("/blogs", blogRoutes);

router.use("/newsletter", newsletterRoutes);

router.use("/stats", statsRoutes);

router.use("/search", searchRoutes);

router.use("/destinations", destinationRoutes);

router.use("/categories", categoryRoutes);

router.use("/reviews", reviewRoutes);

router.use("/wishlist", wishlistRoutes);

router.use("/trip-requests", tripRequestRoutes);

router.use("/notifications", notificationRoutes);

router.use("/site-content", siteContentRoutes);

router.use("/admin/categories", categoryAdminRoutes);

router.use("/admin/notifications", adminNotificationRoutes);

router.use("/chat", chatRoutes);

module.exports = router;
