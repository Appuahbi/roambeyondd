const contactRequestService = require("../services/contactRequestService");

const createContactRequest = async (req, res, next) => {

    try {

        const contactRequest =
            await contactRequestService.createContactRequest(
                req.validatedData.body
            );

        res.status(201).json({

            success: true,

            message: "Contact request submitted successfully",

            data: contactRequest

        });

    } catch (error) {

        next(error);

    }

};

const getAllContactRequests = async (req, res, next) => {

    try {

        const result =
            await contactRequestService.getAllContactRequests(
                req.query
            );

        res.status(200).json({

            success: true,

            message: "Contact requests fetched successfully",

            ...result

        });

    } catch (error) {

        next(error);

    }

};

const getContactRequestById = async (req, res, next) => {

    try {

        const contactRequest =
            await contactRequestService.getContactRequestById(
                req.params.id
            );

        res.status(200).json({

            success: true,

            message: "Contact request fetched successfully",

            data: contactRequest

        });

    } catch (error) {

        next(error);

    }

};

const updateContactRequest = async (req, res, next) => {

    try {

        const contactRequest =
            await contactRequestService.updateContactRequest(

                req.params.id,

                req.validatedData.body

            );

        res.status(200).json({

            success: true,

            message: "Contact request updated successfully",

            data: contactRequest

        });

    } catch (error) {

        next(error);

    }

};

const deleteContactRequest = async (req, res, next) => {

    try {

        await contactRequestService.deleteContactRequest(
            req.params.id
        );

        res.status(200).json({

            success: true,

            message: "Contact request deleted successfully"

        });

    } catch (error) {

        next(error);

    }

};

module.exports = {

    createContactRequest,

    getAllContactRequests,

    getContactRequestById,

    updateContactRequest,

    deleteContactRequest

};