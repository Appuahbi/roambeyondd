const express = require("express");

const router = express.Router();

const protect = require("../middlewares/protect");
const authorize = require("../middlewares/authorize");
const validate = require("../middlewares/validate");

const enquiryController = require("../controllers/enquiryController");

const { updateEnquiryAdminSchema } = require("../validations/enquiryValidation");

router.get(
    "/enquiries",
    protect,
    authorize("admin"),
    enquiryController.getAllEnquiries
);

router.patch(
    "/enquiries/:id",
    protect,
    authorize("admin"),
    validate(updateEnquiryAdminSchema),
    enquiryController.updateEnquiry
);

module.exports = router;