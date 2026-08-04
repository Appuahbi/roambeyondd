const asyncHandler = require("../middlewares/asyncHandler");
const { runChat } = require("../services/chatService");

const chat = asyncHandler(async (req, res) => {
    const { messages } = req.validatedData?.body || req.body;
    const reply = await runChat({ user: req.user, messages });

    return res.json({
        success: true,
        data: { message: reply }
    });
});

module.exports = { chat };
