const express = require("express");

const router = express.Router();

const packageController = require("../controllers/packageController");
const validate = require("../middlewares/validate");
const protect = require("../middlewares/protect");
const authorize = require("../middlewares/authorize");
const asyncHandler = require("../middlewares/asyncHandler");

const {
    createPackageSchema,
    getPackagesSchema,
    getPackageBySlugSchema,
    updatePackageSchema
} = require("../validations/packageValidation");

router.get(
    "/",
    validate(getPackagesSchema),
    asyncHandler(packageController.getPackages)
);

router.get(
    "/:slug",
    validate(getPackageBySlugSchema),
    asyncHandler(packageController.getPackageBySlug)
);

router.post(
    "/",
    protect,
    authorize("admin"),
    validate(createPackageSchema),
    asyncHandler(packageController.createPackage)
);

router.patch(
    "/:id",
    protect,
    authorize("admin"),
    validate(updatePackageSchema),
    asyncHandler(packageController.updatePackage)
);

router.delete(
    "/:id",
    protect,
    authorize("admin"),
    asyncHandler(packageController.deletePackage)
);

module.exports = router;