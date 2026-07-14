const enquiryService = require("../services/enquiryService");

const createEnquiry = async (req, res, next) => {

    try {

        const enquiry = await enquiryService.createEnquiry(
            req.validatedData.body,
            req.user.id
        );

        res.status(201).json({
            success: true,
            message: "Enquiry submitted successfully",
            data: enquiry
        });

    } catch (error) {
        next(error);
    }

};

const getMyEnquiries = async (req, res, next) => {

    try {

        const enquiries = await enquiryService.getMyEnquiries(
            req.user.id
        );

        res.status(200).json({
            success: true,
            message: "Enquiries fetched successfully",
            data: enquiries
        });

    } catch (error) {
        next(error);
    }

};

const getEnquiryById = async (req, res, next) => {

    try {

        const enquiry = await enquiryService.getEnquiryById(
            req.params.id,
            req.user
        );

        res.status(200).json({
            success: true,
            message: "Enquiry fetched successfully",
            data: enquiry
        });

    } catch (error) {
        next(error);
    }

};

const getAllEnquiries = async (req, res, next) => {

    try {

        const result =
    await enquiryService.getAllEnquiries(
        req.query
    );

res.status(200).json({

    success: true,

    message: "All enquiries fetched successfully",

    ...result

});

        

    } catch (error) {
        next(error);
    }

};

const updateEnquiry = async (req, res, next) => {

    try {

        const enquiry = await enquiryService.updateEnquiry(
            req.params.id,
            req.validatedData.body
        );

        res.status(200).json({
            success: true,
            message: "Enquiry updated successfully",
            data: enquiry
        });

    } catch (error) {
        next(error);
    }

};

module.exports = {

    createEnquiry,

    getMyEnquiries,

    getEnquiryById,

    getAllEnquiries,

    updateEnquiry

};