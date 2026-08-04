const mongoose = require("mongoose");

const subscriberSchema = new mongoose.Schema(
    {
        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true
        },
        isSubscribed: {
            type: Boolean,
            default: true
        }
    },
    {
        timestamps: true,
        versionKey: false
    }
);

subscriberSchema.index({ createdAt: -1 });

module.exports = mongoose.model(
    "Subscriber",
    subscriberSchema
);
