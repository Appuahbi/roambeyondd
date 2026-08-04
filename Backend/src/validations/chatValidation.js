const { z } = require("zod");

const chatSchema = z.object({
    body: z.object({
        messages: z.array(
            z.object({
                role: z.enum(["user", "assistant"]),
                content: z.string().trim().min(1).max(4000)
            })
        ).min(1).max(20)
    })
});

module.exports = { chatSchema };
