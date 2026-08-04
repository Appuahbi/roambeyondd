const TripRequest = require("../models/TripRequest");
const User = require("../models/User");
const { notifyMultiple } = require("../utils/notify");
const { clearDashboardCache } = require("./dashboardService");

const createTripRequest = async ({ userId, userName, data }) => {
    const tripRequest = await TripRequest.create({
        ...data,
        user: userId
    });

    await clearDashboardCache();

    const admins = await User.find({ role: "admin" }).select("_id");
    await notifyMultiple(
        admins.map((a) => a._id),
        {
            type: "trip_request_update",
            title: "New Trip Request",
            message: `${userName} requested a trip to ${data.destination}`,
            data: { tripRequestId: tripRequest._id }
        }
    );

    return tripRequest;
};

module.exports = { createTripRequest };
