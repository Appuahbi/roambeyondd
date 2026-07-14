const { z } = require("zod");

const createEnquirySchema = z.object({

    body: z.object({

        tourPackage: z
            .string()
            .min(1, "Tour package is required"),

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
        id: z.string()
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

        followUpDate: z.string().optional().nullable(),

        lastContactedAt: z.string().optional().nullable(),

        remarks: z.string().max(1000).optional()

    }).refine(
        (obj) => Object.keys(obj).length > 0,
        { message: "At least one field must be provided" }
    )
});

module.exports = {
    createEnquirySchema,
    updateEnquiryAdminSchema
};