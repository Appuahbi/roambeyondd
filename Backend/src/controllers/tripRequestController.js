const TripRequest = require("../models/TripRequest");
const AppError = require("../utils/AppError");
const asyncHandler = require("../middlewares/asyncHandler");
const { notifyUser } = require("../utils/notify");
const { clearDashboardCache } = require("../services/dashboardService");
const { createTripRequest: createTripRequestService } = require("../services/tripRequestService");

const createTripRequest = asyncHandler(async (req, res) => {
    const data = req.validatedData?.body || req.body;
    const tripRequest = await createTripRequestService({
        userId: req.user.id,
        userName: req.user.name,
        data
    });

    return res.status(201).json({
        success: true,
        message: "Trip request submitted successfully",
        data: tripRequest
    });
});

const getMyTripRequests = asyncHandler(async (req, res) => {
    const requests = await TripRequest.find({ user: req.user.id })
        .sort({ createdAt: -1 })
        .lean();
    return res.json({ success: true, data: requests });
});

const getTripRequestById = asyncHandler(async (req, res) => {
    const request = await TripRequest.findById(req.params.id)
        .populate("user", "name email phone")
        .lean();
    if (!request) throw new AppError("Trip request not found", 404);
    if (request.user._id.toString() !== req.user.id && req.user.role !== "admin") {
        throw new AppError("Not authorized", 403);
    }
    return res.json({ success: true, data: request });
});

const getAllTripRequests = asyncHandler(async (req, res) => {
    const { page = "1", limit = "20", status, search } = req.query || {};
    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.min(100, parseInt(limit, 10) || 20);
    const skip = (pageNum - 1) * limitNum;

    const filter = {};
    if (status) filter.status = status;
    if (search) {
        const escaped = search.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
        filter.$or = [
            { destination: { $regex: escaped, $options: "i" } },
            { specialRequests: { $regex: escaped, $options: "i" } }
        ];
    }

    const [requests, total] = await Promise.all([
        TripRequest.find(filter)
            .populate("user", "name email phone")
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limitNum)
            .lean(),
        TripRequest.countDocuments(filter)
    ]);

    return res.json({
        success: true,
        data: { requests, pagination: { total, page: pageNum, totalPages: Math.ceil(total / limitNum) } }
    });
});

const updateTripRequest = asyncHandler(async (req, res) => {
    const { status, adminNotes, proposedItinerary } = req.body;

    const request = await TripRequest.findByIdAndUpdate(
        req.params.id,
        { ...(status && { status }), ...(adminNotes !== undefined && { adminNotes }), ...(proposedItinerary !== undefined && { proposedItinerary }) },
        { new: true, runValidators: true }
    ).populate("user", "name email");

    if (!request) throw new AppError("Trip request not found", 404);

    await clearDashboardCache();

    await notifyUser(request.user._id, {
        type: "trip_request_update",
        title: `Trip Request ${status || "Updated"}`,
        message: `Your trip request to ${request.destination} has been updated to "${status || request.status}".`,
        data: { tripRequestId: request._id }
    });

    return res.json({ success: true, message: "Trip request updated", data: request });
});

const deleteTripRequest = asyncHandler(async (req, res) => {
    const request = await TripRequest.findByIdAndDelete(req.params.id);

    if (!request) throw new AppError("Trip request not found", 404);

    await clearDashboardCache();

    return res.json({ success: true, message: "Trip request deleted", data: null });
});

module.exports = {
    createTripRequest,
    getMyTripRequests,
    getTripRequestById,
    getAllTripRequests,
    updateTripRequest,
    deleteTripRequest
};
