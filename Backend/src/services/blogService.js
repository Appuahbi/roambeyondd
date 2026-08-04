const Blog = require("../models/Blog");
const AppError = require("../utils/AppError");
const logger = require("../config/logger");
const {
    uploadToCloudinary,
    deleteFromCloudinary,
} = require("../config/cloudinary");
const { clearBlogCache } = require("../utils/cache");

const createBlog = async (data, file) => {
    const blogData = { ...data };

    if (file) {
        const result = await uploadToCloudinary(file);
        blogData.featuredImage = result;
    }

    if (blogData.status === "published") {
        blogData.publishedAt = new Date();
    }

    const blog = await Blog.create(blogData);
    await clearBlogCache();
    return blog;
};

const getBlogs = async (filters) => {
    const {
        page = 1,
        limit = 10,
        search,
        category,
        tag,
        status,
        sortBy = "createdAt",
        order = "desc",
    } = filters;

    const query = {};

    if (status) {
        query.status = status;
    }

    if (search) {
        query.$text = { $search: search };
    }

    if (category) {
        query.category = category;
    }

    if (tag) {
        query.tags = { $in: [tag] };
    }

    const sort = {};
    sort[sortBy] = order === "asc" ? 1 : -1;

    const skip = (page - 1) * limit;

    const [blogs, total] = await Promise.all([
        Blog.find(query)
            .sort(sort)
            .skip(skip)
            .limit(limit)
            .populate("author", "name email")
            .lean(),
        Blog.countDocuments(query),
    ]);

    return {
        blogs,
        pagination: {
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
        },
    };
};

const getBlogBySlug = async (slug, isAdmin = false) => {
    let blog;

    if (isAdmin) {
        blog = await Blog.findOne({ slug }).populate("author", "name email");
    } else {
        blog = await Blog.findOneAndUpdate(
            { slug, status: "published" },
            { $inc: { views: 1 } },
            { returnDocument: "after" }
        ).populate("author", "name email");
    }

    if (!blog) {
        throw new AppError("Blog not found", 404);
    }

    return blog;
};

const getBlogById = async (id) => {
    const blog = await Blog.findById(id).populate("author", "name email");

    if (!blog) {
        throw new AppError("Blog not found", 404);
    }

    return blog;
};

const updateBlog = async (id, data, file) => {
    const blog = await Blog.findById(id);

    if (!blog) {
        throw new AppError("Blog not found", 404);
    }

    const updateData = { ...data };

    if (file) {
        if (blog.featuredImage && blog.featuredImage.publicId) {
            await deleteFromCloudinary(blog.featuredImage.publicId);
        }
        const result = await uploadToCloudinary(file);
        updateData.featuredImage = result;
    }

    if (updateData.status === "published" && !blog.publishedAt) {
        updateData.publishedAt = new Date();
    }

    if (updateData.status === "draft") {
        updateData.publishedAt = null;
    }

    Object.assign(blog, updateData);
    await blog.save();
    await clearBlogCache();

    return blog;
};

const deleteBlog = async (id) => {
    const blog = await Blog.findById(id);

    if (!blog) {
        throw new AppError("Blog not found", 404);
    }

    if (blog.featuredImage && blog.featuredImage.publicId) {
        await deleteFromCloudinary(blog.featuredImage.publicId);
    }

    await Blog.findByIdAndDelete(id);
    await clearBlogCache();

    return { message: "Blog deleted successfully" };
};

const uploadBlogImage = async (file) => {
    if (!file) {
        throw new AppError("No image file provided", 400);
    }

    const result = await uploadToCloudinary(file, {
        folder: "delhi-tour/blog-images",
    });

    return result;
};

module.exports = {
    createBlog,
    getBlogs,
    getBlogBySlug,
    getBlogById,
    updateBlog,
    deleteBlog,
    uploadBlogImage,
};
