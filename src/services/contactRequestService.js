const ContactRequest = require("../models/ContactRequest");
const AppError = require("../utils/AppError");

const createContactRequest = async (requestData) => {

    const contactRequest = await ContactRequest.create(requestData);

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

                    $regex: search,

                    $options: "i"

                }

            },

            {

                email: {

                    $regex: search,

                    $options: "i"

                }

            },

            {

                phone: {

                    $regex: search,

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

    const skip = (Number(page) - 1) * Number(limit);

    contactRequests = contactRequests
        .skip(skip)
        .limit(Number(limit));

    const total = await ContactRequest.countDocuments(filter);

    const data = await contactRequests;

    return {

        total,

        page: Number(page),

        totalPages: Math.ceil(total / Number(limit)),

        contactRequests: data

    };

};

const getContactRequestById = async (id) => {

    const contactRequest = await ContactRequest.findById(id);

    if (!contactRequest) {

        throw new AppError(

            "Contact request not found",

            404

        );

    }

    return contactRequest;

};

const updateContactRequest = async (

    id,

    updateData

) => {

    const contactRequest = await ContactRequest.findById(id);

    if (!contactRequest) {

        throw new AppError(

            "Contact request not found",

            404

        );

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

    return contactRequest;

};

const deleteContactRequest = async (id) => {

    const contactRequest = await ContactRequest.findById(id);

    if (!contactRequest) {

        throw new AppError(

            "Contact request not found",

            404

        );

    }

    await contactRequest.deleteOne();

};

module.exports = {

    createContactRequest,

    getAllContactRequests,

    getContactRequestById,

    updateContactRequest,

    deleteContactRequest

};