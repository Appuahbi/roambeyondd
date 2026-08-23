const request = require("supertest");
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const { MongoMemoryServer } = require("mongodb-memory-server");
const app = require("../app");
const { createTestUser, getAuthToken } = require("./helpers");
const User = require("../models/User");

jest.mock("../services/emailService");
const emailService = require("../services/emailService");

jest.mock("../services/smsService");
const smsService = require("../services/smsService");
const { redisClient } = require("../config/redis");

let mongoServer;

beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    await mongoose.connect(mongoServer.getUri());
});

afterAll(async () => {
    await mongoose.disconnect();
    if (mongoServer) await mongoServer.stop();
});

let redisStore;

beforeEach(async () => {
    const collections = mongoose.connection.collections;
    for (const key in collections) {
        await collections[key].deleteMany({});
    }

    redisStore = {};
    redisClient.get.mockImplementation(async (key) => redisStore[key] || null);
    redisClient.setEx.mockImplementation(async (key, ttl, value) => {
        redisStore[key] = value;
        return "OK";
    });
    redisClient.set.mockImplementation(async (key, value) => {
        redisStore[key] = value;
        return "OK";
    });
    redisClient.del.mockImplementation(async (key) => {
        delete redisStore[key];
        return 1;
    });

    emailService.sendVerificationEmail.mockClear();
    emailService.sendPasswordResetEmail.mockClear();

    smsService.sendOtp.mockResolvedValue({ maskedPhone: "+91****3210" });
    smsService.verifyOtp.mockResolvedValue(true);
    smsService.sendSms.mockResolvedValue(true);
});

describe("POST /api/auth/register", () => {
    it("should register a new user successfully", async () => {
        const res = await request(app)
            .post("/api/auth/register")
            .send({
                name: "Test User",
                email: "test@example.com",
                phone: "9876543210",
                password: "Password1",
                otp: "123456"
            });

        expect(res.status).toBe(201);
        expect(res.body.success).toBe(true);
        expect(res.body.data.token).toBeDefined();
        expect(res.body.data.user.email).toBe("test@example.com");
        expect(res.body.data.user.password).toBeUndefined();
    });

    it("should return 409 for duplicate email", async () => {
        await request(app)
            .post("/api/auth/register")
            .send({
                name: "Test User",
                email: "test@example.com",
                phone: "9876543210",
                password: "Password1",
                otp: "123456"
            });

        const res = await request(app)
            .post("/api/auth/register")
            .send({
                name: "Test User 2",
                email: "test@example.com",
                phone: "9876543211",
                password: "Password1",
                otp: "123456"
            });

        expect(res.status).toBe(409);
    });

    it("should return 400 for invalid email", async () => {
        const res = await request(app)
            .post("/api/auth/register")
            .send({
                name: "Test User",
                email: "invalid-email",
                phone: "9876543210",
                password: "Password1",
                otp: "123456"
            });

        expect(res.status).toBe(400);
    });

    it("should return 400 for weak password", async () => {
        const res = await request(app)
            .post("/api/auth/register")
            .send({
                name: "Test User",
                email: "test@example.com",
                phone: "9876543210",
                password: "weak",
                otp: "123456"
            });

        expect(res.status).toBe(400);
    });

    it("should return 400 for invalid phone number", async () => {
        const res = await request(app)
            .post("/api/auth/register")
            .send({
                name: "Test User",
                email: "test@example.com",
                phone: "12345",
                password: "Password1",
                otp: "123456"
            });

        expect(res.status).toBe(400);
    });

    it("should return 400 for missing/invalid OTP", async () => {
        const res = await request(app)
            .post("/api/auth/register")
            .send({
                name: "Test User",
                email: "test@example.com",
                phone: "9876543210",
                password: "Password1",
                otp: "12ab"
            });

        expect(res.status).toBe(400);
    });

    it("should not create a user when OTP verification fails", async () => {
        smsService.verifyOtp.mockRejectedValueOnce(
            Object.assign(
                new Error("Invalid or expired OTP. Please request a new one."),
                { statusCode: 400, isOperational: true }
            )
        );

        const res = await request(app)
            .post("/api/auth/register")
            .send({
                name: "Test User",
                email: "otpfail@example.com",
                phone: "9876543215",
                password: "Password1",
                otp: "654321"
            });

        expect(res.status).toBe(400);
        expect(await User.findOne({ email: "otpfail@example.com" })).toBeNull();
    });
});

describe("POST /api/auth/login", () => {
    beforeEach(async () => {
        await request(app)
            .post("/api/auth/register")
            .send({
                name: "Test User",
                email: "test@example.com",
                phone: "9876543210",
                password: "Password1",
                otp: "123456"
            });
    });

    it("should login successfully with correct credentials", async () => {
        const res = await request(app)
            .post("/api/auth/login")
            .send({
                email: "test@example.com",
                password: "Password1"
            });

        expect(res.status).toBe(200);
        expect(res.body.success).toBe(true);
        expect(res.body.data.token).toBeDefined();
    });

    it("should return 401 for wrong password", async () => {
        const res = await request(app)
            .post("/api/auth/login")
            .send({
                email: "test@example.com",
                password: "WrongPassword1"
            });

        expect(res.status).toBe(401);
    });

    it("should return 401 for non-existent email", async () => {
        const res = await request(app)
            .post("/api/auth/login")
            .send({
                email: "nonexistent@example.com",
                password: "Password1"
            });

        expect(res.status).toBe(401);
    });
});

describe("POST /api/auth/otp/send", () => {
    it("should send an OTP for register purpose", async () => {
        const res = await request(app)
            .post("/api/auth/otp/send")
            .send({ phone: "9876543210", purpose: "register" });

        expect(res.status).toBe(200);
        expect(res.body.success).toBe(true);
        expect(smsService.sendOtp).toHaveBeenCalledWith("9876543210", "register");
    });

    it("should return 409 when phone already registered", async () => {
        await createTestUser({ phone: "9876543222" });

        const res = await request(app)
            .post("/api/auth/otp/send")
            .send({ phone: "9876543222", purpose: "register" });

        expect(res.status).toBe(409);
    });

    it("should return 404 when no account exists for login purpose", async () => {
        const res = await request(app)
            .post("/api/auth/otp/send")
            .send({ phone: "9876543223", purpose: "login" });

        expect(res.status).toBe(404);
    });

    it("should return 400 for invalid purpose", async () => {
        const res = await request(app)
            .post("/api/auth/otp/send")
            .send({ phone: "9876543210", purpose: "banana" });

        expect(res.status).toBe(400);
    });
});

describe("POST /api/auth/phone-login", () => {
    it("should log in with a valid phone + OTP", async () => {
        await createTestUser({ phone: "9876543300" });

        const res = await request(app)
            .post("/api/auth/phone-login")
            .send({ phone: "9876543300", otp: "123456" });

        expect(res.status).toBe(200);
        expect(res.body.success).toBe(true);
        expect(res.body.data.token).toBeDefined();
        expect(res.body.data.user.phone).toBe("9876543300");
        expect(smsService.verifyOtp).toHaveBeenCalledWith("9876543300", "login", "123456");
    });

    it("should return 400 when OTP is invalid", async () => {
        await createTestUser({ phone: "9876543301" });

        smsService.verifyOtp.mockRejectedValueOnce(
            Object.assign(
                new Error("Invalid or expired OTP. Please request a new one."),
                { statusCode: 400, isOperational: true }
            )
        );

        const res = await request(app)
            .post("/api/auth/phone-login")
            .send({ phone: "9876543301", otp: "000000" });

        expect(res.status).toBe(400);
    });

    it("should return 400 for invalid OTP format", async () => {
        const res = await request(app)
            .post("/api/auth/phone-login")
            .send({ phone: "9876543301", otp: "12ab" });

        expect(res.status).toBe(400);
    });
});

describe("POST /api/auth/otp/verify (SMS password reset)", () => {
    it("should return a reset token for a valid OTP", async () => {
        await createTestUser({ phone: "9876543400" });

        const res = await request(app)
            .post("/api/auth/otp/verify")
            .send({ phone: "9876543400", otp: "123456", purpose: "reset" });

        expect(res.status).toBe(200);
        expect(res.body.data.token).toBeDefined();
        expect(smsService.verifyOtp).toHaveBeenCalledWith("9876543400", "reset", "123456");
    });

    it("should complete an SMS-based password reset", async () => {
        const user = await createTestUser({ phone: "9876543401" });

        const verifyRes = await request(app)
            .post("/api/auth/otp/verify")
            .send({ phone: "9876543401", otp: "123456", purpose: "reset" });

        expect(verifyRes.status).toBe(200);
        const resetToken = verifyRes.body.data.token;

        const resetRes = await request(app)
            .post("/api/auth/reset-password")
            .send({ token: resetToken, newPassword: "NewPassword1" });

        expect(resetRes.status).toBe(200);

        // New password should now work for the user's email
        const login = await request(app)
            .post("/api/auth/login")
            .send({ email: user.email, password: "NewPassword1" });

        expect(login.status).toBe(200);
    });

    it("should return 404 when phone has no account", async () => {
        const res = await request(app)
            .post("/api/auth/otp/verify")
            .send({ phone: "9876543402", otp: "123456", purpose: "reset" });

        expect(res.status).toBe(404);
    });

    it("should return 400 for invalid purpose", async () => {
        const res = await request(app)
            .post("/api/auth/otp/verify")
            .send({ phone: "9876543400", otp: "123456", purpose: "register" });

        expect(res.status).toBe(400);
    });
});

describe("GET /api/auth/me", () => {
    let token;
    let user;

    beforeEach(async () => {
        user = await createTestUser();
        token = getAuthToken(user);
    });

    it("should return user profile when authenticated", async () => {
        const res = await request(app)
            .get("/api/auth/me")
            .set("Authorization", `Bearer ${token}`);

        expect(res.status).toBe(200);
        expect(res.body.data.user.email).toBe(user.email);
    });

    it("should return 401 without token", async () => {
        const res = await request(app).get("/api/auth/me");

        expect(res.status).toBe(401);
    });

    it("should return 401 with invalid token", async () => {
        const res = await request(app)
            .get("/api/auth/me")
            .set("Authorization", "Bearer invalidtoken");

        expect(res.status).toBe(401);
    });
});

describe("PATCH /api/auth/change-password", () => {
    let token;

    beforeEach(async () => {
        const user = await createTestUser();
        token = getAuthToken(user);
    });

    it("should change password successfully", async () => {
        const res = await request(app)
            .patch("/api/auth/change-password")
            .set("Authorization", `Bearer ${token}`)
            .send({
                currentPassword: "Password1",
                newPassword: "NewPassword1"
            });

        expect(res.status).toBe(200);
        expect(res.body.success).toBe(true);
    });

    it("should return 401 for wrong current password", async () => {
        const res = await request(app)
            .patch("/api/auth/change-password")
            .set("Authorization", `Bearer ${token}`)
            .send({
                currentPassword: "WrongPassword1",
                newPassword: "NewPassword1"
            });

        expect(res.status).toBe(401);
    });
});

describe("POST /api/auth/logout", () => {
    let token;

    beforeEach(async () => {
        const user = await createTestUser();
        token = getAuthToken(user);
    });

    it("should logout successfully", async () => {
        const res = await request(app)
            .post("/api/auth/logout")
            .set("Authorization", `Bearer ${token}`);

        expect(res.status).toBe(200);
        expect(res.body.success).toBe(true);
    });
});

describe("POST /api/auth/forgot-password", () => {
    it("should return success for registered email", async () => {
        await createTestUser({ email: "forgot@example.com" });

        const res = await request(app)
            .post("/api/auth/forgot-password")
            .send({ email: "forgot@example.com" });

        expect(res.status).toBe(200);
        expect(res.body.success).toBe(true);
        expect(emailService.sendPasswordResetEmail).toHaveBeenCalled();
    });

    it("should return success for non-existent email (no leak)", async () => {
        const res = await request(app)
            .post("/api/auth/forgot-password")
            .send({ email: "nonexistent@example.com" });

        expect(res.status).toBe(200);
        expect(res.body.success).toBe(true);
    });

    it("should return 400 for invalid email format", async () => {
        const res = await request(app)
            .post("/api/auth/forgot-password")
            .send({ email: "not-an-email" });

        expect(res.status).toBe(400);
    });
});

describe("POST /api/auth/reset-password", () => {
    it("should reset password with valid token", async () => {
        await createTestUser({ email: "reset@example.com" });

        await request(app)
            .post("/api/auth/forgot-password")
            .send({ email: "reset@example.com" });

        const rawToken = emailService.sendPasswordResetEmail.mock.calls[0][1];

        const res = await request(app)
            .post("/api/auth/reset-password")
            .send({
                token: rawToken,
                newPassword: "NewPassword1"
            });

        expect(res.status).toBe(200);
        expect(res.body.success).toBe(true);

        const loginRes = await request(app)
            .post("/api/auth/login")
            .send({ email: "reset@example.com", password: "NewPassword1" });

        expect(loginRes.status).toBe(200);
    });

    it("should return 400 for invalid token", async () => {
        const fakeToken = "a".repeat(64);

        const res = await request(app)
            .post("/api/auth/reset-password")
            .send({
                token: fakeToken,
                newPassword: "NewPassword1"
            });

        expect(res.status).toBe(400);
    });

    it("should return 400 for weak new password", async () => {
        await createTestUser({ email: "weak@example.com" });

        await request(app)
            .post("/api/auth/forgot-password")
            .send({ email: "weak@example.com" });

        const rawToken = emailService.sendPasswordResetEmail.mock.calls[0][1];

        const res = await request(app)
            .post("/api/auth/reset-password")
            .send({
                token: rawToken,
                newPassword: "weak"
            });

        expect(res.status).toBe(400);
    });
});

describe("GET /api/auth/verify-email", () => {
    it("should verify email with valid token", async () => {
        await request(app)
            .post("/api/auth/register")
            .send({
                name: "Verify User",
                email: "verify@example.com",
                phone: "9876543211",
                password: "Password1",
                otp: "123456"
            });

        const rawToken = emailService.sendVerificationEmail.mock.calls[0][1];

        const res = await request(app)
            .get(`/api/auth/verify-email?token=${rawToken}`);

        expect(res.status).toBe(200);
        expect(res.body.success).toBe(true);
    });

    it("should return 400 for invalid token", async () => {
        const fakeToken = "b".repeat(64);

        const res = await request(app)
            .get(`/api/auth/verify-email?token=${fakeToken}`);

        expect(res.status).toBe(400);
    });
});

describe("POST /api/auth/resend-verification", () => {
    it("should resend verification for unverified user", async () => {
        const user = await createTestUser({ isVerified: false });
        const token = getAuthToken(user);

        const res = await request(app)
            .post("/api/auth/resend-verification")
            .set("Authorization", `Bearer ${token}`);

        expect(res.status).toBe(200);
        expect(emailService.sendVerificationEmail).toHaveBeenCalled();
    });

    it("should return success for already verified user", async () => {
        const user = await createTestUser({ isVerified: true });
        const token = getAuthToken(user);

        const res = await request(app)
            .post("/api/auth/resend-verification")
            .set("Authorization", `Bearer ${token}`);

        expect(res.status).toBe(200);
    });

    it("should return 401 without auth", async () => {
        const res = await request(app)
            .post("/api/auth/resend-verification");

        expect(res.status).toBe(401);
    });
});

describe("Token security", () => {
    it("should reject token issued before password change", async () => {
        const user = await createTestUser();
        const oldToken = jwt.sign(
            { id: user._id, role: user.role, iat: Math.floor(Date.now() / 1000) - 10 },
            process.env.JWT_SECRET,
            { expiresIn: "1h" }
        );

        await User.findByIdAndUpdate(user._id, {
            passwordChangedAt: new Date(Date.now() + 5000)
        });

        const res = await request(app)
            .get("/api/auth/me")
            .set("Authorization", `Bearer ${oldToken}`);

        expect(res.status).toBe(401);
    });

    it("should reject blacklisted token after logout", async () => {
        const user = await createTestUser();
        const token = getAuthToken(user);

        await request(app)
            .post("/api/auth/logout")
            .set("Authorization", `Bearer ${token}`);

        const res = await request(app)
            .get("/api/auth/me")
            .set("Authorization", `Bearer ${token}`);

        expect(res.status).toBe(401);
    });
});
