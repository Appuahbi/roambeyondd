const { z } = require("zod");

const getPackagesSchema = z.object({
    query: z.object({
        page: z.string().optional().default("1"),
        limit: z.string().optional().default("12"),
        category: z.string().optional(),
        destination: z.string().optional(),
        search: z.string().optional(),
        minPrice: z.string().optional(),
        maxPrice: z.string().optional(),
        sort: z.enum(["newest", "price-asc", "price-desc", "rating", "popular"]).optional().default("newest"),
        featured: z.string().optional(),
        includeInactive: z.string().optional()
    }).optional()
});

const createPackageSchema = z.object({
    body: z.object({
        title: z.string()
            .trim()
            .min(5)
            .max(100),

        shortDescription: z.string()
            .trim()
            .min(20)
            .max(200),

        description: z.string()
            .trim()
            .min(50),

        destination: z.string()
            .trim()
            .default("Delhi"),

        category: z.string().min(1),

        duration: z.string()
            .trim()
            .min(3),

        price: z.number()
            .positive(),

        discountPrice: z.number()
            .min(0)
            .default(0),

        featured: z.boolean()
            .optional(),

        highlights: z.array(z.string()).optional(),

        included: z.array(z.string()).optional(),

        excluded: z.array(z.string()).optional(),

        itinerary: z.array(z.object({
            day: z.number().positive(),
            title: z.string().trim().min(1),
            description: z.string().trim().min(1)
        })).optional(),

        images: z.array(z.object({
            url: z.string().url(),
            publicId: z.string().min(1)
        })).optional(),

        faq: z.array(z.object({
            question: z.string().trim().min(1),
            answer: z.string().trim().min(1)
        })).optional(),

        maxGroupSize: z.number().int().min(1).optional(),

        isActive: z.boolean().optional()
    })
});



const getPackageBySlugSchema = z.object({
    params: z.object({
        slug: z.string().trim().min(1)
    })
});



const updatePackageSchema = z.object({

    params: z.object({

        id: z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid package ID")

    }),

    body: z.object({

        title: z.string()
            .trim()
            .min(5)
            .max(100)
            .optional(),

        shortDescription: z.string()
            .trim()
            .min(20)
            .max(200)
            .optional(),

        description: z.string()
            .trim()
            .min(50)
            .optional(),

        destination: z.string()
            .optional(),

        category: z.string().min(1).optional(),

        duration: z.string()
            .trim()
            .min(3)
            .optional(),

        price: z.number()
            .positive()
            .optional(),

        discountPrice: z.number()
            .min(0)
            .optional(),

        featured: z.boolean()
            .optional(),

        isActive: z.boolean()
            .optional(),

        highlights: z.array(z.string()).optional(),

        included: z.array(z.string()).optional(),

        excluded: z.array(z.string()).optional(),

        itinerary: z.array(z.object({
            day: z.number().positive(),
            title: z.string().trim().min(1),
            description: z.string().trim().min(1)
        })).optional(),

        images: z.array(z.object({
            url: z.string().url(),
            publicId: z.string().min(1)
        })).optional(),

        faq: z.array(z.object({
            question: z.string().trim().min(1),
            answer: z.string().trim().min(1)
        })).optional(),

        maxGroupSize: z.number().int().min(1).optional()

    })

}).refine(
    (obj) => Object.keys(obj.body).length > 0,
    { message: "At least one field must be provided for update" }
);


const deletePackageSchema = z.object({
    params: z.object({
        id: z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid package ID")
    })
});

module.exports = {
    getPackagesSchema,
    createPackageSchema,
    getPackageBySlugSchema,
    updatePackageSchema,
    deletePackageSchema
};