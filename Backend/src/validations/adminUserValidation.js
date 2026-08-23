const { z } = require("zod");

const getUsersSchema = z.object({
    query: z.object({
        page: z.string().optional().default("1"),
        limit: z.string().optional().default("20"),
        search: z.string().optional(),
        role: z.enum(["user", "admin", "agent"]).optional()
    }).optional()
});

const getUserByIdSchema = z.object({
    params: z.object({
        id: z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid user ID")
    })
});

const updateUserRoleSchema = z.object({
    params: z.object({
        id: z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid user ID")
    }),
    body: z.object({
        role: z.enum(["user", "admin", "agent"], { message: "Role must be user, admin or agent" })
    })
});

const createUserSchema = z.object({
    body: z.object({
        name: z
            .string()
            .trim()
            .min(2, "Name must be at least 2 characters")
            .max(50, "Name cannot exceed 50 characters"),

        email: z
            .string()
            .trim()
            .toLowerCase()
            .email("Please enter a valid email"),

        phone: z
            .string()
            .regex(/^[6-9]\d{9}$/, "Please enter a valid Indian mobile number"),

        password: z
            .string()
            .min(8, "Password must be at least 8 characters")
            .regex(
                /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$/,
                "Password must contain uppercase, lowercase and a number"
            ),

        role: z.enum(["user", "admin", "agent"]).optional().default("user")
    })
});

const deleteUserSchema = z.object({
    params: z.object({
        id: z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid user ID")
    })
});

module.exports = {
    getUsersSchema,
    getUserByIdSchema,
    updateUserRoleSchema,
    createUserSchema,
    deleteUserSchema
};
