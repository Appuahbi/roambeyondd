const contactRequestService = require("../services/contactRequestService");
const { successResponse } = require("../utils/apiResponse");
const asyncHandler = require("../middlewares/asyncHandler");

const createContactRequest = asyncHandler(async (req, res) => {

    const contactRequest =
        await contactRequestService.createContactRequest(
            req.validatedData.body
        );

    return successResponse(
        res,
        contactRequest,
        "Contact request submitted successfully",
        201
    );

});

const getAllContactRequests = asyncHandler(async (req, res) => {

    const result =
        await contactRequestService.getAllContactRequests(
            req.query
        );

    return successResponse(
        res,
        result,
        "Contact requests fetched successfully"
    );

});

const getContactRequestById = asyncHandler(async (req, res) => {

    const contactRequest =
        await contactRequestService.getContactRequestById(
            req.params.id
        );

    return successResponse(
        res,
        contactRequest,
        "Contact request fetched successfully"
    );

});

const updateContactRequest = asyncHandler(async (req, res) => {

    const contactRequest =
        await contactRequestService.updateContactRequest(
            req.params.id,
            req.validatedData.body
        );

    return successResponse(
        res,
        contactRequest,
        "Contact request updated successfully"
    );

});

const deleteContactRequest = asyncHandler(async (req, res) => {

    await contactRequestService.deleteContactRequest(
        req.params.id
    );

    return successResponse(
        res,
        null,
        "Contact request deleted successfully"
    );

});

module.exports = {
    createContactRequest,
    getAllContactRequests,
    getContactRequestById,
    updateContactRequest,
    deleteContactRequest
};
