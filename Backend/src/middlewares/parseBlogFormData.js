const parseBlogFormData = (req, res, next) => {
    if (!req.is("multipart/form-data")) {
        return next();
    }

    if (req.body && req.body.tags && typeof req.body.tags === "string") {
        req.body.tags = req.body.tags
            .split(",")
            .map((tag) => tag.trim())
            .filter(Boolean);
    }

    if (req.body && typeof req.body["seo.metaTitle"] !== "undefined") {
        req.body.seo = {};
        if (req.body["seo.metaTitle"]) {
            req.body.seo.metaTitle = req.body["seo.metaTitle"];
        }
        if (req.body["seo.metaDescription"]) {
            req.body.seo.metaDescription = req.body["seo.metaDescription"];
        }
        if (req.body["seo.keywords"] && typeof req.body["seo.keywords"] === "string") {
            req.body.seo.keywords = req.body["seo.keywords"]
                .split(",")
                .map((k) => k.trim())
                .filter(Boolean);
        }
        delete req.body["seo.metaTitle"];
        delete req.body["seo.metaDescription"];
        delete req.body["seo.keywords"];
    }

    next();
};

module.exports = parseBlogFormData;
