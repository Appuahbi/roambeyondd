const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },
        type: {
            type: String,
            enum: ["enquiry_update", "review_update", "trip_request_update", "system"],
            required: true
        },
        title: {
            type: String,
            required: true,
            trim: true
        },
        message: {
            type: String,
            required: true,
            trim: true
        },
        data: {
            type: mongoose.Schema.Types.Mixed,
            default: {}
        },
        isRead: {
            type: Boolean,
            default: false
        },
        readAt: {
            type: Date
        }
    },
    {
        timestamps: true,
        versionKey: false
    }
);

notificationSchema.index({ user: 1, createdAt: -1 });
notificationSchema.index({ user: 1, isRead: 1 });

module.exports = mongoose.model("Notification", notificationSchema);
