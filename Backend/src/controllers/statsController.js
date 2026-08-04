const TourPackage = require("../models/TourPackage");
const Blog = require("../models/Blog");
const { successResponse } = require("../utils/apiResponse");
const asyncHandler = require("../middlewares/asyncHandler");
const { redisClient } = require("../config/redis");
const logger = require("../config/logger");

const getPublicStats = asyncHandler(async (req, res) => {
    const cacheKey = "stats:public";

    try {
        const cached = await redisClient.get(cacheKey);
        if (cached) {
            return successResponse(res, JSON.parse(cached), "Stats fetched successfully");
        }
    } catch (err) {
        logger.warn({ err }, "Redis read failed");
    }

    const [packagesCount, destinationsResult, ratingResult, blogCount] = await Promise.all([
        TourPackage.countDocuments({ isActive: true }),
        TourPackage.distinct("destination", { isActive: true }),
        TourPackage.aggregate([
            { $match: { isActive: true, rating: { $gt: 0 } } },
            { $group: { _id: null, avg: { $avg: "$rating" } } }
        ]),
        Blog.countDocuments({ status: "published" })
    ]);

    const stats = {
        packagesCount,
        destinationsCount: destinationsResult.length,
        statesCount: destinationsResult.length,
        averageRating: ratingResult.length > 0 ? Math.round(ratingResult[0].avg * 10) / 10 : 0,
        blogCount
    };

    try {
        await redisClient.set(cacheKey, JSON.stringify(stats), { EX: 3600 });
    } catch (err) {
        logger.warn({ err }, "Redis write failed");
    }

    return successResponse(res, stats, "Stats fetched successfully");
});

module.exports = { getPublicStats };
