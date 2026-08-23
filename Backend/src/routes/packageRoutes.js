const express = require("express");

const router = express.Router();

const packageController = require("../controllers/packageController");
const validate = require("../middlewares/validate");
const protect = require("../middlewares/protect");
const authorize = require("../middlewares/authorize");
const upload = require("../middlewares/upload");
const validateImageFile = require("../middlewares/validateImageFile");

const {
    getPackagesSchema,
    createPackageSchema,
    getPackageBySlugSchema,
    updatePackageSchema,
    deletePackageSchema
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

router.post(
    "/upload-image",
    protect,
    authorize("admin"),
    upload.single("image"),
    validateImageFile,
    packageController.uploadPackageImage
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
    validate(deletePackageSchema),
    packageController.deletePackage
);

module.exports = router;
