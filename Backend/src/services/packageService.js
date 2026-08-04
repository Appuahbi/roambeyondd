const TourPackage = require("../models/TourPackage");
const AppError = require("../utils/AppError");
const pick = require("../utils/pick");
const escapeRegex = require("../utils/sanitizeRegex");
const { redisClient } = require("../config/redis");
const { clearPackageCache } = require("../utils/cache");
const { clearDashboardCache } = require("./dashboardService");
const logger = require("../config/logger");

/*
|--------------------------------------------------------------------------
| Create Package
|--------------------------------------------------------------------------
*/

const createPackage = async (packageData, userId) => {
    const existingPackage = await TourPackage.findOne({
        title: packageData.title
    });

    if (existingPackage) {
        throw new AppError(
            "Tour package with this title already exists",
            409
        );
    }

    const tourPackage = await TourPackage.create({
        ...packageData,
        createdBy: userId
    });

    await clearPackageCache();
    await clearDashboardCache();

    return tourPackage;
};

/*
|--------------------------------------------------------------------------
| Get All Packages (with filtering, search, sort, pagination)
|--------------------------------------------------------------------------
*/

const getPackages = async (query = {}) => {
    const {
        page = "1",
        limit = "12",
        category,
        destination,
        search,
        minPrice,
        maxPrice,
        sort = "newest",
        featured,
        includeInactive
    } = query;

    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.min(50, Math.max(1, parseInt(limit, 10) || 12));
    const skip = (pageNum - 1) * limitNum;

    const filter = {};
    if (includeInactive !== "true") {
        filter.isActive = true;
    }

    if (category) {
        filter.category = category;
    }

    if (destination) {
        filter.destination = { $regex: escapeRegex(destination), $options: "i" };
    }

    if (featured === "true") {
        filter.featured = true;
    }

    if (minPrice || maxPrice) {
        const min = Number(minPrice);
        const max = Number(maxPrice);
        filter.price = {};
        if (Number.isFinite(min) && min > 0) filter.price.$gte = min;
        if (Number.isFinite(max) && max > 0) filter.price.$lte = max;
    }

    if (search) {
        filter.$text = { $search: search };
    }

    const sortOptions = {};
    switch (sort) {
        case "price-asc":
            sortOptions.price = 1;
            break;
        case "price-desc":
            sortOptions.price = -1;
            break;
        case "rating":
            sortOptions.rating = -1;
            break;
        case "popular":
            sortOptions.reviewsCount = -1;
            break;
        case "newest":
        default:
            sortOptions.createdAt = -1;
            break;
    }

    // Build a stable cache key from the parsed query so different
    // filter/sort/page combos get their own cached result.
    const cacheKey = `tour-packages:${JSON.stringify({
        pageNum,
        limitNum,
        filter,
        sortOptions
    })}`;

    try {
        const cached = await redisClient.get(cacheKey);
        if (cached) {
            return JSON.parse(cached);
        }
    } catch (err) {
        logger.warn({ err }, "Redis read failed for packages list");
    }

    const [packages, total] = await Promise.all([
        TourPackage.find(filter)
            .sort(sortOptions)
            .skip(skip)
            .limit(limitNum)
            .lean(),
        TourPackage.countDocuments(filter)
    ]);

    const result = {
        data: packages,
        pagination: {
            total,
            page: pageNum,
            limit: limitNum,
            totalPages: Math.ceil(total / limitNum)
        }
    };

    try {
        await redisClient.set(cacheKey, JSON.stringify(result), { EX: 300 });
    } catch (err) {
        logger.warn({ err }, "Redis write failed for packages list");
    }

    return result;
};

/*
|--------------------------------------------------------------------------
| Get Package By Slug
|--------------------------------------------------------------------------
*/

const getPackageBySlug = async (slug, { includeInactive = false, cache = true } = {}) => {
    const cacheKey = `tour-package:${slug}`;

    if (cache) {
        try {
            const cachedPackage = await redisClient.get(cacheKey);
            if (cachedPackage) {
                return JSON.parse(cachedPackage);
            }
        } catch (err) {
            logger.warn({ err }, "Redis read failed, fetching from DB");
        }
    }

    const tourPackage = await TourPackage.findOne({
        slug,
        ...(!includeInactive && { isActive: true })
    }).populate(
        "createdBy",
        "name email"
    );

    if (!tourPackage) {
        throw new AppError(
            "Tour package not found",
            404
        );
    }

    const relatedPackages = await TourPackage.find({
        category: tourPackage.category,
        _id: { $ne: tourPackage._id },
        isActive: true
    })
        .limit(4)
        .select(
            "title slug price discountPrice images featured rating"
        );

    const result = {
        package: tourPackage,
        relatedPackages
    };

    if (cache) {
        try {
            await redisClient.set(cacheKey, JSON.stringify(result), { EX: 300 });
        } catch (err) {
            logger.warn({ err }, "Redis write failed");
        }
    }

    return result;
};

/*
|--------------------------------------------------------------------------
| Update Package
|--------------------------------------------------------------------------
*/

const updatePackage = async (id, updateData) => {
    const allowedUpdates = [
        "title",
        "shortDescription",
        "description",
        "destination",
        "category",
        "duration",
        "price",
        "discountPrice",
        "featured",
        "isActive",
        "highlights",
        "included",
        "excluded",
        "itinerary",
        "images",
        "faq",
        "maxGroupSize"
    ];

    const updates = pick(updateData, allowedUpdates);

    const updatedPackage = await TourPackage.findByIdAndUpdate(
        id,
        updates,
        {
            returnDocument: "after",
            runValidators: true
        }
    );

    if (!updatedPackage) {
        throw new AppError(
            "Tour package not found",
            404
        );
    }

    await clearPackageCache();
    await clearDashboardCache();

    return updatedPackage;
};

/*
|--------------------------------------------------------------------------
| Soft Delete Package
|--------------------------------------------------------------------------
*/

const deletePackage = async (id) => {
    const deletedPackage = await TourPackage.findByIdAndUpdate(
        id,
        { isActive: false },
        { returnDocument: "after" }
    );

    if (!deletedPackage) {
        throw new AppError(
            "Tour package not found",
            404
        );
    }

    await clearPackageCache();
    await clearDashboardCache();

    return deletedPackage;
};

module.exports = {
    createPackage,
    getPackages,
    getPackageBySlug,
    updatePackage,
    deletePackage
};
