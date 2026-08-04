const express = require("express");
const blogController = require("../controllers/blogController");
const protect = require("../middlewares/protect");
const authorize = require("../middlewares/authorize");
const optionalAuth = require("../middlewares/optionalAuth");
const validate = require("../middlewares/validate");
const upload = require("../middlewares/upload");
const validateImageFile = require("../middlewares/validateImageFile");
const parseBlogFormData = require("../middlewares/parseBlogFormData");
const {
    createBlogSchema,
    updateBlogSchema,
    deleteBlogSchema,
    getBlogsSchema,
    getBlogBySlugSchema,
} = require("../validations/blogValidation");

const router = express.Router();

router.get(
    "/",
    optionalAuth,
    validate(getBlogsSchema),
    blogController.getBlogs
);

router.get(
    "/:slug",
    optionalAuth,
    validate(getBlogBySlugSchema),
    blogController.getBlogBySlug
);

router.use(protect, authorize("admin"));

router.post(
    "/",
    upload.single("featuredImage"),
    validateImageFile,
    parseBlogFormData,
    validate(createBlogSchema),
    blogController.createBlog
);

router.patch(
    "/:id",
    upload.single("featuredImage"),
    validateImageFile,
    parseBlogFormData,
    validate(updateBlogSchema),
    blogController.updateBlog
);

router.delete(
    "/:id",
    validate(deleteBlogSchema),
    blogController.deleteBlog
);

router.post(
    "/upload-image",
    upload.single("image"),
    validateImageFile,
    blogController.uploadBlogImage
);

module.exports = router;
