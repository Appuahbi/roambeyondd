const { z } = require("zod");

const subscribeSchema = z.object({
    body: z.object({
        email: z.string()
            .trim()
            .email("Please enter a valid email address")
    })
});

const unsubscribeSchema = z.object({
    body: z.object({
        email: z.string()
            .trim()
            .email("Please enter a valid email address")
    })
});

module.exports = {
    subscribeSchema,
    unsubscribeSchema
};
