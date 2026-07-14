const TourPackage = require("../models/TourPackage");
const AppError = require("../utils/AppError");
const pick = require("../utils/pick");
const { redisClient } = require("../config/redis");
const { clearPackageCache } = require("../utils/cache");
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

return tourPackage;
};

/*
|--------------------------------------------------------------------------
| Get All Packages
|--------------------------------------------------------------------------
*/

const getPackages = async () => {

    const cacheKey = "tour-packages:all";

    try {
        const cachedPackages = await redisClient.get(cacheKey);
        if (cachedPackages) {
            return JSON.parse(cachedPackages);
        }
    } catch (err) {
        logger.warn({ err }, "Redis read failed, fetching from DB");
    }

    const packages = await TourPackage.find({ isActive: true })
        .sort("-createdAt");

    try {
        await redisClient.set(cacheKey, JSON.stringify(packages), { EX: 300 });
    } catch (err) {
        logger.warn({ err }, "Redis write failed");
    }

    return packages;

};

/*
|--------------------------------------------------------------------------
| Get Package By Slug
|--------------------------------------------------------------------------
*/

const getPackageBySlug = async (slug) => {

    const cacheKey = `tour-package:${slug}`;

    try {
        const cachedPackage = await redisClient.get(cacheKey);
        if (cachedPackage) {
            return JSON.parse(cachedPackage);
        }
    } catch (err) {
        logger.warn({ err }, "Redis read failed, fetching from DB");
    }

    const tourPackage = await TourPackage.findOne({
        slug,
        isActive: true
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

        _id: {
            $ne: tourPackage._id
        },

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

try {
    await redisClient.set(cacheKey, JSON.stringify(result), { EX: 300 });
} catch (err) {
    logger.warn({ err }, "Redis write failed");
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

        "faq"

    ];

    const updates = pick(
        updateData,
        allowedUpdates
    );

    const updatedPackage =
        await TourPackage.findByIdAndUpdate(
            id,
            updates,
            {
                new: true,
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

return updatedPackage;

};

/*
|--------------------------------------------------------------------------
| Soft Delete Package
|--------------------------------------------------------------------------
*/

const deletePackage = async (id) => {

    const deletedPackage =
        await TourPackage.findByIdAndUpdate(
            id,
            {
                isActive: false
            },
            {
                new: true
            }
        );

    if (!deletedPackage) {

        throw new AppError(
            "Tour package not found",
            404
        );

    }

   await clearPackageCache();

return deletedPackage;

};

module.exports = {

    createPackage,

    getPackages,

    getPackageBySlug,

    updatePackage,

    deletePackage

};