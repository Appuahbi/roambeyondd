const Enquiry = require("../models/Enquiry");
const TourPackage = require("../models/TourPackage");
const AppError = require("../utils/AppError");

const User = require("../models/User");

const createEnquiry = async (enquiryData, userId) => {

    const {
        tourPackage,
        travelDate,
        adults,
        children,
        notes
    } = enquiryData;

    // Check whether the selected package exists
    const tour = await TourPackage.findById(tourPackage);

    if (!tour) {
        throw new AppError(
            "Tour package not found",
            404
        );
    }

const user = await User.findById(userId);

if (!user) {
    throw new AppError(
        "User not found",
        404
    );
}

const enquiry = await Enquiry.create({

    user: user._id,

    customerName: user.name,

    customerEmail: user.email,

    customerPhone: user.phone,

    tourPackage: tour._id,

    travelDate,

    adults,

    children,

    notes

});
    return await enquiry.populate([
        {
            path: "user",
            select: "name email phone"
        },
        {
            path: "tourPackage",
            select:
                "title category destination duration price images slug"
        }
    ]);

};

const getMyEnquiries = async (userId) => {

    return await Enquiry.find({

        user: userId

    })
        .populate(
            "tourPackage",
            "title category destination duration price images slug"
        )
        .sort("-createdAt");

};

const getEnquiryById = async (enquiryId, user) => {

    const enquiry = await Enquiry.findById(enquiryId)
        .populate(
            "user",
            "name email phone"
        )
        .populate(
            "tourPackage",
            "title category destination duration price images slug"
        );

    if (!enquiry) {
        throw new AppError(
            "Enquiry not found",
            404
        );
    }

    // Only the owner or an admin can view the enquiry
    if (
        user.role !== "admin" &&
        enquiry.user._id.toString() !== user.id
    ) {
        throw new AppError(
            "You are not authorized to view this enquiry",
            403
        );
    }

    return enquiry;

};

const getAllEnquiries = async (query) => {

    const {

        page = 1,

        limit = 10,

        leadStatus,

        leadSource,

        search,

        sort = "latest"

    } = query;

    const filter = {};

    if (leadStatus) {
        filter.leadStatus = leadStatus;
    }

    if (leadSource) {
        filter.leadSource = leadSource;
    }

    // When searching, find matching user IDs first so pagination is accurate
    if (search) {
        const matchingUsers = await User.find({
            $or: [
                { name: { $regex: search, $options: "i" } },
                { email: { $regex: search, $options: "i" } }
            ]
        }).select("_id");

        filter.user = { $in: matchingUsers.map(u => u._id) };
    }

    let enquiries = Enquiry.find(filter)
        .populate(
            "user",
            "name email phone"
        )
        .populate(
            "tourPackage",
            "title category destination"
        );

    if (sort === "latest") {

        enquiries = enquiries.sort("-createdAt");

    } else {

        enquiries = enquiries.sort("createdAt");

    }

    const skip = (page - 1) * limit;

    enquiries = enquiries.skip(skip).limit(Number(limit));

    const result = await enquiries;

    const total = await Enquiry.countDocuments(filter);

    return {

        total,

        page: Number(page),

        totalPages: Math.ceil(total / limit),

        enquiries: result

    };

};

const updateEnquiry = async (
    enquiryId,
    updateData
) => {

    const enquiry = await Enquiry.findById(enquiryId);

    if (!enquiry) {
        throw new AppError(
            "Enquiry not found",
            404
        );
    }

    const allowedFields = [

    "leadStatus",

    "leadSource",

    "priority",

    "followUpDate",

    "lastContactedAt",

    "remarks"

];

    allowedFields.forEach(field => {

        if (updateData[field] !== undefined) {

            enquiry[field] = updateData[field];

        }

    });

    // Automatically save contact time
    if (
        updateData.leadStatus === "Contacted" &&
        !enquiry.lastContactedAt
    ) {

        enquiry.lastContactedAt = new Date();

    }

    await enquiry.save();

    return await enquiry.populate([
        {
            path: "user",
            select: "name email phone"
        },
        {
            path: "tourPackage",
            select:
                "title category destination duration price"
        }
    ]);

};


module.exports = {

    createEnquiry,

    getMyEnquiries,

    getEnquiryById,

    getAllEnquiries,

    updateEnquiry

};