const dashboardService = require("../services/dashboardService");
const { successResponse } = require("../utils/apiResponse");
const asyncHandler = require("../middlewares/asyncHandler");

const getDashboardStats = asyncHandler(async (req, res) => {

    const stats = await dashboardService.getDashboardStats();

    return successResponse(
        res,
        stats,
        "Dashboard statistics fetched successfully"
    );

});

module.exports = {
    getDashboardStats
};
