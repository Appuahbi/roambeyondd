const express = require("express");
const router = express.Router();

const adminNewsletterController = require("../controllers/adminNewsletterController");
const protect = require("../middlewares/protect");
const authorize = require("../middlewares/authorize");
const validate = require("../middlewares/validate");
const {
    getSubscribersSchema,
    deleteSubscriberSchema,
    toggleSubscriberSchema,
    sendNewsletterSchema,
    createSubscriberSchema
} = require("../validations/adminNewsletterValidation");

router.post(
    "/subscribers",
    protect,
    authorize("admin"),
    validate(createSubscriberSchema),
    adminNewsletterController.createSubscriber
);

router.get(
    "/subscribers",
    protect,
    authorize("admin"),
    validate(getSubscribersSchema),
    adminNewsletterController.getAllSubscribers
);

router.delete(
    "/subscribers/:id",
    protect,
    authorize("admin"),
    validate(deleteSubscriberSchema),
    adminNewsletterController.deleteSubscriber
);

router.patch(
    "/subscribers/:id",
    protect,
    authorize("admin"),
    validate(toggleSubscriberSchema),
    adminNewsletterController.toggleSubscription
);

router.post(
    "/send",
    protect,
    authorize("admin"),
    validate(sendNewsletterSchema),
    adminNewsletterController.sendNewsletter
);

module.exports = router;
