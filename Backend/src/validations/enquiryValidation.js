const { z } = require("zod");

const createEnquirySchema = z.object({

    body: z.object({

        customerName: z.string()
            .trim()
            .min(1, "Name is required")
            .max(100, "Name cannot exceed 100 characters"),

        customerEmail: z.string()
            .trim()
            .email("Please enter a valid email"),

        customerPhone: z.string()
            .trim()
            .regex(/^[6-9]\d{9}$/, "Please enter a valid Indian mobile number"),

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

/* Public enquiry lookup — guests follow up on an enquiry by matching their
   email/phone (optionally narrowed by enquiry number). No auth required. */
const lookupEnquirySchema = z.object({
    query: z.object({
        email: z.string().trim().email().optional(),
        phone: z.string().trim().regex(/^[6-9]\d{9}$/, "Invalid phone").optional(),
        enquiryNumber: z.string().trim().max(30).optional(),
    }).refine(
        (q) => q.email !== undefined || q.phone !== undefined || q.enquiryNumber !== undefined,
        { message: "Provide your email, phone or enquiry number" }
    ),
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

        remarks: z.string().max(1000).optional(),

        assignedTo: z.string()
            .regex(/^[0-9a-fA-F]{24}$/, "Invalid user ID")
            .optional()
            .nullable()

    }).refine(
        (obj) => Object.keys(obj).length > 0,
        { message: "At least one field must be provided" }
    )
});

const deleteEnquirySchema = z.object({
    params: z.object({
        id: z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid enquiry ID")
    })
});

module.exports = {
    createEnquirySchema,
    lookupEnquirySchema,
    updateEnquiryAdminSchema,
    deleteEnquirySchema,
};