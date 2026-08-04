const express = require("express");
const router = express.Router();
const { getDestinations, getTrendingDestinations } = require("../controllers/destinationController");

router.get("/", getDestinations);
router.get("/trending", getTrendingDestinations);

module.exports = router;
