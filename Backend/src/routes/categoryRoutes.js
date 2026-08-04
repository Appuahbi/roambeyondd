const express = require("express");
const router = express.Router();
const { getCategories, getBlogCategories } = require("../controllers/categoryController");

router.get("/", getCategories);
router.get("/blog", getBlogCategories);

module.exports = router;
