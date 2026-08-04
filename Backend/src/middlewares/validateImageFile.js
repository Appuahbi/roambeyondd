const AppError = require("../utils/AppError");

/*
Verify the actual content of an uploaded image by inspecting its magic
bytes instead of trusting the client-supplied MIME type.
SVG is rejected on purpose: it can embed scripts and is unsafe to serve.
*/

const SIGNATURES = [
    { name: "JPEG", bytes: [0xff, 0xd8, 0xff] },
    { name: "PNG", bytes: [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a] },
    { name: "GIF", bytes: [0x47, 0x49, 0x46, 0x38] },
    { name: "WEBP", bytes: [0x52, 0x49, 0x46, 0x46] } // RIFF....WEBP
];

const matchesSignature = (buffer, signature) => {
    if (buffer.length < signature.length) return false;
    return signature.every((byte, index) => buffer[index] === byte);
};

const isWebp = (buffer) => {
    if (buffer.length < 12) return false;
    return (
        buffer[0] === 0x52 &&
        buffer[1] === 0x49 &&
        buffer[2] === 0x46 &&
        buffer[3] === 0x46 &&
        buffer[8] === 0x57 &&
        buffer[9] === 0x45 &&
        buffer[10] === 0x42 &&
        buffer[11] === 0x50
    );
};

const validateImageFile = (req, _res, next) => {
    if (!req.file) {
        return next();
    }

    const buffer = req.file.buffer;

    if (!buffer || buffer.length === 0) {
        return next(new AppError("Uploaded file is empty", 400));
    }

    const valid = SIGNATURES.some(
        (sig) => sig.name === "WEBP" ? isWebp(buffer) : matchesSignature(buffer, sig.bytes)
    );

    if (!valid) {
        return next(new AppError("Uploaded file is not a valid image (JPEG, PNG, GIF or WebP)", 400));
    }

    next();
};

module.exports = validateImageFile;
