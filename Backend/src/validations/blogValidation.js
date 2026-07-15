const { z } = require("zod");

const createBlogSchema = z.object({
    body: z.object({
        title: z
            .string()
            .trim()
            .min(1, "Title is required")
            .max(200, "Title cannot exceed 200 characters"),
        content: z.string().min(1, "Content is required"),
        excerpt: z
            .string()
            .trim()
            .max(300, "Excerpt cannot exceed 300 characters")
            .optional(),
        category: z.enum([
            "Travel Tips",
            "Destination Guides",
            "Delhi Culture",
            "Food & Cuisine",
            "Adventure",
            "News & Updates",
        ]),
        tags: z.array(z.string().trim()).optional().default([]),
        status: z.enum(["draft", "published"]).optional().default("draft"),
        seo: z
            .object({
                metaTitle: z
                    .string()
                    .trim()
                    .max(60, "Meta title cannot exceed 60 characters")
                    .optional(),
                metaDescription: z
                    .string()
                    .trim()
                    .max(
                        160,
                        "Meta description cannot exceed 160 characters"
                    )
                    .optional(),
                keywords: z.array(z.string().trim()).optional().default([]),
            })
            .optional()
            .default({}),
    }),
});

const updateBlogSchema = z.object({
    params: z.object({
        id: z
            .string()
            .regex(/^[0-9a-fA-F]{24}$/, "Invalid blog ID"),
    }),
    body: z
        .object({
            title: z
                .string()
                .trim()
                .min(1, "Title cannot be empty")
                .max(200, "Title cannot exceed 200 characters")
                .optional(),
            content: z
                .string()
                .min(1, "Content cannot be empty")
                .optional(),
            excerpt: z
                .string()
                .trim()
                .max(300, "Excerpt cannot exceed 300 characters")
                .optional()
                .nullable(),
            category: z
                .enum([
                    "Travel Tips",
                    "Destination Guides",
                    "Delhi Culture",
                    "Food & Cuisine",
                    "Adventure",
                    "News & Updates",
                ])
                .optional(),
            tags: z.array(z.string().trim()).optional(),
            status: z.enum(["draft", "published"]).optional(),
            seo: z
                .object({
                    metaTitle: z
                        .string()
                        .trim()
                        .max(60, "Meta title cannot exceed 60 characters")
                        .optional()
                        .nullable(),
                    metaDescription: z
                        .string()
                        .trim()
                        .max(
                            160,
                            "Meta description cannot exceed 160 characters"
                        )
                        .optional()
                        .nullable(),
                    keywords: z.array(z.string().trim()).optional(),
                })
                .optional(),
        })
        .refine(
            (data) => Object.keys(data).length > 0,
            { message: "At least one field must be provided for update" }
        ),
});

const deleteBlogSchema = z.object({
    params: z.object({
        id: z
            .string()
            .regex(/^[0-9a-fA-F]{24}$/, "Invalid blog ID"),
    }),
});

const getBlogsSchema = z.object({
    query: z.object({
        page: z.coerce.number().int().positive().optional().default(1),
        limit: z
            .coerce.number()
            .int()
            .positive()
            .max(50)
            .optional()
            .default(10),
        search: z.string().trim().optional(),
        category: z
            .enum([
                "Travel Tips",
                "Destination Guides",
                "Delhi Culture",
                "Food & Cuisine",
                "Adventure",
                "News & Updates",
            ])
            .optional(),
        tag: z.string().trim().optional(),
        sortBy: z
            .enum(["createdAt", "publishedAt", "views", "title"])
            .optional()
            .default("createdAt"),
        order: z.enum(["asc", "desc"]).optional().default("desc"),
    }),
});

const getBlogBySlugSchema = z.object({
    params: z.object({
        slug: z.string().trim().min(1, "Slug is required"),
    }),
});

module.exports = {
    createBlogSchema,
    updateBlogSchema,
    deleteBlogSchema,
    getBlogsSchema,
    getBlogBySlugSchema,
};
