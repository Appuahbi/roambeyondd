const { z } = require("zod");

const getSubscribersSchema = z.object({
    query: z.object({
        page: z.string().optional().default("1"),
        limit: z.string().optional().default("20"),
        search: z.string().optional(),
        isSubscribed: z.string().optional()
    }).optional()
});

const deleteSubscriberSchema = z.object({
    params: z.object({
        id: z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid subscriber ID")
    })
});

const sendNewsletterSchema = z.object({
    body: z.object({
        subject: z.string().min(1, "Subject is required").max(200),
        body: z.string().min(1, "Body is required").max(10000)
    })
});

const createSubscriberSchema = z.object({
    body: z.object({
        email: z.string().trim().toLowerCase().email("Please enter a valid email")
    })
});

module.exports = {
    getSubscribersSchema,
    deleteSubscriberSchema,
    toggleSubscriberSchema: deleteSubscriberSchema,
    sendNewsletterSchema,
    createSubscriberSchema
};
