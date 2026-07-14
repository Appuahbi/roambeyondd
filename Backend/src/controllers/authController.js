const authService = require("../services/authService");
const { successResponse } = require("../utils/apiResponse");
const asyncHandler = require("../middlewares/asyncHandler");

const register = asyncHandler(async (req, res) => {

    const result = await authService.registerUser(
        req.validatedData.body
    );

    return successResponse(
        res,
        result,
        "User registered successfully",
        201
    );

});

const login = asyncHandler(async (req, res) => {

    const result = await authService.loginUser(
        req.validatedData.body
    );

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
                isVerified: req.user.isVerified
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

    return successResponse(
        res,
        null,
        result.message,
        200
    );

});

const logout = asyncHandler(async (req, res) => {

    const token = req.headers.authorization.split(" ")[1];

    const result = await authService.logoutUser(token, req.decoded);

    return successResponse(
        res,
        null,
        result.message,
        200
    );

});

module.exports = {
    register,
    login,
    getMe,
    changePassword,
    logout
};
