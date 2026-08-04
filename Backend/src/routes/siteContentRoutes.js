const express = require("express");
const router = express.Router();
const siteContentController = require("../controllers/siteContentController");
const protect = require("../middlewares/protect");
const authorize = require("../middlewares/authorize");

router.get("/admin", protect, authorize("admin"), siteContentController.getAllSiteContent);
router.put("/admin/:section", protect, authorize("admin"), siteContentController.updateSiteContent);
router.get("/:section", siteContentController.getSiteContent);

module.exports = router;
