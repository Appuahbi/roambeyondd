const { z } = require("zod");

const createTripRequestSchema = z.object({
    body: z.object({
        destination: z.string().trim().min(2).max(100),
        startDate: z.string().refine(val => !isNaN(Date.parse(val)), { message: "Invalid start date" }),
        endDate: z.string().refine(val => !isNaN(Date.parse(val)), { message: "Invalid end date" }),
        budget: z.object({
            min: z.number().min(0).optional().default(0),
            max: z.number().min(0).optional().default(0)
        }).optional(),
        groupSize: z.number().int().min(1),
        adults: z.number().int().min(1),
        children: z.number().int().min(0).optional().default(0),
        preferences: z.array(z.enum(["adventure", "culture", "food", "luxury", "budget", "family", "romantic", "spiritual", "wildlife", "beach"])).optional(),
        specialRequests: z.string().max(1000).optional().default("")
    })
});

const adminUpdateTripRequestSchema = z.object({
    params: z.object({
        id: z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid trip request ID")
    }),
    body: z.object({
        status: z.enum(["New", "In Review", "Itinerary Sent", "Confirmed", "Closed"]).optional(),
        adminNotes: z.string().max(1000).optional(),
        proposedItinerary: z.string().max(5000).optional()
    }).refine(obj => Object.keys(obj).length > 0, { message: "At least one field required" })
});

const adminDeleteTripRequestSchema = z.object({
    params: z.object({
        id: z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid trip request ID")
    })
});

module.exports = { createTripRequestSchema, adminUpdateTripRequestSchema, adminDeleteTripRequestSchema };
