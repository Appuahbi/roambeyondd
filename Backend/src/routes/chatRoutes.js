const express = require("express");
const router = express.Router();
const chatController = require("../controllers/chatController");
const protect = require("../middlewares/protect");
const validate = require("../middlewares/validate");
const { chatSchema } = require("../validations/chatValidation");

router.post("/", protect, validate(chatSchema), chatController.chat);

module.exports = router;
