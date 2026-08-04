const mongoose = require("mongoose");

const reviewSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },
        tourPackage: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "TourPackage",
            required: true
        },
        rating: {
            type: Number,
            required: true,
            min: 1,
            max: 5
        },
        title: {
            type: String,
            required: true,
            trim: true,
            maxlength: 100
        },
        comment: {
            type: String,
            required: true,
            trim: true,
            maxlength: 1000
        },
        status: {
            type: String,
            enum: ["pending", "approved", "rejected"],
            default: "pending"
        },
        adminReply: {
            type: String,
            trim: true,
            default: ""
        }
    },
    {
        timestamps: true,
        versionKey: false
    }
);

reviewSchema.index({ user: 1, tourPackage: 1 }, { unique: true });
reviewSchema.index({ tourPackage: 1, status: 1 });
reviewSchema.index({ createdAt: -1 });

module.exports = mongoose.model("Review", reviewSchema);
