const TourPackage = require("../models/TourPackage");
const Blog = require("../models/Blog");
const Category = require("../models/Category");
const { successResponse } = require("../utils/apiResponse");
const asyncHandler = require("../middlewares/asyncHandler");

const CATEGORY_META = {
    "Domestic Tours": { description: "Discover the rich heritage and diverse culture of incredible India.", highlights: ["Heritage sites", "Cultural immersion", "City tours", "Food trails"] },
    "Trekking Expeditions": { description: "Challenge yourself with breathtaking treks through majestic mountains.", highlights: ["Himalayan trails", "Camping", "Summit treks", "Nature walks"] },
    "Group Tours": { description: "Travel with friends, family, or like-minded adventurers.", highlights: ["Family trips", "Friends getaway", "Social travel", "Group discounts"] },
    "Honeymoon Packages": { description: "Begin your journey together in the most romantic settings.", highlights: ["Romantic stays", "Private experiences", "Scenic routes", "Couples activities"] },
    "Corporate Tours": { description: "Build stronger teams through unforgettable travel experiences.", highlights: ["Team building", "Conference venues", "Luxury stays", "Activity planning"] }
};

const getCategories = asyncHandler(async (req, res) => {
    // Try fetching from Category model first
    const dbCategories = await Category.find({ type: "package", isActive: true }).sort({ sortOrder: 1, name: 1 }).lean();

    if (dbCategories.length > 0) {
        // Enrich with package counts
        const enriched = await Promise.all(dbCategories.map(async (cat) => {
            const count = await TourPackage.countDocuments({ category: cat.name, isActive: true });
            return { ...cat, packageCount: count };
        }));
        return successResponse(res, enriched, "Categories fetched successfully");
    }

    // Fallback: aggregate from packages (legacy)
    const result = await TourPackage.aggregate([
        { $match: { isActive: true } },
        { $group: { _id: "$category", count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $project: { name: "$_id", _id: 0, packageCount: "$count" } }
    ]);

    const enriched = result.map((cat) => ({
        ...cat,
        description: CATEGORY_META[cat.name]?.description || "",
        highlights: CATEGORY_META[cat.name]?.highlights || []
    }));

    return successResponse(res, enriched, "Categories fetched successfully");
});

const getBlogCategories = asyncHandler(async (req, res) => {
    // Try fetching from Category model first
    const dbCategories = await Category.find({ type: "blog", isActive: true }).sort({ sortOrder: 1, name: 1 }).lean();

    if (dbCategories.length > 0) {
        const enriched = await Promise.all(dbCategories.map(async (cat) => {
            const count = await Blog.countDocuments({ category: cat.name, status: "published" });
            return { ...cat, count };
        }));
        return successResponse(res, enriched, "Blog categories fetched");
    }

    // Fallback
    const result = await Blog.aggregate([
        { $match: { status: "published" } },
        { $group: { _id: "$category", count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $project: { name: "$_id", _id: 0, count: 1 } }
    ]);

    return successResponse(res, result, "Blog categories fetched");
});

module.exports = { getCategories, getBlogCategories };
