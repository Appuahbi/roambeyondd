const express = require("express");

const router = express.Router();

const authController = require("../controllers/authController");
const validate = require("../middlewares/validate");
const protect = require("../middlewares/protect");
const authorize = require("../middlewares/authorize");
const asyncHandler = require("../middlewares/asyncHandler");

const {
    registerSchema,
    loginSchema,
    changePasswordSchema,
    logoutSchema
} = require("../validations/authValidation");

router.post(
    "/register",
    validate(registerSchema),
    asyncHandler(authController.register)
);

router.post(
    "/login",
    validate(loginSchema),
    asyncHandler(authController.login)
);

router.get(
    "/me",
    protect,
    asyncHandler(authController.getMe)
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
    asyncHandler(authController.changePassword)
);

router.post(
    "/logout",
    protect,
    validate(logoutSchema),
    asyncHandler(authController.logout)
);

module.exports = router;