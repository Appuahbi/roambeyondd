const Subscriber = require("../models/Subscriber");
const { successResponse } = require("../utils/apiResponse");
const AppError = require("../utils/AppError");
const asyncHandler = require("../middlewares/asyncHandler");
const { sendNewsletterEmail } = require("../services/emailService");
const { clearDashboardCache } = require("../services/dashboardService");
const logger = require("../config/logger");

const getAllSubscribers = asyncHandler(async (req, res) => {
    const {
        page = "1",
        limit = "20",
        search,
        isSubscribed
    } = req.query || {};

    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10) || 20));
    const skip = (pageNum - 1) * limitNum;

    const filter = {};

    if (isSubscribed !== undefined && isSubscribed !== "") {
        filter.isSubscribed = isSubscribed === "true";
    }

    if (search) {
        const escaped = search.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
        filter.email = { $regex: escaped, $options: "i" };
    }

    const [subscribers, total] = await Promise.all([
        Subscriber.find(filter)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limitNum)
            .lean(),
        Subscriber.countDocuments(filter)
    ]);

    return successResponse(
        res,
        {
            total,
            page: pageNum,
            totalPages: Math.ceil(total / limitNum),
            subscribers
        },
        "Subscribers fetched successfully"
    );
});

const deleteSubscriber = asyncHandler(async (req, res) => {
    const subscriber = await Subscriber.findByIdAndDelete(req.params.id);

    if (!subscriber) {
        throw new AppError("Subscriber not found", 404);
    }

    await clearDashboardCache();

    return successResponse(
        res,
        null,
        "Subscriber deleted successfully"
    );
});

const toggleSubscription = asyncHandler(async (req, res) => {
    const subscriber = await Subscriber.findById(req.params.id);

    if (!subscriber) {
        throw new AppError("Subscriber not found", 404);
    }

    subscriber.isSubscribed = !subscriber.isSubscribed;
    await subscriber.save();
    await clearDashboardCache();

    return successResponse(
        res,
        { subscriber },
        subscriber.isSubscribed ? "Subscriber re-activated" : "Subscriber deactivated"
    );
});

/*
|--------------------------------------------------------------------------
| POST /api/admin/newsletter/send
| Send a newsletter email to all active subscribers.
| body: { subject, body }
|--------------------------------------------------------------------------
*/
const sendNewsletter = asyncHandler(async (req, res) => {
    const { subject, body } = req.body;

    const subscribers = await Subscriber.find({ isSubscribed: true }).lean();
    if (subscribers.length === 0) {
        throw new AppError("No active subscribers to send to", 400);
    }

    let sent = 0;
    let failed = 0;

    const results = await Promise.allSettled(
        subscribers.map((sub) => sendNewsletterEmail(sub, subject, body))
    );

    results.forEach((r, i) => {
        if (r.status === "fulfilled") sent++;
        else {
            failed++;
            logger.error({ err: r.reason, email: subscribers[i].email }, "Newsletter email failed");
        }
    });

    if (failed > 0 && sent === 0) {
        return successResponse(
            res,
            { sent, failed, total: subscribers.length },
            `All ${failed} email(s) failed to send. Check server logs for details.`
        );
    }

    return successResponse(
        res,
        { sent, failed, total: subscribers.length },
        `Newsletter sent to ${sent} subscriber(s)${failed ? ` (${failed} failed)` : ""}`
    );
});

const createSubscriber = asyncHandler(async (req, res) => {
    const { email } = req.validatedData.body;

    const existing = await Subscriber.findOne({ email });

    if (existing) {
        if (existing.isSubscribed) {
            throw new AppError("This email is already subscribed", 409);
        }

        existing.isSubscribed = true;
        await existing.save();
        await clearDashboardCache();

        return successResponse(
            res,
            { subscriber: existing },
            "Subscriber re-activated successfully"
        );
    }

    const subscriber = await Subscriber.create({ email });
    await clearDashboardCache();

    return successResponse(
        res,
        { subscriber },
        "Subscriber added successfully",
        201
    );
});

module.exports = {
    getAllSubscribers,
    deleteSubscriber,
    toggleSubscription,
    sendNewsletter,
    createSubscriber
};
