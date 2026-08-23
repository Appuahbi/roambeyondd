const express = require("express");

const router = express.Router();

const contactRequestController = require("../controllers/contactRequestController");

const protect = require("../middlewares/protect");

const authorize = require("../middlewares/authorize");

const validate = require("../middlewares/validate");

const {

    createContactRequestSchema,

    updateContactRequestSchema,

    deleteContactRequestSchema,

    getContactRequestByIdSchema

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

    authorize("admin", "agent"),

    contactRequestController.getAllContactRequests

);

router.get(

    "/admin/:id",

    protect,

    authorize("admin", "agent"),

    validate(getContactRequestByIdSchema),

    contactRequestController.getContactRequestById

);

router.patch(

    "/admin/:id",

    protect,

    authorize("admin", "agent"),

    validate(updateContactRequestSchema),

    contactRequestController.updateContactRequest

);

router.delete(

    "/admin/:id",

    protect,

    authorize("admin"),

    validate(deleteContactRequestSchema),

    contactRequestController.deleteContactRequest

);

module.exports = router;