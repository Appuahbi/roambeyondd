const mongoose = require("mongoose");
const slugify = require("slugify");

const blogSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: [true, "Title is required"],
            unique: true,
            trim: true,
            maxlength: [200, "Title cannot exceed 200 characters"],
        },
        slug: {
            type: String,
            unique: true,
        },
        content: {
            type: String,
            required: [true, "Content is required"],
        },
        excerpt: {
            type: String,
            trim: true,
            maxlength: [300, "Excerpt cannot exceed 300 characters"],
        },
        featuredImage: {
            url: {
                type: String,
                default: "",
            },
            publicId: {
                type: String,
                default: "",
            },
        },
        category: {
            type: String,
            required: [true, "Category is required"],
            enum: {
                values: [
                    "Travel Tips",
                    "Destination Guides",
                    "Delhi Culture",
                    "Food & Cuisine",
                    "Adventure",
                    "News & Updates",
                ],
                message: "{VALUE} is not a valid category",
            },
        },
        tags: {
            type: [String],
            default: [],
        },
        author: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        status: {
            type: String,
            enum: ["draft", "published"],
            default: "draft",
        },
        publishedAt: {
            type: Date,
        },
        seo: {
            metaTitle: {
                type: String,
                trim: true,
                maxlength: [60, "Meta title cannot exceed 60 characters"],
            },
            metaDescription: {
                type: String,
                trim: true,
                maxlength: [
                    160,
                    "Meta description cannot exceed 160 characters",
                ],
            },
            keywords: {
                type: [String],
                default: [],
            },
        },
        views: {
            type: Number,
            default: 0,
        },
    },
    {
        timestamps: true,
        versionKey: false,
    }
);

blogSchema.pre("validate", function () {
    if (this.isModified("title")) {
        this.slug = slugify(this.title, {
            lower: true,
            strict: true,
            trim: true,
        });
    }
});

blogSchema.index({ status: 1, publishedAt: -1 });
blogSchema.index({ category: 1 });
blogSchema.index({ tags: 1 });
blogSchema.index({ title: "text", content: "text", excerpt: "text" });

blogSchema.set("toJSON", {
    transform: function (_doc, ret) {
        ret.id = ret._id;
        delete ret._id;
        delete ret.__v;
        return ret;
    },
});

blogSchema.set("toObject", {
    transform: function (_doc, ret) {
        ret.id = ret._id;
        delete ret._id;
        delete ret.__v;
        return ret;
    },
});

const Blog = mongoose.model("Blog", blogSchema);

module.exports = Blog;
