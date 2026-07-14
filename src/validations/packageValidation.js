const { z } = require("zod");

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

        category: z.enum([
            "Domestic Tours",
        "Trekking Expeditions",
        "Group Tours",
        "Honeymoon Packages",
        "Corporate Tours"
        ]),

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
        })).optional()
    })
});



const getPackagesSchema = z.object({
    query: z.object({})
});



const getPackageBySlugSchema = z.object({
    params: z.object({
        slug: z.string().trim().min(1)
    })
});



const updatePackageSchema = z.object({

    params: z.object({

        id: z.string()

    }),

    body: z.object({

        title: z.string()
            .trim()
            .min(5)
            .max(100)
            .optional(),

        shortDescription: z.string()
            .min(20)
            .max(200)
            .optional(),

        description: z.string()
            .min(50)
            .optional(),

        destination: z.string()
            .optional(),

        category: z.enum([
            "Domestic Tours",
            "Trekking Expeditions",
            "Group Tours",
            "Honeymoon Packages",
            "Corporate Tours"
        ]).optional(),

        duration: z.string()
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
        })).optional()

    })

});


module.exports = {
    createPackageSchema,
    getPackagesSchema,
    getPackageBySlugSchema,
    updatePackageSchema
};