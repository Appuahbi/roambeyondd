const express = require("express");
const router = express.Router();
const tripRequestController = require("../controllers/tripRequestController");
const protect = require("../middlewares/protect");
const authorize = require("../middlewares/authorize");
const validate = require("../middlewares/validate");
const { createTripRequestSchema, adminUpdateTripRequestSchema, adminDeleteTripRequestSchema } = require("../validations/tripRequestValidation");

router.post("/", protect, validate(createTripRequestSchema), tripRequestController.createTripRequest);
router.get("/", protect, tripRequestController.getMyTripRequests);
router.get("/admin", protect, authorize("admin"), tripRequestController.getAllTripRequests);
router.get("/:id", protect, tripRequestController.getTripRequestById);
router.patch("/admin/:id", protect, authorize("admin"), validate(adminUpdateTripRequestSchema), tripRequestController.updateTripRequest);
router.delete("/admin/:id", protect, authorize("admin"), validate(adminDeleteTripRequestSchema), tripRequestController.deleteTripRequest);

module.exports = router;
