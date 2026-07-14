const { redisClient } = require("../config/redis");

const clearPackageCache = async () => {
    try {
        const keys = await redisClient.keys("tour-package:*");
        const listKeys = await redisClient.keys("tour-packages:*");
        const allKeys = [...keys, ...listKeys];

        if (allKeys.length > 0) {
            await redisClient.del(allKeys);
        }
    } catch (err) {
        console.warn("Redis cache clear failed:", err.message);
    }
};

module.exports = {
    clearPackageCache
};