const mongoose = require("mongoose");
const Category = require("./src/models/Category");

require("dotenv").config();

const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/roambeyondd";

const packageCategories = [
    { name: "Domestic Tours", type: "package", description: "Discover the rich heritage and diverse culture of incredible India.", highlights: ["Heritage sites", "Cultural immersion", "City tours", "Food trails"], sortOrder: 1 },
    { name: "Trekking Expeditions", type: "package", description: "Challenge yourself with breathtaking treks through majestic mountains.", highlights: ["Himalayan trails", "Camping", "Summit treks", "Nature walks"], sortOrder: 2 },
    { name: "Group Tours", type: "package", description: "Travel with friends, family, or like-minded adventurers.", highlights: ["Family trips", "Friends getaway", "Social travel", "Group discounts"], sortOrder: 3 },
    { name: "Honeymoon Packages", type: "package", description: "Begin your journey together in the most romantic settings.", highlights: ["Romantic stays", "Private experiences", "Scenic routes", "Couples activities"], sortOrder: 4 },
    { name: "Corporate Tours", type: "package", description: "Build stronger teams through unforgettable travel experiences.", highlights: ["Team building", "Conference venues", "Luxury stays", "Activity planning"], sortOrder: 5 },
];

const blogCategories = [
    { name: "Travel Tips", type: "blog", description: "Practical advice for your journeys", sortOrder: 1 },
    { name: "Destination Guides", type: "blog", description: "In-depth guides to India's best destinations", sortOrder: 2 },
    { name: "Delhi Culture", type: "blog", description: "Explore the heart of India's capital", sortOrder: 3 },
    { name: "Food & Cuisine", type: "blog", description: "Culinary adventures across India", sortOrder: 4 },
    { name: "Adventure", type: "blog", description: "Thrilling stories from the wild", sortOrder: 5 },
    { name: "News & Updates", type: "blog", description: "Latest from RoamBeyond", sortOrder: 6 },
];

async function seed() {
    try {
        await mongoose.connect(MONGO_URI);
        console.log("Connected to MongoDB");

        for (const cat of [...packageCategories, ...blogCategories]) {
            const exists = await Category.findOne({ name: cat.name });
            if (!exists) {
                await Category.create(cat);
                console.log(`Created: ${cat.name} (${cat.type})`);
            } else {
                console.log(`Exists: ${cat.name}`);
            }
        }

        console.log("Seed complete!");
        await mongoose.disconnect();
    } catch (err) {
        console.error("Seed failed:", err.message);
        process.exit(1);
    }
}

seed();
