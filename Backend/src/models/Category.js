const mongoose = require("mongoose");
const slugify = require("slugify");

const categorySchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true,
            unique: true
        },
        slug: {
            type: String,
            unique: true,
            lowercase: true
        },
        type: {
            type: String,
            enum: ["package", "blog"],
            required: true,
            default: "package"
        },
        description: {
            type: String,
            trim: true,
            default: ""
        },
        highlights: [{
            type: String,
            trim: true
        }],
        icon: {
            type: String,
            trim: true,
            default: ""
        },
        sortOrder: {
            type: Number,
            default: 0
        },
        isActive: {
            type: Boolean,
            default: true
        }
    },
    {
        timestamps: true,
        versionKey: false
    }
);

categorySchema.pre("save", function () {
    if (this.isModified("name")) {
        this.slug = slugify(this.name, { lower: true, strict: true, trim: true });
    }
});

categorySchema.index({ type: 1, sortOrder: 1 });

module.exports = mongoose.model("Category", categorySchema);
