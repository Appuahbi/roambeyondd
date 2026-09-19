const request = require("supertest");
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const { MongoMemoryServer } = require("mongodb-memory-server");
const app = require("../app");
const { createTestUser, createTestAdmin, getAuthToken } = require("./helpers");
const User = require("../models/User");

jest.mock("../services/emailService");
jest.mock("../services/smsService");
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
});

describe("POST /api/auth/login", () => {
    it("should login an admin and set the auth cookie", async () => {
        const admin = await createTestAdmin({ email: "admin@roambeyond.in" });

        const res = await request(app)
            .post("/api/auth/login")
            .send({ email: "admin@roambeyond.in", password: "Password1" });

        expect(res.status).toBe(200);
        expect(res.body.success).toBe(true);
        expect(res.body.data.user.email).toBe(admin.email);
        expect(res.body.data.user.role).toBe("admin");
        expect(res.headers["set-cookie"]).toBeDefined();
    });

    it("should login an agent", async () => {
        const agent = await createTestUser({
            email: "agent@roambeyond.in",
            role: "agent"
        });

        const res = await request(app)
            .post("/api/auth/login")
            .send({ email: "agent@roambeyond.in", password: "Password1" });

        expect(res.status).toBe(200);
        expect(res.body.data.user.role).toBe(agent.role);
    });

    it("should reject invalid credentials with 401", async () => {
        await createTestAdmin({ email: "admin@roambeyond.in" });

        const res = await request(app)
            .post("/api/auth/login")
            .send({ email: "admin@roambeyond.in", password: "WrongPass1" });

        expect(res.status).toBe(401);
        expect(res.body.success).toBe(false);
    });

    it("should return 401 for an unregistered email", async () => {
        const res = await request(app)
            .post("/api/auth/login")
            .send({ email: "ghost@example.com", password: "Password1" });

        expect(res.status).toBe(401);
        expect(res.body.success).toBe(false);
    });

    it("should reject requests with missing/invalid email", async () => {
        const res = await request(app)
            .post("/api/auth/login")
            .send({ password: "Password1" });

        expect(res.status).toBe(400);
        expect(res.body.success).toBe(false);
    });

    it("should reject requests with a missing password", async () => {
        const res = await request(app)
            .post("/api/auth/login")
            .send({ email: "admin@roambeyond.in" });

        expect(res.status).toBe(400);
        expect(res.body.success).toBe(false);
    });
});

describe("GET /api/auth/me", () => {
    it("should return the profile for an authenticated staff user", async () => {
        const admin = await createTestAdmin();
        const res = await request(app)
            .get("/api/auth/me")
            .set("Authorization", `Bearer ${getAuthToken(admin)}`);

        expect(res.status).toBe(200);
        expect(res.body.data.user.email).toBe(admin.email);
        expect(res.body.data.user.role).toBe("admin");
    });

    it("should return 401 when no token is provided", async () => {
        const res = await request(app).get("/api/auth/me");

        expect(res.status).toBe(401);
        expect(res.body.success).toBe(false);
    });

    it("should return 401 for an invalid token", async () => {
        const res = await request(app)
            .get("/api/auth/me")
            .set("Authorization", "Bearer not-a-real-token");

        expect(res.status).toBe(401);
        expect(res.body.success).toBe(false);
    });
});

describe("GET /api/auth/admin", () => {
    it("should return 200 with welcome message for admin", async () => {
        const admin = await createTestAdmin();
        const res = await request(app)
            .get("/api/auth/admin")
            .set("Authorization", `Bearer ${getAuthToken(admin)}`);

        expect(res.status).toBe(200);
        expect(res.body.success).toBe(true);
        expect(res.body.message).toBe("Welcome Admin!");
    });

    it("should return 403 for non-admin staff", async () => {
        const agent = await createTestUser({ role: "agent" });
        const res = await request(app)
            .get("/api/auth/admin")
            .set("Authorization", `Bearer ${getAuthToken(agent)}`);

        expect(res.status).toBe(403);
        expect(res.body.success).toBe(false);
    });

    it("should return 401 without a token", async () => {
        const res = await request(app).get("/api/auth/admin");

        expect(res.status).toBe(401);
        expect(res.body.success).toBe(false);
    });
});

describe("PATCH /api/auth/change-password", () => {
    it("should change the password successfully and re-issue a cookie", async () => {
        const admin = await createTestAdmin();
        const res = await request(app)
            .patch("/api/auth/change-password")
            .set("Authorization", `Bearer ${getAuthToken(admin)}`)
            .send({ currentPassword: "Password1", newPassword: "NewPass@456" });

        expect(res.status).toBe(200);
        expect(res.body.success).toBe(true);
        expect(res.headers["set-cookie"]).toBeDefined();

        const fresh = await User.findById(admin._id).select("+password");
        expect(await fresh.comparePassword("NewPass@456")).toBe(true);
    });

    it("should return 401 when the current password is wrong", async () => {
        const admin = await createTestAdmin();
        const res = await request(app)
            .patch("/api/auth/change-password")
            .set("Authorization", `Bearer ${getAuthToken(admin)}`)
            .send({ currentPassword: "WrongPass1", newPassword: "NewPass@456" });

        expect(res.status).toBe(401);
        expect(res.body.success).toBe(false);
    });

    it("should return 400 when the new password is too weak", async () => {
        const admin = await createTestAdmin();
        const res = await request(app)
            .patch("/api/auth/change-password")
            .set("Authorization", `Bearer ${getAuthToken(admin)}`)
            .send({ currentPassword: "Password1", newPassword: "short" });

        expect(res.status).toBe(400);
        expect(res.body.success).toBe(false);
    });
});

describe("POST /api/auth/logout", () => {
    it("should logout a logged-in user", async () => {
        const admin = await createTestAdmin();
        const token = jwt.sign({ id: admin._id, role: admin.role }, process.env.JWT_SECRET, { expiresIn: "1h" });

        const res = await request(app)
            .post("/api/auth/logout")
            .set("Authorization", `Bearer ${token}`);

        expect(res.status).toBe(200);
        expect(res.body.success).toBe(true);
    });

    it("should blacklist the token so it can no longer be used", async () => {
        const admin = await createTestAdmin();
        const token = getAuthToken(admin);

        await request(app)
            .post("/api/auth/logout")
            .set("Authorization", `Bearer ${token}`);

        const me = await request(app)
            .get("/api/auth/me")
            .set("Authorization", `Bearer ${token}`);

        expect(me.status).toBe(401);
        expect(me.body.success).toBe(false);
    });

    it("should return 401 without a token", async () => {
        const res = await request(app).post("/api/auth/logout");

        expect(res.status).toBe(401);
        expect(res.body.success).toBe(false);
    });
});