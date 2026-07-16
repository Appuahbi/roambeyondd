const asyncHandler = require("../middlewares/asyncHandler");
const blogService = require("../services/blogService");
const { successResponse } = require("../utils/apiResponse");

const createBlog = asyncHandler(async (req, res) => {
    const blog = await blogService.createBlog(
        { ...req.validatedData.body, author: req.user._id },
        req.file
    );

    return successResponse(res, blog, "Blog created successfully", 201);
});

const getBlogs = asyncHandler(async (req, res) => {
    const filters = { ...req.validatedData.query };
    const isAdmin = req.user && req.user.role === "admin";

    if (!isAdmin) {
        filters.status = "published";
    }

    const result = await blogService.getBlogs(filters);

    return successResponse(res, result, "Blogs retrieved successfully");
});

const getBlogBySlug = asyncHandler(async (req, res) => {
    const isAdmin = req.user && req.user.role === "admin";
    const blog = await blogService.getBlogBySlug(
        req.validatedData.params.slug,
        isAdmin
    );

    return successResponse(res, blog, "Blog retrieved successfully");
});

const updateBlog = asyncHandler(async (req, res) => {
    const blog = await blogService.updateBlog(
        req.validatedData.params.id,
        req.validatedData.body,
        req.file
    );

    return successResponse(res, blog, "Blog updated successfully");
});

const deleteBlog = asyncHandler(async (req, res) => {
    const result = await blogService.deleteBlog(
        req.validatedData.params.id
    );

    return successResponse(res, null, result.message);
});

const uploadBlogImage = asyncHandler(async (req, res) => {
    const result = await blogService.uploadBlogImage(req.file);

    return successResponse(res, result, "Image uploaded successfully");
});

module.exports = {
    createBlog,
    getBlogs,
    getBlogBySlug,
    updateBlog,
    deleteBlog,
    uploadBlogImage,
};
