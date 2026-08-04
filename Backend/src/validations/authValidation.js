const { z } = require("zod");

const registerSchema = z.object({
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
  }),
});

const loginSchema = z.object({
  body: z.object({
    email: z
      .string()
      .trim()
      .toLowerCase()
      .email("Please enter a valid email"),

    password: z
      .string()
      .min(1, "Password is required"),
  }),
});

const changePasswordSchema = z.object({
  body: z.object({
    currentPassword: z
      .string()
      .min(1, "Current password is required"),

    newPassword: z
      .string()
      .min(8, "New password must be at least 8 characters")
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$/,
        "New password must contain uppercase, lowercase and a number"
      ),
  }),
});

const forgotPasswordSchema = z.object({
  body: z.object({
    email: z
      .string()
      .trim()
      .toLowerCase()
      .email("Please enter a valid email"),
  }),
});

const resetPasswordSchema = z.object({
  body: z.object({
    token: z
      .string()
      .min(1, "Reset token is required")
      .regex(/^[a-f0-9]{64}$/, "Invalid reset token format"),

    newPassword: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$/,
        "Password must contain uppercase, lowercase and a number"
      ),
  }),
});

const updateMeSchema = z.object({
  body: z.object({
    name: z
      .string()
      .trim()
      .min(2, "Name must be at least 2 characters")
      .max(50, "Name cannot exceed 50 characters")
      .optional(),

    phone: z
      .string()
      .regex(/^[6-9]\d{9}$/, "Please enter a valid Indian mobile number")
      .optional(),
  }).refine((data) => data.name !== undefined || data.phone !== undefined, {
    message: "At least one field (name or phone) must be provided",
  }),
});

const verifyEmailSchema = z.object({
  query: z.object({
    token: z
      .string()
      .min(1, "Verification token is required")
      .regex(/^[a-f0-9]{64}$/, "Invalid verification token format"),
  }),
});

module.exports = {
  registerSchema,
  loginSchema,
  changePasswordSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  updateMeSchema,
  verifyEmailSchema,
};