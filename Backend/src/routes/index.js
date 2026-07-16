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

router.get("/", homeController.home);

router.use("/auth", authRoutes);

router.use("/packages", packageRoutes);

router.use("/enquiries", enquiryRoutes);

router.use("/admin/dashboard", dashboardRoutes);

router.use("/admin", adminRoutes);

router.use("/contact", contactRequestRoutes);

router.use("/blogs", blogRoutes);

module.exports = router;
