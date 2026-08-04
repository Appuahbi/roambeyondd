const { z } = require("zod");

const createReviewSchema = z.object({
    params: z.object({
        slug: z.string().trim().min(1)
    }),
    body: z.object({
        rating: z.number().int().min(1).max(5),
        title: z.string().trim().min(3).max(100),
        comment: z.string().trim().min(10).max(1000)
    })
});

const getReviewsSchema = z.object({
    params: z.object({
        slug: z.string().trim().min(1)
    }),
    query: z.object({
        page: z.string().optional().default("1"),
        limit: z.string().optional().default("10"),
        sort: z.enum(["newest", "highest", "lowest"]).optional().default("newest")
    }).optional()
});

const adminUpdateReviewSchema = z.object({
    params: z.object({
        id: z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid review ID")
    }),
    body: z.object({
        status: z.enum(["approved", "rejected"]),
        adminReply: z.string().trim().max(500).optional()
    })
});

const deleteReviewSchema = z.object({
    params: z.object({
        id: z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid review ID")
    })
});

module.exports = {
    createReviewSchema,
    getReviewsSchema,
    adminUpdateReviewSchema,
    deleteReviewSchema
};
