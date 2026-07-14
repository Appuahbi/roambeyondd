const express = require("express");

const router = express.Router();

const contactRequestController = require("../controllers/contactRequestController");

const protect = require("../middlewares/protect");

const authorize = require("../middlewares/authorize");

const validate = require("../middlewares/validate");

const {

    createContactRequestSchema,

    updateContactRequestSchema

} = require("../validations/contactRequestValidation");

/*
-----------------------------------------
Public Route
-----------------------------------------
*/

router.post(

    "/",

    validate(createContactRequestSchema),

    contactRequestController.createContactRequest

);

/*
-----------------------------------------
Admin Routes
-----------------------------------------
*/

router.get(

    "/admin",

    protect,

    authorize("admin"),

    contactRequestController.getAllContactRequests

);

router.get(

    "/admin/:id",

    protect,

    authorize("admin"),

    contactRequestController.getContactRequestById

);

router.patch(

    "/admin/:id",

    protect,

    authorize("admin"),

    validate(updateContactRequestSchema),

    contactRequestController.updateContactRequest

);

router.delete(

    "/admin/:id",

    protect,

    authorize("admin"),

    contactRequestController.deleteContactRequest

);

module.exports = router;