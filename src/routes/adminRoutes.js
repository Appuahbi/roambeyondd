const express = require("express");

const router = express.Router();

const protect = require("../middlewares/protect");
const authorize = require("../middlewares/authorize");
const validate = require("../middlewares/validate");
const asyncHandler = require("../middlewares/asyncHandler");

const enquiryController = require("../controllers/enquiryController");

const { updateEnquiryAdminSchema } = require("../validations/enquiryValidation");

router.get(
    "/enquiries",
    protect,
    authorize("admin"),
    asyncHandler(enquiryController.getAllEnquiries)
);

router.patch(
    "/enquiries/:id",
    protect,
    authorize("admin"),
    validate(updateEnquiryAdminSchema),
    asyncHandler(enquiryController.updateEnquiry)
);

module.exports = router;