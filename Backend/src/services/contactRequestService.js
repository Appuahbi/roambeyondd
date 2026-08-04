const ContactRequest = require("../models/ContactRequest");
const AppError = require("../utils/AppError");
const escapeRegex = require("../utils/sanitizeRegex");
const { clearDashboardCache } = require("./dashboardService");

const createContactRequest = async (requestData) => {
    const contactRequest = await ContactRequest.create(requestData);
    await clearDashboardCache();
    return contactRequest;
};

const getAllContactRequests = async (query) => {
    const {
        page = 1,
        limit = 10,
        status,
        source,
        search,
        sort = "latest"
    } = query;

    const filter = {};

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

const getContactRequestById = async (id) => {
    const contactRequest = await ContactRequest.findById(id);

    if (!contactRequest) {
        throw new AppError("Contact request not found", 404);
    }

    return contactRequest;
};

const updateContactRequest = async (id, updateData) => {
    const contactRequest = await ContactRequest.findById(id);

    if (!contactRequest) {
        throw new AppError("Contact request not found", 404);
    }

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

    return contactRequest;
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
