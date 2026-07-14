const express = require("express");

const router = express.Router();

const packageController = require("../controllers/packageController");
const validate = require("../middlewares/validate");
const protect = require("../middlewares/protect");
const authorize = require("../middlewares/authorize");

const {
    createPackageSchema,
    getPackagesSchema,
    getPackageBySlugSchema,
    updatePackageSchema
} = require("../validations/packageValidation");

router.get(
    "/",
    validate(getPackagesSchema),
    packageController.getPackages
);

router.get(
    "/:slug",
    validate(getPackageBySlugSchema),
    packageController.getPackageBySlug
);

router.post(
    "/",
    protect,
    authorize("admin"),
    validate(createPackageSchema),
    packageController.createPackage
);

router.patch(
    "/:id",
    protect,
    authorize("admin"),
    validate(updatePackageSchema),
    packageController.updatePackage
);

router.delete(
    "/:id",
    protect,
    authorize("admin"),
    packageController.deletePackage
);

module.exports = router;
