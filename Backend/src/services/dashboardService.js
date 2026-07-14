const Enquiry = require("../models/Enquiry");
const { redisClient } = require("../config/redis");
const logger = require("../config/logger");

const DASHBOARD_CACHE_KEY = "dashboard:stats";
const DASHBOARD_CACHE_TTL = 300; // 5 minutes

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

        recentEnquiries,

        categoryStats,

        monthlyTrend

    ] = await Promise.all([

        getSummaryStats(),

        getRecentEnquiries(),

        getCategoryStats(),

        getMonthlyTrend()

    ]);

    const data = {

        summary,

        recentEnquiries,

        categoryStats,

        monthlyTrend

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
