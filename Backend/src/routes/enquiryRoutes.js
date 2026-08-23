const express = require("express");

const enquiryController = require("../controllers/enquiryController");

const protect = require("../middlewares/protect");

const optionalAuth = require("../middlewares/optionalAuth");

const validate = require("../middlewares/validate");

const {
    createEnquirySchema,
    getEnquiryByIdSchema
} = require("../validations/enquiryValidation");

const router = express.Router();

/*
------------------------------------
User Routes
------------------------------------
*/

/*
Submit a new enquiry
POST /api/enquiries
Guests (no login) are allowed when ALLOW_GUEST_ENQUIRIES=true.
*/
router.post(
    "/",
    optionalAuth,
    validate(createEnquirySchema),
    enquiryController.createEnquiry
);

/*
Get logged-in user's enquiries
GET /api/enquiries
*/
router.get(
    "/",
    protect,
    enquiryController.getMyEnquiries
);

/*
Get a single enquiry
GET /api/enquiries/:id
*/
router.get(
    "/:id",
    protect,
    validate(getEnquiryByIdSchema),
    enquiryController.getEnquiryById
);

module.exports = router;