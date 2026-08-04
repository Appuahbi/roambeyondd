const Enquiry = require("../models/Enquiry");
const TripRequest = require("../models/TripRequest");
const ContactRequest = require("../models/ContactRequest");
const Subscriber = require("../models/Subscriber");
const Review = require("../models/Review");
const TourPackage = require("../models/TourPackage");
const User = require("../models/User");
const Blog = require("../models/Blog");
const { redisClient } = require("../config/redis");
const logger = require("../config/logger");

const DASHBOARD_CACHE_KEY = "dashboard:stats";
const DASHBOARD_CACHE_TTL = 300; // 5 minutes

const MONTH_NAMES = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

/*
Restrict heavy grouping aggregations to the last N months so they don't
scan the entire collection history on every dashboard load.
*/
const monthsAgoDate = (months) => {
    const d = new Date();
    d.setMonth(d.getMonth() - months);
    d.setHours(0, 0, 0, 0);
    return d;
};

const getSummaryStats = async () => {

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const result = await Enquiry.aggregate([
        {
            $facet: {
                totalEnquiries: [{ $count: "count" }],
                newLeads: [{ $match: { leadStatus: "New" } }, { $count: "count" }],
                contacted: [{ $match: { leadStatus: "Contacted" } }, { $count: "count" }],
                quotationSent: [{ $match: { leadStatus: "Quotation Sent" } }, { $count: "count" }],
                negotiating: [{ $match: { leadStatus: "Negotiating" } }, { $count: "count" }],
                booked: [{ $match: { leadStatus: "Booked" } }, { $count: "count" }],
                closed: [{ $match: { leadStatus: "Closed" } }, { $count: "count" }],
                highPriority: [{ $match: { priority: "High" } }, { $count: "count" }],
                todayEnquiries: [{ $match: { createdAt: { $gte: today } } }, { $count: "count" }]
            }
        }
    ]);

    const doc = result[0];
    const get = (arr) => (arr[0] ? arr[0].count : 0);

    return {
        totalEnquiries: get(doc.totalEnquiries),
        newLeads: get(doc.newLeads),
        contacted: get(doc.contacted),
        quotationSent: get(doc.quotationSent),
        negotiating: get(doc.negotiating),
        booked: get(doc.booked),
        closed: get(doc.closed),
        highPriority: get(doc.highPriority),
        todayEnquiries: get(doc.todayEnquiries)
    };

};

const getPlatformStats = async () => {

    const [
        packages,
        blogs,
        subscribers,
        users,
        tripRequests,
        contactRequests,
        reviewsApproved,
        reviewsPending
    ] = await Promise.all([
        TourPackage.countDocuments({ isActive: true }),
        Blog.countDocuments({ status: "published" }),
        Subscriber.countDocuments({ isSubscribed: true }),
        User.countDocuments(),
        TripRequest.countDocuments(),
        ContactRequest.countDocuments(),
        Review.countDocuments({ status: "approved" }),
        Review.countDocuments({ status: "pending" })
    ]);

    return {
        packages,
        blogs,
        subscribers,
        users,
        tripRequests,
        contactRequests,
        reviewsApproved,
        reviewsPending
    };

};

const getRecentEnquiries = async () => {

    return await Enquiry.find()

        .populate(
            "tourPackage",
            "title category"
        )

        .sort("-createdAt")

        .limit(5)

        .select(
            "customerName customerPhone leadStatus priority createdAt enquiryNumber"
        );

};

const getCategoryStats = async () => {

    return await Enquiry.aggregate([

        {
            $match: { createdAt: { $gte: monthsAgoDate(12) } }
        },

        {
            $lookup: {

                from: "tourpackages",

                localField: "tourPackage",

                foreignField: "_id",

                as: "tour"

            }

        },

        {
            $unwind: "$tour"
        },

        {
            $group: {

                _id: "$tour.category",

                total: {
                    $sum: 1
                }

            }

        },

        {
            $sort: {
                total: -1
            }
        }

    ]);

};

const getMonthlyTrend = async () => {

    return await Enquiry.aggregate([

        {
            $match: { createdAt: { $gte: monthsAgoDate(12) } }
        },

        {
            $group: {

                _id: {

                    year: {
                        $year: "$createdAt"
                    },

                    month: {
                        $month: "$createdAt"
                    }

                },

                enquiries: {
                    $sum: 1
                }

            }

        },

        {
            $sort: {

                "_id.year": 1,

                "_id.month": 1

            }

        }

    ]);

};

const getLeadSourceStats = async () => {

    return await Enquiry.aggregate([

        {
            $match: { createdAt: { $gte: monthsAgoDate(12) } }
        },

        {
            $group: {
                _id: "$leadSource",
                total: { $sum: 1 }
            }
        },

        {
            $sort: { total: -1 }
        }

    ]);

};

const getTopDestinations = async () => {

    return await Enquiry.aggregate([

        {
            $match: { createdAt: { $gte: monthsAgoDate(12) } }
        },

        {
            $lookup: {
                from: "tourpackages",
                localField: "tourPackage",
                foreignField: "_id",
                as: "tour"
            }
        },

        {
            $unwind: "$tour"
        },

        {
            $group: {
                _id: "$tour.destination",
                total: { $sum: 1 }
            }
        },

        {
            $sort: { total: -1 }
        },

        {
            $limit: 8
        }

    ]);

};

const getRatingDistribution = async () => {

    const rows = await Review.aggregate([

        {
            $match: { status: "approved" }
        },

        {
            $group: {
                _id: "$rating",
                total: { $sum: 1 }
            }
        }

    ]);

    const map = new Map(rows.map((r) => [r._id, r.total]));

    return [1, 2, 3, 4, 5].map((rating) => ({
        rating,
        total: map.get(rating) || 0
    }));

};

const formatMonthLabel = (key) => {
    const [year, month] = key.split("-").map(Number);
    return `${MONTH_NAMES[month - 1]} ${String(year).slice(2)}`;
};

const getActivityTrend = async () => {

    const now = new Date();
    const buckets = [];

    for (let i = 11; i >= 0; i--) {
        const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
        buckets.push({ key, label: formatMonthLabel(key), enquiries: 0, tripRequests: 0, contactRequests: 0 });
    }

    const map = new Map(buckets.map((b) => [b.key, b]));

    const collect = async (Model, field) => {
        const rows = await Model.aggregate([
            {
                $match: { createdAt: { $gte: monthsAgoDate(12) } }
            },
            {
                $group: {
                    _id: { $dateToString: { format: "%Y-%m", date: "$createdAt" } },
                    total: { $sum: 1 }
                }
            }
        ]);

        rows.forEach((row) => {
            const bucket = map.get(row._id);
            if (bucket) bucket[field] = row.total;
        });
    };

    await Promise.all([
        collect(Enquiry, "enquiries"),
        collect(TripRequest, "tripRequests"),
        collect(ContactRequest, "contactRequests")
    ]);

    return buckets;
};

const getDashboardStats = async () => {

    // Try cache first
    try {
        const cached = await redisClient.get(DASHBOARD_CACHE_KEY);
        if (cached) {
            return JSON.parse(cached);
        }
    } catch (err) {
        logger.warn({ err }, "Redis read failed for dashboard cache");
    }

    const [

        summary,

        platform,

        recentEnquiries,

        categoryStats,

        monthlyTrend,

        leadSourceStats,

        topDestinations,

        ratingDistribution,

        activityTrend

    ] = await Promise.all([

        getSummaryStats(),

        getPlatformStats(),

        getRecentEnquiries(),

        getCategoryStats(),

        getMonthlyTrend(),

        getLeadSourceStats(),

        getTopDestinations(),

        getRatingDistribution(),

        getActivityTrend()

    ]);

    const data = {

        summary: {
            ...summary,
            ...platform
        },

        recentEnquiries,

        categoryStats,

        monthlyTrend,

        leadSourceStats,

        topDestinations,

        ratingDistribution,

        activityTrend

    };

    // Cache the result
    try {
        await redisClient.set(DASHBOARD_CACHE_KEY, JSON.stringify(data), { EX: DASHBOARD_CACHE_TTL });
    } catch (err) {
        logger.warn({ err }, "Redis write failed for dashboard cache");
    }

    return data;

};

const clearDashboardCache = async () => {
    try {
        await redisClient.del(DASHBOARD_CACHE_KEY);
    } catch (err) {
        logger.warn({ err }, "Failed to clear dashboard cache");
    }
};

module.exports = {

    getDashboardStats,
    clearDashboardCache

};
