const express = require("express");

const router = express.Router();

const homeController = require("../controllers/homeController");

const enquiryRoutes = require("./enquiryRoutes");

const adminRoutes = require("./adminRoutes");

const dashboardRoutes = require("./dashboardRoutes");

const contactRequestRoutes = require("./contactRequestRoutes");

router.get("/", homeController.home);

router.use("/enquiries", enquiryRoutes);

router.use("/admin", adminRoutes);

router.use(
    "/admin/dashboard",
    dashboardRoutes
);

router.use(
    "/contact",
    contactRequestRoutes
);

module.exports = router;