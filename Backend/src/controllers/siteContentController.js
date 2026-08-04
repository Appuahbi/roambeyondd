const SiteContent = require("../models/SiteContent");
const asyncHandler = require("../middlewares/asyncHandler");

const DEFAULT_CONTENT = {
    "why-us": {
        features: [
            { title: "Best Price Guarantee", description: "Find a lower price? We'll match it and give you an extra 5% off." },
            { title: "Verified Stays", description: "Every hotel and homestay is personally vetted by our team." },
            { title: "24/7 Support", description: "Reach us anytime via call, WhatsApp, or chat — we never close." },
            { title: "Easy Cancellation", description: "Free cancellation up to 15 days before travel. No hidden fees." },
            { title: "Local Expert Guides", description: "Knowledgeable locals who know every hidden gem and shortcut." },
            { title: "Secure Payments", description: "SSL-encrypted payments. Your financial data is always safe." }
        ]
    },
    footer: {
        address: "Delhi, India",
        phone: "+91 98765 43210",
        email: "hello@roambeyond.com",
        hours: "Mon-Sat, 9 AM - 7 PM"
    },
    contact: {
        address: "Delhi, India",
        phone: "+91 98765 43210",
        email: "hello@roambeyond.com",
        hours: "Mon-Sat, 9 AM - 7 PM"
    }
};

const getSiteContent = asyncHandler(async (req, res) => {
    const { section } = req.params;

    let content = await SiteContent.findOne({ section }).lean();

    if (!content) {
        const defaultData = DEFAULT_CONTENT[section];
        if (defaultData) {
            content = { content: defaultData };
        }
    }

    if (!content) {
        return res.status(404).json({ success: false, message: "Section not found" });
    }

    return res.json({ success: true, data: content.content });
});

const getAllSiteContent = asyncHandler(async (req, res) => {
    const all = await SiteContent.find().lean();
    const result = {};
    for (const item of all) {
        result[item.section] = item.content;
    }
    return res.json({ success: true, data: result });
});

const updateSiteContent = asyncHandler(async (req, res) => {
    const { section } = req.params;
    const content = req.body;

    const updated = await SiteContent.findOneAndUpdate(
        { section },
        { content, updatedBy: req.user.id },
        { new: true, upsert: true, runValidators: true }
    );

    return res.json({ success: true, message: "Content updated", data: updated.content });
});

module.exports = { getSiteContent, getAllSiteContent, updateSiteContent };
