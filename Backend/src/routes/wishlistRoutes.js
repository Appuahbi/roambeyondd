const express = require("express");
const router = express.Router();
const wishlistController = require("../controllers/wishlistController");
const protect = require("../middlewares/protect");

router.get("/", protect, wishlistController.getWishlist);
router.post("/:packageId", protect, wishlistController.addToWishlist);
router.delete("/:packageId", protect, wishlistController.removeFromWishlist);
router.get("/check/:packageId", protect, wishlistController.checkWishlist);

module.exports = router;
