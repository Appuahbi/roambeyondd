const parseBlogFormData = (req, res, next) => {
    if (!req.is("multipart/form-data")) {
        return next();
    }

    if (req.body && typeof req.body.tags === "string") {
        const parsed = parseJson(req.body.tags);
        req.body.tags = Array.isArray(parsed)
            ? parsed.map((tag) => String(tag).trim()).filter(Boolean)
            : req.body.tags
                .split(",")
                .map((tag) => tag.trim())
                .filter(Boolean);
    }

    if (req.body && typeof req.body.seo === "string") {
        const parsed = parseJson(req.body.seo);
        if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
            req.body.seo = parsed;
        } else {
            delete req.body.seo;
        }
    }

    if (req.body && typeof req.body["seo.metaTitle"] !== "undefined") {
        req.body.seo = req.body.seo || {};
        if (req.body["seo.metaTitle"]) {
            req.body.seo.metaTitle = req.body["seo.metaTitle"];
        }
        if (req.body["seo.metaDescription"]) {
            req.body.seo.metaDescription = req.body["seo.metaDescription"];
        }
        if (req.body["seo.keywords"] && typeof req.body["seo.keywords"] === "string") {
            const keywords = parseJson(req.body["seo.keywords"]);
            req.body.seo.keywords = Array.isArray(keywords)
                ? keywords.map((k) => String(k).trim()).filter(Boolean)
                : req.body["seo.keywords"]
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

const parseJson = (value) => {
    try {
        return JSON.parse(value);
    } catch {
        return undefined;
    }
};

module.exports = parseBlogFormData;
