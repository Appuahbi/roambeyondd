const express = require("express");

const router = express.Router();

const authController = require("../controllers/authController");
const validate = require("../middlewares/validate");
const protect = require("../middlewares/protect");
const authorize = require("../middlewares/authorize");
const { authLimiter, forgotPasswordLimiter, otpLimiter } = require("../middlewares/rateLimiter");

const {
    registerSchema,
    loginSchema,
    sendOtpSchema,
    verifyOtpSchema,
    phoneLoginSchema,
    changePasswordSchema,
    forgotPasswordSchema,
    resetPasswordSchema,
    verifyEmailSchema,
    updateMeSchema,
} = require("../validations/authValidation");

router.post(
    "/otp/send",
    otpLimiter,
    validate(sendOtpSchema),
    authController.sendOtp
);

router.post(
    "/otp/verify",
    otpLimiter,
    validate(verifyOtpSchema),
    authController.verifyOtp
);

router.post(
    "/phone-login",
    authLimiter,
    validate(phoneLoginSchema),
    authController.phoneLogin
);

router.post(
    "/register",
    authLimiter,
    validate(registerSchema),
    authController.register
);

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

router.patch(
    "/me",
    protect,
    validate(updateMeSchema),
    authController.updateMe
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

router.post(
    "/forgot-password",
    forgotPasswordLimiter,
    validate(forgotPasswordSchema),
    authController.forgotPassword
);

router.post(
    "/reset-password",
    forgotPasswordLimiter,
    validate(resetPasswordSchema),
    authController.resetPassword
);

router.get(
    "/verify-email",
    forgotPasswordLimiter,
    validate(verifyEmailSchema),
    authController.verifyEmail
);

router.post(
    "/resend-verification",
    protect,
    forgotPasswordLimiter,
    authController.resendVerification
);

module.exports = router;
