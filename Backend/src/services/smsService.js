const crypto = require("crypto");
const logger = require("../config/logger");
const AppError = require("../utils/AppError");
const { redisClient } = require("../config/redis");
const { getTwilioClient, normalizePhone } = require("../config/twilio");

const OTP_TTL = Number(process.env.OTP_TTL_SECONDS) || 300;
const OTP_MAX_ATTEMPTS = Number(process.env.OTP_MAX_ATTEMPTS) || 5;

/*
OTP keys are single-use and validated on the server against the stored hash.
The SMS itself is sent on an in-process queue (same pattern as emailService)
so Twilio latency never blocks request handling.
*/
const queue = [];
let processing = false;

const processQueue = async () => {
    if (processing) return;
    processing = true;

    while (queue.length > 0) {
        const { to, message } = queue.shift();
        try {
            const client = getTwilioClient();
            if (!client) {
                logger.info({ to, message }, "SMS mock mode: SMS would be sent (no Twilio credentials)");
                continue;
            }
            await client.messages.create({
                to,
                from: process.env.TWILIO_PHONE_NUMBER,
                body: message
            });
        } catch (err) {
            logger.error({ err, to, message }, "Failed to send SMS");
        }
    }

    processing = false;
};

const sendSms = ({ to, message }) => {
    queue.push({ to, message });
    processQueue();
    return Promise.resolve();
};

const generateOtp = () => {
    const code = crypto.randomInt(0, 1000000).toString().padStart(6, "0");
    return code;
};

const hashOtp = (otp) => crypto.createHash("sha256").update(otp).digest("hex");

const safeEqual = (a, b) => {
    const bufA = Buffer.from(a, "utf8");
    const bufB = Buffer.from(b, "utf8");
    if (bufA.length !== bufB.length) return false;
    return crypto.timingSafeEqual(bufA, bufB);
};

const otpKey = (purpose, phone) => `otp:${purpose}:${phone}`;

const storeOtp = async (purpose, phone, otp) => {
    const payload = JSON.stringify({
        hash: hashOtp(otp),
        attempts: 0,
        expiresAt: Date.now() + OTP_TTL * 1000
    });
    await redisClient.setEx(otpKey(purpose, phone), OTP_TTL, payload);
};

const remainingTtl = (expiresAt) => Math.max(1, Math.ceil((expiresAt - Date.now()) / 1000));

const sendOtp = async (phone, purpose) => {
    const otp = generateOtp();
    const e164 = normalizePhone(phone);

    try {
        await storeOtp(purpose, phone, otp);
    } catch (err) {
        logger.warn({ err }, "Redis unavailable, cannot store OTP");
        throw new AppError("Service temporarily unavailable. Please try again later.", 503);
    }

    const message = `Your Roam Beyond verification code is ${otp}. It is valid for ${Math.round(OTP_TTL / 60)} minutes. Do not share it with anyone.`;

    try {
        await sendSms({ to: e164, message });
    } catch (err) {
        logger.warn({ err }, "Failed to queue OTP SMS");
    }

    return { maskedPhone: `+91****${phone.slice(-4)}` };
};

const verifyOtp = async (phone, purpose, otp) => {
    const key = otpKey(purpose, phone);

    let stored;
    try {
        stored = await redisClient.get(key);
    } catch (err) {
        logger.warn({ err }, "Redis unavailable, cannot verify OTP");
        throw new AppError("Service temporarily unavailable. Please try again later.", 503);
    }

    if (!stored) {
        throw new AppError("Invalid or expired OTP. Please request a new one.", 400);
    }

    let record;
    try {
        record = JSON.parse(stored);
    } catch (err) {
        throw new AppError("Invalid or expired OTP. Please request a new one.", 400);
    }

    if (record.attempts >= OTP_MAX_ATTEMPTS) {
        try {
            await redisClient.del(key);
        } catch (err) {
            logger.warn({ err }, "Failed to clear exhausted OTP");
        }
        throw new AppError("Too many incorrect attempts. Please request a new OTP.", 400);
    }

    if (!safeEqual(record.hash, hashOtp(String(otp)))) {
        record.attempts += 1;
        try {
            await redisClient.setEx(key, remainingTtl(record.expiresAt), JSON.stringify(record));
        } catch (err) {
            logger.warn({ err }, "Failed to increment OTP attempt counter");
        }
        throw new AppError("Invalid or expired OTP. Please request a new one.", 400);
    }

    // OTP matched — single use
    try {
        await redisClient.del(key);
    } catch (err) {
        logger.warn({ err }, "Failed to consume OTP");
    }

    return true;
};

module.exports = {
    sendOtp,
    verifyOtp,
    sendSms,
    generateOtp
};
