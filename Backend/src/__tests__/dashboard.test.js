const request = require("supertest");
const mongoose = require("mongoose");
const { MongoMemoryServer } = require("mongodb-memory-server");
const app = require("../app");
const { createTestAdmin, createTestUser, getAuthToken } = require("./helpers");

let mongoServer;
let adminToken;
let userToken;

beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    await mongoose.connect(mongoServer.getUri());
});

afterAll(async () => {
    await mongoose.disconnect();
    if (mongoServer) await mongoServer.stop();
});

beforeEach(async () => {
    const collections = mongoose.connection.collections;
    for (const key in collections) {
        await collections[key].deleteMany({});
    }
    const admin = await createTestAdmin();
    adminToken = getAuthToken(admin);
    const user = await createTestUser();
    userToken = getAuthToken(user);
});

describe("GET /api/admin/dashboard", () => {
    it("should return dashboard stats when admin", async () => {
        const res = await request(app)
            .get("/api/admin/dashboard")
            .set("Authorization", `Bearer ${adminToken}`);

        expect(res.status).toBe(200);
        expect(res.body.success).toBe(true);
        expect(res.body.data.summary).toBeDefined();
        expect(res.body.data.recentEnquiries).toBeDefined();
        expect(res.body.data.categoryStats).toBeDefined();
        expect(res.body.data.monthlyTrend).toBeDefined();
    });

    it("should return 403 for non-admin", async () => {
        const res = await request(app)
            .get("/api/admin/dashboard")
            .set("Authorization", `Bearer ${userToken}`);

        expect(res.status).toBe(403);
    });

    it("should return 401 without auth", async () => {
        const res = await request(app).get("/api/admin/dashboard");

        expect(res.status).toBe(401);
    });
});
