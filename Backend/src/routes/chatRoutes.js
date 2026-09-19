const express = require("express");
const router = express.Router();
const chatController = require("../controllers/chatController");
const optionalAuth = require("../middlewares/optionalAuth");
const validate = require("../middlewares/validate");
const { chatSchema } = require("../validations/chatValidation");

router.post("/", optionalAuth, validate(chatSchema), chatController.chat);

module.exports = router;
