const enquiryService = require("../services/enquiryService");
const { successResponse } = require("../utils/apiResponse");
const asyncHandler = require("../middlewares/asyncHandler");

const createEnquiry = asyncHandler(async (req, res) => {

    const enquiry = await enquiryService.createEnquiry(
        req.validatedData.body,
        req.user.id
    );

    return successResponse(
        res,
        enquiry,
        "Enquiry submitted successfully",
        201
    );

});

const getMyEnquiries = asyncHandler(async (req, res) => {

    const enquiries = await enquiryService.getMyEnquiries(
        req.user.id
    );

    return successResponse(
        res,
        enquiries,
        "Enquiries fetched successfully"
    );

});

const getEnquiryById = asyncHandler(async (req, res) => {

    const enquiry = await enquiryService.getEnquiryById(
        req.params.id,
        req.user
    );

    return successResponse(
        res,
        enquiry,
        "Enquiry fetched successfully"
    );

});

const getAllEnquiries = asyncHandler(async (req, res) => {

    const result = await enquiryService.getAllEnquiries(
        req.query
    );

    return successResponse(
        res,
        result,
        "All enquiries fetched successfully"
    );

});

const updateEnquiry = asyncHandler(async (req, res) => {

    const enquiry = await enquiryService.updateEnquiry(
        req.validatedData.params.id,
        req.validatedData.body
    );

    return successResponse(
        res,
        enquiry,
        "Enquiry updated successfully"
    );

});

const deleteEnquiry = asyncHandler(async (req, res) => {

    await enquiryService.deleteEnquiry(
        req.params.id
    );

    return successResponse(
        res,
        null,
        "Enquiry deleted successfully"
    );

});

module.exports = {
    createEnquiry,
    getMyEnquiries,
    getEnquiryById,
    getAllEnquiries,
    updateEnquiry,
    deleteEnquiry
};
