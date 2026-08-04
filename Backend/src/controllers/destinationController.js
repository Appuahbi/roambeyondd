const TourPackage = require("../models/TourPackage");
const { successResponse } = require("../utils/apiResponse");
const asyncHandler = require("../middlewares/asyncHandler");

const DESTINATION_META = {
    "Goa": { tagline: "Sun, Sand & Sea", description: "India's smallest state packs a punch with pristine beaches, vibrant nightlife, and Portuguese heritage.", gradient: "from-cyan-500 to-blue-500" },
    "Kerala": { tagline: "God's Own Country", description: "Serene backwaters, lush hill stations, and Ayurvedic retreats make Kerala a wellness paradise.", gradient: "from-emerald-500 to-green-500" },
    "Manali": { tagline: "Valley of Gods", description: "Snow-capped peaks, ancient temples, and adventure sports in the heart of Himachal Pradesh.", gradient: "from-blue-500 to-indigo-500" },
    "Rajasthan": { tagline: "Land of Kings", description: "Majestic palaces, golden deserts, and vibrant culture await in India's largest state.", gradient: "from-amber-500 to-orange-500" },
    "Ladakh": { tagline: "The Roof of the World", description: "Otherworldly landscapes, ancient monasteries, and high-altitude lakes beyond imagination.", gradient: "from-slate-500 to-blue-600" },
    "Andaman": { tagline: "Tropical Paradise", description: "Pristine white-sand beaches, crystal-clear waters, and vibrant coral reefs.", gradient: "from-teal-500 to-cyan-500" },
    "Darjeeling": { tagline: "Queen of Hills", description: "Misty tea gardens, toy train rides, and panoramic views of the Kanchenjunga range.", gradient: "from-green-500 to-emerald-500" },
    "Shimla": { tagline: "Heart of Himachal", description: "Colonial architecture, pine forests, and snow-capped mountains in the former summer capital.", gradient: "from-blue-400 to-indigo-400" },
    "Varanasi": { tagline: "Spiritual Capital", description: "One of the world's oldest cities with sacred ghats, temples, and timeless traditions.", gradient: "from-orange-500 to-red-500" },
    "Udaipur": { tagline: "City of Lakes", description: "Romantic lakeside palaces, art galleries, and the most beautiful city in Rajasthan.", gradient: "from-blue-500 to-purple-500" }
};

const getDestinations = asyncHandler(async (req, res) => {
    const result = await TourPackage.aggregate([
        { $match: { isActive: true } },
        {
            $group: {
                _id: "$destination",
                packageCount: { $sum: 1 },
                avgPrice: { $avg: "$price" },
                minPrice: { $min: "$price" }
            }
        },
        { $sort: { packageCount: -1 } },
        {
            $project: {
                name: "$_id",
                _id: 0,
                packageCount: 1,
                avgPrice: { $round: ["$avgPrice", 0] },
                minPrice: 1
            }
        }
    ]);

    const enriched = result.map((dest) => ({
        ...dest,
        tagline: DESTINATION_META[dest.name]?.tagline || "",
        description: DESTINATION_META[dest.name]?.description || "",
        gradient: DESTINATION_META[dest.name]?.gradient || "from-primary to-secondary"
    }));

    return successResponse(res, enriched, "Destinations fetched successfully");
});

const getTrendingDestinations = asyncHandler(async (req, res) => {
    const limit = Math.min(20, parseInt(req.query.limit, 10) || 10);

    const result = await TourPackage.aggregate([
        { $match: { isActive: true } },
        { $group: { _id: "$destination", count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: limit },
        { $project: { name: "$_id", _id: 0, count: 1 } }
    ]);

    return successResponse(res, result, "Trending destinations fetched");
});

module.exports = { getDestinations, getTrendingDestinations };
