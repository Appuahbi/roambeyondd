const ContactRequest = require("../models/ContactRequest");
const AppError = require("../utils/AppError");
const escapeRegex = require("../utils/sanitizeRegex");
const { clearDashboardCache } = require("./dashboardService");
const { notifyUser } = require("../utils/notify");

const AGENT_ROLE = "agent";

const createContactRequest = async (requestData) => {
    const contactRequest = await ContactRequest.create(requestData);
    await clearDashboardCache();
    return contactRequest;
};

const getAllContactRequests = async (query, user) => {
    const {
        page = 1,
        limit = 10,
        status,
        source,
        assignedTo,
        search,
        sort = "latest"
    } = query;

    const filter = {};

    // Agents can only ever see the requests assigned to them.
    if (user && user.role === AGENT_ROLE) {
        filter.assignedTo = user.id;
    } else if (assignedTo) {
        filter.assignedTo = assignedTo === "unassigned" ? null : assignedTo;
    }

    if (status) {
        filter.status = status;
    }

    if (source) {
        filter.source = source;
    }

    if (search) {
        filter.$or = [
            {
                name: {
                    $regex: escapeRegex(search),
                    $options: "i"
                }
            },
            {
                email: {
                    $regex: escapeRegex(search),
                    $options: "i"
                }
            },
            {
                phone: {
                    $regex: escapeRegex(search),
                    $options: "i"
                }
            }
        ];
    }

    let contactRequests = ContactRequest.find(filter);

    if (sort === "latest") {
        contactRequests = contactRequests.sort("-createdAt");
    } else {
        contactRequests = contactRequests.sort("createdAt");
    }

    const pageNum = Number.isFinite(Number(page)) && Number(page) > 0 ? Number(page) : 1;
    const limitNum = Math.min(100, Math.max(1, Number.isFinite(Number(limit)) ? Number(limit) : 10));

    const skip = (pageNum - 1) * limitNum;

    contactRequests = contactRequests
        .populate("assignedTo", "name email")
        .skip(skip)
        .limit(limitNum);

    const total = await ContactRequest.countDocuments(filter);
    const data = await contactRequests;

    return {
        total,
        page: pageNum,
        totalPages: Math.ceil(total / limitNum),
        contactRequests: data
    };
};

const getContactRequestById = async (id, user) => {
    const contactRequest = await ContactRequest.findById(id)
        .populate("assignedTo", "name email");

    if (!contactRequest) {
        throw new AppError("Contact request not found", 404);
    }

    const isAdmin = !user || user.role === "admin";
    const isAssignedAgent = user && user.role === AGENT_ROLE &&
        contactRequest.assignedTo && String(contactRequest.assignedTo._id) === String(user.id);

    if (!isAdmin && !isAssignedAgent) {
        throw new AppError("You are not authorized to view this contact request", 403);
    }

    return contactRequest;
};

const updateContactRequest = async (id, updateData, user) => {
    const contactRequest = await ContactRequest.findById(id);

    if (!contactRequest) {
        throw new AppError("Contact request not found", 404);
    }

    // Agents may only update the requests assigned to them.
    if (user && user.role === AGENT_ROLE && String(contactRequest.assignedTo || "") !== String(user.id)) {
        throw new AppError("You are not authorized to update this contact request", 403);
    }

    const previousAssignee = contactRequest.assignedTo ? String(contactRequest.assignedTo) : "";

    const allowedFields = [
        "status",
        "remarks",
        "source",
        "followUpDate",
        "lastContactedAt",
        "assignedTo"
    ];

    allowedFields.forEach(field => {
        if (updateData[field] !== undefined) {
            contactRequest[field] = updateData[field];
        }
    });

    await contactRequest.save();

    await clearDashboardCache();

    // Notify the newly assigned agent.
    const newAssignee = contactRequest.assignedTo ? String(contactRequest.assignedTo) : "";
    if (newAssignee && newAssignee !== previousAssignee) {
        notifyUser(contactRequest.assignedTo, {
            type: "system",
            title: "New request assigned to you",
            message: `A contact request from ${contactRequest.name} (${contactRequest.subject}) has been assigned to you.`,
            data: { contactRequestId: contactRequest._id }
        }).catch(() => {});
    }

    return contactRequest.populate("assignedTo", "name email");
};

const deleteContactRequest = async (id) => {
    const contactRequest = await ContactRequest.findById(id);

    if (!contactRequest) {
        throw new AppError("Contact request not found", 404);
    }

    await contactRequest.deleteOne();
    await clearDashboardCache();
};

module.exports = {
    createContactRequest,
    getAllContactRequests,
    getContactRequestById,
    updateContactRequest,
    deleteContactRequest
};
