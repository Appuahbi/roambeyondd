const { createClient } = require("redis");
const logger = require("./logger");

const redisClient = createClient({

    url: process.env.REDIS_URL || "redis://localhost:6379",
    legacyMode: true,
    RESP: 2

});

redisClient.on("connect", () => {

    logger.info("Redis Connected");

});

redisClient.on("error", (error) => {

    logger.error({ err: error }, "Redis Error");

});

const connectRedis = async () => {

    if (!redisClient.isOpen) {

        await redisClient.connect();

    }

};

module.exports = {

    redisClient,

    connectRedis

};