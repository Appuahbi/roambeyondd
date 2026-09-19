const express = require("express");

const router = express.Router();

const protect = require("../middlewares/protect");
const authorize = require("../middlewares/authorize");
const validate = require("../middlewares/validate");

const enquiryController = require("../controllers/enquiryController");
const packageController = require("../controllers/packageController");

const { updateEnquiryAdminSchema, deleteEnquirySchema } = require("../validations/enquiryValidation");
const { getPackageBySlugSchema } = require("../validations/packageValidation");

router.get(
    "/packages/slug/:slug",
    protect,
    authorize("admin"),
    validate(getPackageBySlugSchema),
    packageController.getPackageBySlugPreview
);

router.get(
    "/enquiries",
    protect,
    authorize("admin", "agent"),
    enquiryController.getAllEnquiries
);

router.patch(
    "/enquiries/:id",
    protect,
    authorize("admin", "agent"),
    validate(updateEnquiryAdminSchema),
    enquiryController.updateEnquiry
);

router.delete(
    "/enquiries/:id",
    protect,
    authorize("admin"),
    validate(deleteEnquirySchema),
    enquiryController.deleteEnquiry
);

module.exports = router;