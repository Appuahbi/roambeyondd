const express = require("express");
const router = express.Router();
const reviewController = require("../controllers/reviewController");
const protect = require("../middlewares/protect");
const authorize = require("../middlewares/authorize");
const validate = require("../middlewares/validate");
const { createReviewSchema, getReviewsSchema, adminUpdateReviewSchema, deleteReviewSchema } = require("../validations/reviewValidation");

router.get("/admin", protect, authorize("admin"), reviewController.getAllReviews);
router.get("/admin/:slug/reviews", protect, authorize("admin"), validate(getReviewsSchema), reviewController.getReviewsByPackagePreview);
router.patch("/admin/:id", protect, authorize("admin"), validate(adminUpdateReviewSchema), reviewController.updateReviewStatus);

router.get("/:slug/reviews", validate(getReviewsSchema), reviewController.getReviewsByPackage);
router.post("/:slug/reviews", protect, validate(createReviewSchema), reviewController.createReview);

router.delete("/:id", protect, validate(deleteReviewSchema), reviewController.deleteReview);

module.exports = router;
