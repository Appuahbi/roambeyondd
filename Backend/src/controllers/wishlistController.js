const Wishlist = require("../models/Wishlist");
const TourPackage = require("../models/TourPackage");
const AppError = require("../utils/AppError");
const asyncHandler = require("../middlewares/asyncHandler");

const addToWishlist = asyncHandler(async (req, res) => {
    const { packageId } = req.params;
    const userId = req.user.id;

    const pkg = await TourPackage.findOne({ _id: packageId, isActive: true });
    if (!pkg) throw new AppError("Package not found", 404);

    const existing = await Wishlist.findOne({ user: userId, tourPackage: packageId });
    if (existing) {
        return res.json({ success: true, message: "Already in wishlist", data: existing });
    }

    const item = await Wishlist.create({ user: userId, tourPackage: packageId });
    return res.status(201).json({ success: true, message: "Added to wishlist", data: item });
});

const removeFromWishlist = asyncHandler(async (req, res) => {
    const { packageId } = req.params;
    const item = await Wishlist.findOneAndDelete({ user: req.user.id, tourPackage: packageId });
    if (!item) throw new AppError("Not in wishlist", 404);
    return res.json({ success: true, message: "Removed from wishlist" });
});

const getWishlist = asyncHandler(async (req, res) => {
    const items = await Wishlist.find({ user: req.user.id })
        .populate({
            path: "tourPackage",
            select: "title slug destination price discountPrice images rating duration category",
            match: { isActive: true }
        })
        .sort({ createdAt: -1 })
        .lean();
    return res.json({
        success: true,
        data: items.filter((i) => i.tourPackage)
    });
});

const checkWishlist = asyncHandler(async (req, res) => {
    const { packageId } = req.params;
    const item = await Wishlist.findOne({ user: req.user.id, tourPackage: packageId });
    return res.json({ success: true, data: { isInWishlist: !!item } });
});

module.exports = { addToWishlist, removeFromWishlist, getWishlist, checkWishlist };
