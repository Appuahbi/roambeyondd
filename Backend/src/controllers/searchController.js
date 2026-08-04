const TourPackage = require("../models/TourPackage");
const Blog = require("../models/Blog");
const { successResponse } = require("../utils/apiResponse");
const asyncHandler = require("../middlewares/asyncHandler");

const search = asyncHandler(async (req, res) => {
    const { q } = req.query;

    if (!q || q.trim().length === 0) {
        return successResponse(res, { packages: [], blogs: [] }, "Search results");
    }

    const searchQuery = q.trim();

    // $text uses the existing text indexes instead of a full collection scan
    const [packages, blogs] = await Promise.all([
        TourPackage.find({
            isActive: true,
            $text: { $search: searchQuery }
        })
            .limit(8)
            .select("title slug destination price discountPrice images rating category duration")
            .lean(),
        Blog.find({
            status: "published",
            $text: { $search: searchQuery }
        })
            .limit(8)
            .select("title slug category featuredImage excerpt createdAt")
            .lean()
    ]);

    return successResponse(
        res,
        { packages, blogs },
        "Search results"
    );
});

module.exports = { search };
