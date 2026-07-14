const express = require("express");

const router = express.Router();

const dashboardController = require("../controllers/dashboardController");

const protect = require("../middlewares/protect");

const authorize = require("../middlewares/authorize");

router.get(

    "/",

    protect,

    authorize("admin"),

    dashboardController.getDashboardStats

);

module.exports = router;