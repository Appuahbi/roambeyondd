const { z } = require("zod");

const createContactRequestSchema = z.object({
    body: z.object({
        name: z.string()
            .trim()
            .min(3, "Name must be at least 3 characters")
            .max(100, "Name cannot exceed 100 characters"),

        email: z.string()
            .trim()
            .email("Please enter a valid email"),

        phone: z.string()
            .trim()
            .optional()
            .refine((val) => !val || /^[6-9]\d{9}$/.test(val), "Please enter a valid Indian mobile number"),

        subject: z.string()
            .trim()
            .min(5, "Subject must be at least 5 characters")
            .max(150, "Subject cannot exceed 150 characters"),

        message: z.string()
            .trim()
            .min(10, "Message must be at least 10 characters")
            .max(1000, "Message cannot exceed 1000 characters"),

        source: z.enum(["Website", "WhatsApp", "Phone", "Email", "Instagram", "Facebook"])
            .optional()
    })
});

const updateContactRequestSchema = z.object({
    params: z.object({
        id: z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid contact request ID")
    }),

    body: z.object({
        status: z.enum(["New", "Contacted", "Resolved", "Closed"])
            .optional(),

        remarks: z.string()
            .trim()
            .max(1000, "Remarks cannot exceed 1000 characters")
            .optional(),

        source: z.enum(["Website", "WhatsApp", "Phone", "Email", "Instagram", "Facebook"])
            .optional(),

        followUpDate: z.string()
            .optional()
            .nullable()
            .refine(val => val === null || val === undefined || !isNaN(Date.parse(val)), {
                message: "Please enter a valid date"
            }),

        lastContactedAt: z.string()
            .optional()
            .nullable()
            .refine(val => val === null || val === undefined || !isNaN(Date.parse(val)), {
                message: "Please enter a valid date"
            }),

        assignedTo: z.string()
            .regex(/^[0-9a-fA-F]{24}$/, "Invalid user ID")
            .optional()

    }).refine(
        (obj) => Object.keys(obj).length > 0,
        { message: "At least one field must be provided" }
    )
});

const deleteContactRequestSchema = z.object({
    params: z.object({
        id: z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid contact request ID")
    })
});

const getContactRequestByIdSchema = z.object({
    params: z.object({
        id: z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid contact request ID")
    })
});

module.exports = {
    createContactRequestSchema,
    updateContactRequestSchema,
    deleteContactRequestSchema,
    getContactRequestByIdSchema
};
