const express = require("express");

const enquiryController = require("../controllers/enquiryController");

const validate = require("../middlewares/validate");

const { lookupLimiter } = require("../middlewares/rateLimiter");

const {
    createEnquirySchema,
    lookupEnquirySchema,
} = require("../validations/enquiryValidation");

const router = express.Router();

/*
------------------------------------
Public Routes
------------------------------------
*/

/*
Submit a new enquiry
POST /api/enquiries
No login required — anyone can enquire.
*/
router.post(
    "/",
    validate(createEnquirySchema),
    enquiryController.createEnquiry
);

/*
Look up an enquiry's status
GET /api/enquiries/lookup?email=&phone=&enquiryNumber=
No login required.
*/
router.get(
    "/lookup",
    lookupLimiter,
    validate(lookupEnquirySchema),
    enquiryController.lookupEnquiry
);

module.exports = router;