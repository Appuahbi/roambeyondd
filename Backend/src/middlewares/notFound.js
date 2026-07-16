const { errorResponse } = require("../utils/apiResponse");

const notFound = (req, res, _next) => {
    errorResponse(res, `Route ${req.originalUrl} not found`, 404);
};

module.exports = notFound;
