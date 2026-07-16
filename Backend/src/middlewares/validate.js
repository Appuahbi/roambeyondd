const { ZodError } = require("zod");
const { errorResponse } = require("../utils/apiResponse");

const validate = (schema) => {
    return async (req, res, next) => {
        try {
            const validatedData = await schema.parseAsync({
                body: req.body,
                params: req.params,
                query: req.query,
            });

            req.validatedData = validatedData;

            next();
        } catch (error) {
            if (error instanceof ZodError) {
                return errorResponse(
                    res,
                    "Validation failed",
                    400,
                    error.issues.map(issue => ({
                        field: issue.path.join("."),
                        message: issue.message
                    }))
                );
            }

            next(error);
        }
    };
};

module.exports = validate;