const packageService = require("../services/packageService");
const { successResponse } = require("../utils/apiResponse");
const asyncHandler = require("../middlewares/asyncHandler");

const createPackage = asyncHandler(async (req, res) => {

    const tourPackage = await packageService.createPackage(
        req.validatedData.body,
        req.user._id
    );

    return successResponse(
        res,
        tourPackage,
        "Tour package created successfully",
        201
    );

});

const getPackages = asyncHandler(async (req, res) => {

    const result = await packageService.getPackages();

    return successResponse(
        res,
        result,
        "Packages fetched successfully"
    );

});

const getPackageBySlug = asyncHandler(async (req, res) => {

    const result = await packageService.getPackageBySlug(
        req.validatedData.params.slug
    );

    return successResponse(
        res,
        result,
        "Package fetched successfully"
    );

});

const updatePackage = asyncHandler(async (req, res) => {

    const updatedPackage =
        await packageService.updatePackage(
            req.validatedData.params.id,
            req.validatedData.body
        );

    return successResponse(
        res,
        updatedPackage,
        "Package updated successfully"
    );

});

const deletePackage = asyncHandler(async (req, res) => {

    await packageService.deletePackage(
        req.validatedData.params.id
    );

    return successResponse(
        res,
        null,
        "Package deleted successfully"
    );

});

module.exports = {
    createPackage,
    getPackages,
    getPackageBySlug,
    updatePackage,
    deletePackage
};
