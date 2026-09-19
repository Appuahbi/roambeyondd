const Enquiry = require("../models/Enquiry");
const TourPackage = require("../models/TourPackage");
const AppError = require("../utils/AppError");
const escapeRegex = require("../utils/sanitizeRegex");
const { clearDashboardCache } = require("./dashboardService");
const { notifyUser } = require("../utils/notify");
const { sendNewEnquiryAlert } = require("./emailService");
const User = require("../models/User");

const AGENT_ROLE = "agent";

const createEnquiry = async (enquiryData) => {
    const { tourPackage, travelDate, adults, children, notes, customerName, customerEmail, customerPhone } = enquiryData;

    const tour = await TourPackage.findById(tourPackage);
    if (!tour) {
        throw new AppError("Tour package not found", 404);
    }

    let enquiry;
    let retries = 3;

    while (retries--) {
        try {
            enquiry = await Enquiry.create({
                user: null,
                customerName,
                customerEmail,
                customerPhone,
                tourPackage: tour._id,
                travelDate,
                adults,
                children,
                notes
            });
            break;
        } catch (err) {
            if (err.code === 11000 && retries > 0) continue;
            throw err;
        }
    }

    await clearDashboardCache();

    await enquiry.populate([
        { path: "tourPackage", select: "title category destination duration price images slug" },
        { path: "assignedTo", select: "name email" }
    ]);

    // Real-time email alert to admins — fire and forget, never blocks the response.
    sendNewEnquiryAlert(enquiry).catch(() => {});

    return enquiry;
};

const lookupEnquiry = async ({ email, phone, enquiryNumber }) => {
    const filter = {};

    if (enquiryNumber) {
        filter.enquiryNumber = enquiryNumber;
    }
    if (email) {
        filter.customerEmail = email.toLowerCase();
    }
    if (phone) {
        filter.customerPhone = phone;
    }

    if (!filter.enquiryNumber && !filter.customerEmail && !filter.customerPhone) {
        throw new AppError("Please provide your email, phone or enquiry number", 400);
    }

    const enquiry = await Enquiry.findOne(filter)
        .populate("tourPackage", "title category destination duration price images slug")
        .sort("-createdAt");

    if (!enquiry) {
        throw new AppError("No enquiry found with those details", 404);
    }

    return enquiry;
};

const getAllEnquiries = async (query, user) => {
    const {
        page = 1,
        limit = 10,
        leadStatus,
        leadSource,
        assignedTo,
        search,
        sort = "latest"
    } = query;

    const pageNum = Number.isFinite(Number(page)) && Number(page) > 0 ? Number(page) : 1;
    const limitNum = Math.min(100, Math.max(1, Number.isFinite(Number(limit)) ? Number(limit) : 10));

    const filter = {};

    // Agents can only ever see the leads assigned to them.
    if (user && user.role === AGENT_ROLE) {
        filter.assignedTo = user.id;
    } else if (assignedTo) {
        filter.assignedTo = assignedTo === "unassigned" ? null : assignedTo;
    }

    if (leadStatus) {
        filter.leadStatus = leadStatus;
    }

    if (leadSource) {
        filter.leadSource = leadSource;
    }

    if (search) {
        const matchingUsers = await User.find({
            $or: [
                { name: { $regex: escapeRegex(search), $options: "i" } },
                { email: { $regex: escapeRegex(search), $options: "i" } }
            ]
        }).select("_id");

        filter.$or = [
            { user: { $in: matchingUsers.map(u => u._id) } },
            { customerName: { $regex: escapeRegex(search), $options: "i" } },
            { customerEmail: { $regex: escapeRegex(search), $options: "i" } },
            { customerPhone: { $regex: escapeRegex(search), $options: "i" } },
            { enquiryNumber: { $regex: escapeRegex(search), $options: "i" } }
        ];
    }

    let enquiries = Enquiry.find(filter)
        .populate("user", "name email phone")
        .populate("tourPackage", "title category destination")
        .populate("assignedTo", "name email");

    if (sort === "latest") {
        enquiries = enquiries.sort("-createdAt");
    } else {
        enquiries = enquiries.sort("createdAt");
    }

    const skip = (pageNum - 1) * limitNum;
    enquiries = enquiries.skip(skip).limit(Math.min(limitNum, 100));

    const result = await enquiries;
    const total = await Enquiry.countDocuments(filter);

    return {
        total,
        page: pageNum,
        totalPages: Math.ceil(total / limitNum),
        enquiries: result
    };
};

const updateEnquiry = async (enquiryId, updateData, user) => {
    const enquiry = await Enquiry.findById(enquiryId);

    if (!enquiry) {
        throw new AppError("Enquiry not found", 404);
    }

    // Agents may only update the leads assigned to them.
    if (user && user.role === AGENT_ROLE && String(enquiry.assignedTo || "") !== String(user.id)) {
        throw new AppError("You are not authorized to update this enquiry", 403);
    }

    const previousStatus = enquiry.leadStatus;
    const previousAssignee = enquiry.assignedTo ? String(enquiry.assignedTo) : "";

    const allowedFields = [
        "leadStatus",
        "leadSource",
        "priority",
        "followUpDate",
        "lastContactedAt",
        "remarks",
        "assignedTo"
    ];

    allowedFields.forEach(field => {
        if (updateData[field] !== undefined) {
            enquiry[field] = updateData[field];
        }
    });

    if (updateData.leadStatus === "Contacted" && !enquiry.lastContactedAt) {
        enquiry.lastContactedAt = new Date();
    }

    await enquiry.save();
    await clearDashboardCache();

    // Notify the customer when an admin changes their enquiry's status.
    // Guests have no linked account, so there is no one to notify.
    if (enquiry.user && updateData.leadStatus && updateData.leadStatus !== previousStatus) {
        notifyUser(enquiry.user, {
            type: "enquiry_update",
            title: `Enquiry ${enquiry.enquiryNumber} updated`,
            message: `Your enquiry is now "${updateData.leadStatus}".`,
            data: { enquiryId: enquiry._id, enquiryNumber: enquiry.enquiryNumber, leadStatus: updateData.leadStatus }
        }).catch(() => {});
    }

    // Notify the newly assigned agent.
    const newAssignee = enquiry.assignedTo ? String(enquiry.assignedTo) : "";
    if (newAssignee && newAssignee !== previousAssignee) {
        notifyUser(enquiry.assignedTo, {
            type: "system",
            title: "New lead assigned to you",
            message: `Enquiry ${enquiry.enquiryNumber} (${enquiry.customerName}) has been assigned to you.`,
            data: { enquiryId: enquiry._id, enquiryNumber: enquiry.enquiryNumber }
        }).catch(() => {});
    }

    return await enquiry.populate([
        { path: "user", select: "name email phone" },
        { path: "tourPackage", select: "title category destination duration price" },
        { path: "assignedTo", select: "name email" }
    ]);
};

const deleteEnquiry = async (enquiryId) => {
    const enquiry = await Enquiry.findByIdAndDelete(enquiryId);

    if (!enquiry) {
        throw new AppError("Enquiry not found", 404);
    }

    await clearDashboardCache();

    return enquiry;
};

module.exports = {
    createEnquiry,
    lookupEnquiry,
    getAllEnquiries,
    updateEnquiry,
    deleteEnquiry
};