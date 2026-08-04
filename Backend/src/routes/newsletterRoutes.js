const express = require("express");

const router = express.Router();

const newsletterController = require("../controllers/newsletterController");

const validate = require("../middlewares/validate");

const { forgotPasswordLimiter } = require("../middlewares/rateLimiter");

const {
    subscribeSchema,
    unsubscribeSchema
} = require("../validations/newsletterValidation");

/*
-----------------------------------------
Public Routes
-----------------------------------------
*/

router.post(
    "/subscribe",
    forgotPasswordLimiter,
    validate(subscribeSchema),
    newsletterController.subscribe
);

router.post(
    "/unsubscribe",
    forgotPasswordLimiter,
    validate(unsubscribeSchema),
    newsletterController.unsubscribe
);

router.get(
    "/unsubscribe",
    newsletterController.unsubscribeByEmail
);

module.exports = router;
