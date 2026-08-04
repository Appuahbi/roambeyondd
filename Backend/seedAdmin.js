/*
|--------------------------------------------------------------------------
| Seed Admin
|--------------------------------------------------------------------------
| Creates (or promotes) an admin user. Reads credentials from env so
| they never need to be committed:
|
|   ADMIN_NAME, ADMIN_EMAIL, ADMIN_PHONE, ADMIN_PASSWORD
|
| Usage:
|   node seedAdmin.js
|--------------------------------------------------------------------------
*/
require("dotenv").config();
const mongoose = require("mongoose");
const User = require("./src/models/User");

const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/roambeyondd";

const name = process.env.ADMIN_NAME || "RoamBeyond Admin";
const email = (process.env.ADMIN_EMAIL || "admin@roambeyond.com").toLowerCase();
const phone = process.env.ADMIN_PHONE || "9999999999";
const password = process.env.ADMIN_PASSWORD || "Admin@1234";

async function seed() {
    try {
        await mongoose.connect(MONGO_URI);
        console.log("Connected to MongoDB");

        const existing = await User.findOne({ email });
        if (existing) {
            existing.role = "admin";
            if (process.env.ADMIN_PASSWORD) existing.password = password;
            await existing.save();
            console.log(`Promoted existing user to admin: ${email}`);
        } else {
            await User.create({
                name,
                email,
                phone,
                password,
                role: "admin",
                isVerified: true
            });
            console.log(`Created admin user: ${email}`);
        }

        console.log("Admin seed complete.");
        console.log("Login with:");
        console.log(`  email:    ${email}`);
        if (!process.env.ADMIN_PASSWORD) {
            console.log(`  password: ${password}  (default; override via ADMIN_PASSWORD)`);
        }
        await mongoose.disconnect();
    } catch (err) {
        console.error("Admin seed failed:", err.message);
        process.exit(1);
    }
}

seed();
