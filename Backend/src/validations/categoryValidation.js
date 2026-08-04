const { z } = require("zod");

const createCategorySchema = z.object({
    body: z.object({
        name: z.string().trim().min(2).max(50),
        type: z.enum(["package", "blog"]),
        description: z.string().trim().max(500).optional().default(""),
        highlights: z.array(z.string()).optional(),
        icon: z.string().optional().default(""),
        sortOrder: z.number().int().optional().default(0)
    })
});

const updateCategorySchema = z.object({
    params: z.object({
        id: z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid category ID")
    }),
    body: z.object({
        name: z.string().trim().min(2).max(50).optional(),
        description: z.string().trim().max(500).optional(),
        highlights: z.array(z.string()).optional(),
        icon: z.string().optional(),
        sortOrder: z.number().int().optional(),
        isActive: z.boolean().optional()
    }).refine(obj => Object.keys(obj).length > 0, { message: "At least one field required" })
});

const deleteCategorySchema = z.object({
    params: z.object({
        id: z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid category ID")
    })
});

module.exports = { createCategorySchema, updateCategorySchema, deleteCategorySchema };
