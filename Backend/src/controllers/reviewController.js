const Review = require("../models/Review");
const TourPackage = require("../models/TourPackage");
const AppError = require("../utils/AppError");
const asyncHandler = require("../middlewares/asyncHandler");
const { clearPackageCache } = require("../utils/cache");
const { clearDashboardCache } = require("../services/dashboardService");

const createReview = asyncHandler(async (req, res) => {
    const { slug } = req.params;
    const { rating, title, comment } = req.body;
    const userId = req.user.id;

    const tourPackage = await TourPackage.findOne({ slug, isActive: true });
    if (!tourPackage) throw new AppError("Package not found", 404);

    const existing = await Review.findOne({ user: userId, tourPackage: tourPackage._id });
    if (existing) throw new AppError("You have already reviewed this package", 409);

    const review = await Review.create({
        user: userId,
        tourPackage: tourPackage._id,
        rating,
        title,
        comment,
        status: "pending"
    });

    await clearDashboardCache();

    return res.status(201).json({
        success: true,
        message: "Review submitted successfully. It will appear after admin approval.",
        data: review
    });
});

const fetchPackageReviews = async (slug, query, { includeInactive = false } = {}) => {
    const { page = "1", limit = "10", sort = "newest" } = query || {};

    const packageFilter = { slug };
    if (!includeInactive) packageFilter.isActive = true;
    const tourPackage = await TourPackage.findOne(packageFilter);
    if (!tourPackage) throw new AppError("Package not found", 404);

    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.min(50, parseInt(limit, 10) || 10);
    const skip = (pageNum - 1) * limitNum;

    const sortOptions = {};
    if (sort === "highest") sortOptions.rating = -1;
    else if (sort === "lowest") sortOptions.rating = 1;
    else sortOptions.createdAt = -1;

    const [reviews, total] = await Promise.all([
        Review.find({ tourPackage: tourPackage._id, status: "approved" })
            .populate("user", "name")
            .sort(sortOptions)
            .skip(skip)
            .limit(limitNum)
            .lean(),
        Review.countDocuments({ tourPackage: tourPackage._id, status: "approved" })
    ]);

    return {
        reviews,
        pagination: { total, page: pageNum, totalPages: Math.ceil(total / limitNum) }
    };
};

const getReviewsByPackage = asyncHandler(async (req, res) => {
    const data = await fetchPackageReviews(req.params.slug, req.query);
    return res.json({ success: true, data });
});

const getReviewsByPackagePreview = asyncHandler(async (req, res) => {
    const data = await fetchPackageReviews(req.params.slug, req.query, { includeInactive: true });
    return res.json({ success: true, data });
});

const getAllReviews = asyncHandler(async (req, res) => {
    const { page = "1", limit = "20", status, sort = "newest" } = req.query || {};

    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.min(100, parseInt(limit, 10) || 20);
    const skip = (pageNum - 1) * limitNum;

    const filter = {};
    if (status) filter.status = status;

    const [reviews, total] = await Promise.all([
        Review.find(filter)
            .populate("user", "name email")
            .populate("tourPackage", "title slug")
            .sort(sort === "oldest" ? { createdAt: 1 } : { createdAt: -1 })
            .skip(skip)
            .limit(limitNum)
            .lean(),
        Review.countDocuments(filter)
    ]);

    return res.json({
        success: true,
        data: {
            reviews,
            pagination: { total, page: pageNum, totalPages: Math.ceil(total / limitNum) }
        }
    });
});

const computePackageRating = async (packageId) => {
    const stats = await Review.aggregate([
        { $match: { tourPackage: packageId, status: "approved" } },
        { $group: { _id: null, avg: { $avg: "$rating" }, count: { $sum: 1 } } }
    ]);

    const avgRating = stats[0]
        ? Math.round(stats[0].avg * 10) / 10
        : 0;
    const reviewsCount = stats[0] ? stats[0].count : 0;

    await TourPackage.findByIdAndUpdate(packageId, {
        rating: avgRating,
        reviewsCount
    });
};

const updateReviewStatus = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { status, adminReply } = req.body;

    const review = await Review.findByIdAndUpdate(
        id,
        { status, ...(adminReply !== undefined && { adminReply }) },
        { new: true, runValidators: true }
    ).populate("user", "name email").populate("tourPackage", "title slug");

    if (!review) throw new AppError("Review not found", 404);

    if (status === "approved" || status === "rejected") {
        await computePackageRating(review.tourPackage._id);
        await clearPackageCache();
    }

    await clearDashboardCache();

    return res.json({
        success: true,
        message: `Review ${status} successfully`,
        data: review
    });
});

const deleteReview = asyncHandler(async (req, res) => {
    const { id } = req.params;

    const review = await Review.findById(id);
    if (!review) throw new AppError("Review not found", 404);

    if (review.user.toString() !== req.user.id && req.user.role !== "admin") {
        throw new AppError("Not authorized to delete this review", 403);
    }

    const packageId = review.tourPackage;
    await Review.findByIdAndDelete(id);

    await computePackageRating(packageId);

    await clearPackageCache();
    await clearDashboardCache();

    return res.json({ success: true, message: "Review deleted successfully" });
});

module.exports = {
    createReview,
    getReviewsByPackage,
    getReviewsByPackagePreview,
    getAllReviews,
    updateReviewStatus,
    deleteReview
};
