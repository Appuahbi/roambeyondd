const { redisClient } = require("../config/redis");
const logger = require("../config/logger");

const clearPackageCache = async () => {
    try {
        const keys = [];
        for await (const key of redisClient.scanIterator({ MATCH: "tour-package*", COUNT: 100 })) {
            keys.push(key);
        }
        for await (const key of redisClient.scanIterator({ MATCH: "tour-packages*", COUNT: 100 })) {
            keys.push(key);
        }

        if (keys.length > 0) {
            await redisClient.del(keys);
        }
    } catch (err) {
        logger.warn({ err }, "Redis cache clear failed");
    }
};

module.exports = {
    clearPackageCache
};