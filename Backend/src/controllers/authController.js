const authService = require("../services/authService");
const { successResponse } = require("../utils/apiResponse");
const asyncHandler = require("../middlewares/asyncHandler");
const { setAuthCookie, clearAuthCookie } = require("../utils/authCookie");

const login = asyncHandler(async (req, res) => {

    const result = await authService.loginUser(
        req.validatedData.body
    );

    setAuthCookie(res, result.token);

    return successResponse(
        res,
        result,
        "Login successful",
        200
    );

});

const getMe = asyncHandler(async (req, res) => {

    return successResponse(
        res,
        {
            user: {
                id: req.user._id,
                name: req.user.name,
                email: req.user.email,
                phone: req.user.phone,
                role: req.user.role,
                avatar: req.user.avatar,
                isVerified: req.user.isVerified,
                isPhoneVerified: req.user.isPhoneVerified
            }
        },
        "User profile fetched successfully"
    );

});

const changePassword = asyncHandler(async (req, res) => {

    const { currentPassword, newPassword } = req.validatedData.body;

    const result = await authService.changePasswordUser(
        req.user._id,
        currentPassword,
        newPassword
    );

    // Re-issue a fresh token so the user stays logged in after the change
    if (result.token) {
        setAuthCookie(res, result.token);
    }

    return successResponse(
        res,
        null,
        result.message,
        200
    );

});

const logout = asyncHandler(async (req, res) => {

    const token = req.token;

    clearAuthCookie(res);

    const result = await authService.logoutUser(token, req.decoded);

    return successResponse(
        res,
        null,
        result.message,
        200
    );

});

module.exports = {
    login,
    getMe,
    changePassword,
    logout,
};
