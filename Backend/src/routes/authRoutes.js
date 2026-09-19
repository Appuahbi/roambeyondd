const express = require("express");

const router = express.Router();

const authController = require("../controllers/authController");
const validate = require("../middlewares/validate");
const protect = require("../middlewares/protect");
const authorize = require("../middlewares/authorize");
const { authLimiter } = require("../middlewares/rateLimiter");

const {
    loginSchema,
    changePasswordSchema,
} = require("../validations/authValidation");

router.post(
    "/login",
    authLimiter,
    validate(loginSchema),
    authController.login
);

router.get(
    "/me",
    protect,
    authController.getMe
);

router.get(
    "/admin",
    protect,
    authorize("admin"),
    (req, res) => {
        res.json({
            success: true,
            message: "Welcome Admin!"
        });
    }
);

router.patch(
    "/change-password",
    protect,
    validate(changePasswordSchema),
    authController.changePassword
);

router.post(
    "/logout",
    protect,
    authController.logout
);

module.exports = router;