const mongoose = require("mongoose");

const wishlistSchema = new mongoose.Schema(
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
        }
    },
    {
        timestamps: true,
        versionKey: false
    }
);

wishlistSchema.index({ user: 1, tourPackage: 1 }, { unique: true });

module.exports = mongoose.model("Wishlist", wishlistSchema);
