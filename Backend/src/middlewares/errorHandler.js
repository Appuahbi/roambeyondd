const { errorResponse } = require("../utils/apiResponse");

const errorHandler = (err, req, res, next) => {

    err.statusCode = err.statusCode || 500;

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