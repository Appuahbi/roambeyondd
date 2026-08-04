const express = require("express");
const router = express.Router();
const ctrl = require("../controllers/categoryAdminController");
const protect = require("../middlewares/protect");
const authorize = require("../middlewares/authorize");
const validate = require("../middlewares/validate");
const { createCategorySchema, updateCategorySchema, deleteCategorySchema } = require("../validations/categoryValidation");

router.get("/", protect, authorize("admin"), ctrl.getAllCategories);
router.post("/", protect, authorize("admin"), validate(createCategorySchema), ctrl.createCategory);
router.put("/:id", protect, authorize("admin"), validate(updateCategorySchema), ctrl.updateCategory);
router.delete("/:id", protect, authorize("admin"), validate(deleteCategorySchema), ctrl.deleteCategory);

module.exports = router;
