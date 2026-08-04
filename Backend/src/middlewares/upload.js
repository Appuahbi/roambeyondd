const multer = require("multer");

const storage = multer.memoryStorage();

const fileFilter = (_req, file, cb) => {
    if (file.mimetype.startsWith("image/")) {
        cb(null, true);
    } else {
        const err = new Error("Only image files are allowed");
        err.code = "INVALID_FILE_TYPE";
        cb(err, false);
    }
};

const upload = multer({
    storage,
    fileFilter,
    limits: {
        fileSize: 5 * 1024 * 1024,
        files: 1,
    },
});

module.exports = upload;
