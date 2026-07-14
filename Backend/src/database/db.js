const mongoose = require("mongoose");
const logger = require("../config/logger");

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);

        logger.info("MongoDB Connected Successfully");
    } catch (error) {
        logger.fatal({ err: error }, "Database Connection Failed");

        process.exit(1);
    }
};

module.exports = connectDB;