process.env.NODE_ENV = "test";
process.env.JWT_SECRET = "test-secret-key-for-jwt-that-is-at-least-32-chars";
process.env.JWT_EXPIRE = "1h";
process.env.BCRYPT_SALT_ROUNDS = "4";
process.env.MONGO_URI = "mongodb://localhost:27017/test";
process.env.CORS_ORIGIN = "http://localhost:3000";
process.env.SMTP_HOST = "smtp.test.com";
process.env.SMTP_PORT = "587";
process.env.SMTP_USER = "test@test.com";
process.env.SMTP_PASS = "testpass";
process.env.SMTP_FROM = "noreply@test.com";
process.env.CLOUDINARY_CLOUD_NAME = "test-cloud";
process.env.CLOUDINARY_API_KEY = "test-key";
process.env.CLOUDINARY_API_SECRET = "test-secret";
process.env.FRONTEND_URL = "http://localhost:3000";
process.env.LOG_LEVEL = "silent";

jest.mock("../config/redis", () => ({
    redisClient: {
        get: jest.fn().mockResolvedValue(null),
        set: jest.fn().mockResolvedValue("OK"),
        setEx: jest.fn().mockResolvedValue("OK"),
        del: jest.fn().mockResolvedValue(1),
        isOpen: true,
        connect: jest.fn().mockResolvedValue(undefined),
        quit: jest.fn().mockResolvedValue(undefined),
        scanIterator: jest.fn(() => (async function* () {})()),
        on: jest.fn()
    },
    connectRedis: jest.fn().mockResolvedValue(undefined)
}));

jest.mock("../config/email", () => ({
    sendMail: jest.fn().mockResolvedValue({ messageId: "test-message-id" })
}));

jest.mock("../config/cloudinary", () => ({
    cloudinary: {},
    uploadToCloudinary: jest.fn().mockResolvedValue({
        url: "https://test.cloudinary.com/test.jpg",
        publicId: "test/public-id"
    }),
    deleteFromCloudinary: jest.fn().mockResolvedValue(undefined)
}));

jest.mock("pino-http", () => {
    const httpLogger = jest.fn(() => (req, res, next) => next());
    return httpLogger;
});

jest.mock("express-rate-limit", () => {
    return jest.fn(() => (req, res, next) => next());
});

jest.mock("../config/logger", () => ({
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
    fatal: jest.fn()
}));
