const { errorResponse } = require("../utils/apiResponse");
const multer = require("multer");

const errorHandler = (err, req, res, next) => {

    err.statusCode = err.statusCode || 500;

    if (err instanceof multer.MulterError) {
        if (err.code === "LIMIT_FILE_SIZE") {
            return errorResponse(res, "File size cannot exceed 5MB", 400);
        }
        return errorResponse(res, err.message, 400);
    }

    if (err.message === "Only image files are allowed") {
        return errorResponse(res, err.message, 400);
    }

    // Duplicate key error (e.g. duplicate email)
    if (err.code === 11000) {

        const field = Object.keys(err.keyValue)[0];

        return errorResponse(
            res,
            `${field} already exists`,
            409
        );

    }

    // Invalid MongoDB ObjectId
    if (err.name === "CastError") {

        return errorResponse(
            res,
            `Invalid ${err.path}`,
            400
        );

    }

    // Mongoose validation errors
    if (err.name === "ValidationError") {

        const errors = Object.values(err.errors).map(error => error.message);

        return errorResponse(
            res,
            "Validation failed",
            400,
            errors
        );

    }

    return errorResponse(
        res,
        err.isOperational ? err.message : "Internal server error",
        err.statusCode,
        process.env.NODE_ENV === "development" ? [{ stack: err.stack }] : null
    );

};

module.exports = errorHandler;