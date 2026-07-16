const mongoose = require("mongoose");
const slugify = require("slugify");

const generateSlug = (title) => {
    return slugify(title, {
        lower: true,
        strict: true,
        trim: true
    });
};

const itinerarySchema = new mongoose.Schema(
    {
        day: {
            type: Number,
            required: true
        },
        title: {
            type: String,
            required: true,
            trim: true
        },
        description: {
            type: String,
            required: true,
            trim: true
        }
    },
    { _id: false }
);

const imageSchema = new mongoose.Schema(
    {
        url: {
            type: String,
            required: true
        },
        publicId: {
            type: String,
            required: true
        }
    },
    { _id: false }
);

const faqSchema = new mongoose.Schema(
    {
        question: {
            type: String,
            required: true,
            trim: true
        },
        answer: {
            type: String,
            required: true,
            trim: true
        }
    },
    { _id: false }
);

const tourPackageSchema = new mongoose.Schema(
    {
        title: {
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
        shortDescription: {
            type: String,
            required: true,
            trim: true
        },
        description: {
            type: String,
            required: true,
            trim: true
        },
        category: {
            type: String,
            enum: [
                "Domestic Tours",
                "Trekking Expeditions",
                "Group Tours",
                "Honeymoon Packages",
                "Corporate Tours"
            ],
            required: [true, "Package category is required"]
        },
        destination: {
            type: String,
            required: [true, "Destination is required"],
            trim: true
        },
        maxGroupSize: {
            type: Number,
            default: 20,
            min: 1
        },
        duration: {
            type: String,
            required: true
        },
        price: {
            type: Number,
            required: true,
            min: 0
        },
        discountPrice: {
            type: Number,
            default: 0,
            min: 0
        },
        currency: {
            type: String,
            default: "INR"
        },
        featured: {
            type: Boolean,
            default: false
        },
        isActive: {
            type: Boolean,
            default: true
        },
        rating: {
            type: Number,
            default: 0,
            min: 0,
            max: 5
        },
        reviewsCount: {
            type: Number,
            default: 0
        },
        highlights: [
            {
                type: String,
                trim: true
            }
        ],
        included: [
            {
                type: String,
                trim: true
            }
        ],
        excluded: [
            {
                type: String,
                trim: true
            }
        ],
        itinerary: [itinerarySchema],
        images: [imageSchema],
        faq: [faqSchema],
        createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        }
    },
    {
        timestamps: true,
        versionKey: false
    }
);

/*
|--------------------------------------------------------------------------
| Generate Slug Before Save
|--------------------------------------------------------------------------
*/

tourPackageSchema.pre("save", function () {
    if (this.isModified("title")) {
        this.slug = generateSlug(this.title);
    }
});

/*
|--------------------------------------------------------------------------
| Generate Slug Before Update
|--------------------------------------------------------------------------
*/

tourPackageSchema.pre("findOneAndUpdate", function () {
    const update = this.getUpdate();
    if (update && update.title) {
        update.slug = generateSlug(update.title);
    }
});

const TourPackage = mongoose.model(
    "TourPackage",
    tourPackageSchema
);

module.exports = TourPackage;
