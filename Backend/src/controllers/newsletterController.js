const Subscriber = require("../models/Subscriber");
const { successResponse } = require("../utils/apiResponse");
const asyncHandler = require("../middlewares/asyncHandler");
const { clearDashboardCache } = require("../services/dashboardService");

const subscribe = asyncHandler(async (req, res) => {
    const { email } = req.validatedData.body;

    const existing = await Subscriber.findOne({ email });

    if (existing) {
        if (existing.isSubscribed) {
            return successResponse(
                res,
                null,
                "You are already subscribed!"
            );
        }

        existing.isSubscribed = true;
        await existing.save();
        await clearDashboardCache();

        return successResponse(
            res,
            null,
            "Welcome back! You have been re-subscribed."
        );
    }

    await Subscriber.create({ email });
    await clearDashboardCache();

    return successResponse(
        res,
        null,
        "Successfully subscribed to the newsletter!",
        201
    );
});

const unsubscribe = asyncHandler(async (req, res) => {
    const { email } = req.validatedData.body;

    const subscriber = await Subscriber.findOne({ email });

    if (!subscriber || !subscriber.isSubscribed) {
        return successResponse(
            res,
            null,
            "You are not currently subscribed."
        );
    }

    subscriber.isSubscribed = false;
    await subscriber.save();
    await clearDashboardCache();

    return successResponse(
        res,
        null,
        "You have been unsubscribed successfully."
    );
});

const unsubscribeByEmail = asyncHandler(async (req, res) => {
    const { email } = req.query;

    if (!email) {
        return successResponse(res, null, "Email is required to unsubscribe.");
    }

    const subscriber = await Subscriber.findOne({ email: email.toLowerCase().trim() });

    if (!subscriber || !subscriber.isSubscribed) {
        return successResponse(res, null, "You are not currently subscribed.");
    }

    subscriber.isSubscribed = false;
    await subscriber.save();
    await clearDashboardCache();

    return successResponse(res, null, "You have been unsubscribed successfully.");
});

module.exports = {
    subscribe,
    unsubscribe,
    unsubscribeByEmail
};
