const mongoose = require("mongoose");

const generateEnquiryNumber = () => {

    const year = new Date().getFullYear();

    const random = Math.floor(
        100000 + Math.random() * 900000
    );

    return `ENQ-${year}-${random}`;

};

const enquirySchema = new mongoose.Schema(
    {

        enquiryNumber: {
            type: String,
            unique: true
        },

        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },



        customerName: {
    type: String,
    required: true,
    trim: true
},

customerEmail: {
    type: String,
    required: true,
    trim: true,
    lowercase: true
},

customerPhone: {
    type: String,
    required: true,
    trim: true
},

        tourPackage: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "TourPackage",
            required: true
        },

        travelDate: {
            type: Date,
            required: true
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

        notes: {
            type: String,
            trim: true,
            default: ""
        },

        leadStatus: {
            type: String,
            enum: [
                "New",
                "Contacted",
                "Quotation Sent",
                "Negotiating",
                "Booked",
                "Closed"
            ],
            default: "New"
        },

        leadSource: {
            type: String,
            enum: [
                "Website",
                "Instagram",
                "Facebook",
                "WhatsApp",
                "Referral",
                "Walk-in",
                "Phone"
            ],
            default: "Website"
        },

        priority: {
    type: String,
    enum: [
        "Low",
        "Medium",
        "High"
    ],
    default: "Medium"
},

        followUpDate: {
            type: Date,
            default: null
        },

        lastContactedAt: {
            type: Date,
            default: null
        },

        remarks: {
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

enquirySchema.pre("save", function (next) {

    if (!this.enquiryNumber) {

        this.enquiryNumber = generateEnquiryNumber();

    }

    next();

});

const Enquiry = mongoose.model(
    "Enquiry",
    enquirySchema
);

module.exports = Enquiry;