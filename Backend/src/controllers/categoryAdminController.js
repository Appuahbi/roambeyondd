const Category = require("../models/Category");
const { successResponse } = require("../utils/apiResponse");
const AppError = require("../utils/AppError");
const asyncHandler = require("../middlewares/asyncHandler");

const getAllCategories = asyncHandler(async (req, res) => {
    const { type, page = "1", limit = "50" } = req.query || {};
    const filter = {};
    if (type) filter.type = type;

    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.min(100, parseInt(limit, 10) || 50);
    const skip = (pageNum - 1) * limitNum;

    const [categories, total] = await Promise.all([
        Category.find(filter).sort({ sortOrder: 1, name: 1 }).skip(skip).limit(limitNum).lean(),
        Category.countDocuments(filter)
    ]);

    return successResponse(res, { categories, total, page: pageNum, totalPages: Math.ceil(total / limitNum) }, "Categories fetched");
});

const createCategory = asyncHandler(async (req, res) => {
    const data = req.validatedData?.body || req.body;
    const existing = await Category.findOne({ name: data.name });
    if (existing) throw new AppError("Category with this name already exists", 409);

    const category = await Category.create(data);
    return successResponse(res, category, "Category created", 201);
});

const updateCategory = asyncHandler(async (req, res) => {
    const data = req.validatedData?.body || req.body;
    const category = await Category.findById(req.params.id);
    if (!category) throw new AppError("Category not found", 404);
    Object.assign(category, data);
    await category.save();
    return successResponse(res, category, "Category updated");
});

const deleteCategory = asyncHandler(async (req, res) => {
    const category = await Category.findByIdAndDelete(req.params.id);
    if (!category) throw new AppError("Category not found", 404);
    return successResponse(res, null, "Category deleted");
});

const getPublicCategories = asyncHandler(async (req, res) => {
    const categories = await Category.find({ type: "package", isActive: true }).sort({ sortOrder: 1, name: 1 }).lean();
    return successResponse(res, categories, "Categories fetched");
});

const getPublicBlogCategories = asyncHandler(async (req, res) => {
    const categories = await Category.find({ type: "blog", isActive: true }).sort({ sortOrder: 1, name: 1 }).lean();
    return successResponse(res, categories, "Blog categories fetched");
});

module.exports = { getAllCategories, createCategory, updateCategory, deleteCategory, getPublicCategories, getPublicBlogCategories };
