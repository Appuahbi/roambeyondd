const { z } = require("zod");

const createEnquirySchema = z.object({

    body: z.object({

        customerName: z.string()
            .trim()
            .min(1, "Name is required")
            .optional(),

        customerEmail: z.string()
            .trim()
            .email("Please enter a valid email")
            .optional(),

        customerPhone: z.string()
            .trim()
            .optional(),

        tourPackage: z
            .string()
            .regex(/^[0-9a-fA-F]{24}$/, "Invalid tour package ID"),

        travelDate: z
            .string()
            .min(1, "Travel date is required")
            .refine(val => !isNaN(Date.parse(val)), {
                message: "Please enter a valid date"
            }),

        adults: z
            .number()
            .int()
            .min(1, "At least one adult is required"),

        children: z
            .number()
            .int()
            .min(0)
            .optional()
            .default(0),

        notes: z
            .string()
            .max(1000)
            .optional()
            .default("")

    })

});

const updateEnquiryAdminSchema = z.object({
    params: z.object({
        id: z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid enquiry ID")
    }),

    body: z.object({
        leadStatus: z.enum([
            "New",
            "Contacted",
            "Quotation Sent",
            "Negotiating",
            "Booked",
            "Closed"
        ]).optional(),

        leadSource: z.enum([
            "Website",
            "Instagram",
            "Facebook",
            "WhatsApp",
            "Referral",
            "Walk-in",
            "Phone"
        ]).optional(),

        priority: z.enum([
            "Low",
            "Medium",
            "High"
        ]).optional(),

        followUpDate: z.string().optional().nullable()
            .refine(val => val === null || val === undefined || !isNaN(Date.parse(val)), {
                message: "Please enter a valid date"
            }),

        lastContactedAt: z.string().optional().nullable()
            .refine(val => val === null || val === undefined || !isNaN(Date.parse(val)), {
                message: "Please enter a valid date"
            }),

        remarks: z.string().max(1000).optional()

    }).refine(
        (obj) => Object.keys(obj).length > 0,
        { message: "At least one field must be provided" }
    )
});

const getEnquiryByIdSchema = z.object({
    params: z.object({
        id: z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid enquiry ID")
    })
});

module.exports = {
    createEnquirySchema,
    updateEnquiryAdminSchema,
    getEnquiryByIdSchema
};