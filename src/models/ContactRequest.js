const mongoose = require("mongoose");

const contactRequestSchema = new mongoose.Schema(
    {

        name: {
            type: String,
            required: true,
            trim: true
        },

        email: {
            type: String,
            required: true,
            lowercase: true,
            trim: true
        },

        phone: {
            type: String,
            required: true,
            trim: true
        },

        subject: {
            type: String,
            required: true,
            trim: true
        },

        message: {
            type: String,
            required: true,
            trim: true
        },

        status: {
            type: String,
            enum: [
                "New",
                "Contacted",
                "Resolved",
                "Closed"
            ],
            default: "New",
            index: true
        },

        followUpDate: {
    type: Date
},

lastContactedAt: {
    type: Date
},

assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
},

        source: {
            type: String,
            enum: [
                "Website",
                "WhatsApp",
                "Phone",
                "Email",
                "Instagram",
                "Facebook"
            ],
            default: "Website"
        },

        remarks: {
            type: String,
            default: "",
            trim: true
        }

    },
    {

        timestamps: true,

        versionKey: false

    }
);

contactRequestSchema.index({
    createdAt: -1
});

contactRequestSchema.index({
    email: 1
});

contactRequestSchema.index({
    phone: 1
});

module.exports = mongoose.model(
    "ContactRequest",
    contactRequestSchema
);