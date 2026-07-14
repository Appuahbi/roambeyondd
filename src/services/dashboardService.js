const Enquiry = require("../models/Enquiry");

const getSummaryStats = async () => {

    const today = new Date();

    today.setHours(0, 0, 0, 0);

    const [

        totalEnquiries,

        newLeads,

        contacted,

        quotationSent,

        negotiating,

        booked,

        closed,

        highPriority,

        todayEnquiries

    ] = await Promise.all([

        Enquiry.countDocuments(),

        Enquiry.countDocuments({
            leadStatus: "New"
        }),

        Enquiry.countDocuments({
            leadStatus: "Contacted"
        }),

        Enquiry.countDocuments({
            leadStatus: "Quotation Sent"
        }),

        Enquiry.countDocuments({
            leadStatus: "Negotiating"
        }),

        Enquiry.countDocuments({
            leadStatus: "Booked"
        }),

        Enquiry.countDocuments({
            leadStatus: "Closed"
        }),

        Enquiry.countDocuments({
            priority: "High"
        }),

        Enquiry.countDocuments({
            createdAt: {
                $gte: today
            }
        })

    ]);

    return {

        totalEnquiries,

        newLeads,

        contacted,

        quotationSent,

        negotiating,

        booked,

        closed,

        highPriority,

        todayEnquiries

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

    return {

        summary,

        recentEnquiries,

        categoryStats,

        monthlyTrend

    };

};

module.exports = {

    getDashboardStats

};