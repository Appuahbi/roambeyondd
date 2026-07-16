const AppError = require("../utils/AppError");

const authorize = (...roles) => {

    return (req, res, next) => {

        if (!req.user) {
            return next(
                new AppError(
                    "You are not logged in. Please log in to continue.",
                    401
                )
            );
        }

        if (!roles.includes(req.user.role)) {
            return next(
                new AppError(
                    "You are not authorized to perform this action",
                    403
                )
            );
        }

        next();

    };

};

module.exports = authorize;
