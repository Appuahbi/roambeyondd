const mongoose = require("mongoose");

const tripRequestSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            default: null
        },
        customerName: {
            type: String,
            trim: true,
            default: ""
        },
        customerEmail: {
            type: String,
            trim: true,
            lowercase: true,
            default: ""
        },
        customerPhone: {
            type: String,
            trim: true,
            default: ""
        },
        destination: {
            type: String,
            required: true,
            trim: true
        },
        startDate: {
            type: Date,
            required: true
        },
        endDate: {
            type: Date,
            required: true
        },
        budget: {
            min: { type: Number, default: 0 },
            max: { type: Number, default: 0 }
        },
        groupSize: {
            type: Number,
            required: true,
            min: 1
        },
        adults: {
            type: Number,
            required: true,
            min: 1
        },
        children: {
            type: Number,
            default: 0,
            min: 0
        },
        preferences: [{
            type: String,
            enum: ["adventure", "culture", "food", "luxury", "budget", "family", "romantic", "spiritual", "wildlife", "beach"]
        }],
        specialRequests: {
            type: String,
            trim: true,
            default: "",
            maxlength: 1000
        },
        status: {
            type: String,
            enum: ["New", "In Review", "Itinerary Sent", "Confirmed", "Closed"],
            default: "New"
        },
        adminNotes: {
            type: String,
            trim: true,
            default: ""
        },
        proposedItinerary: {
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

tripRequestSchema.index({ user: 1, createdAt: -1 });
tripRequestSchema.index({ status: 1 });

module.exports = mongoose.model("TripRequest", tripRequestSchema);
