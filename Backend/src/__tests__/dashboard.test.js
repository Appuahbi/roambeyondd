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
        expect(res.body.data.leadSourceStats).toBeDefined();
        expect(res.body.data.topDestinations).toBeDefined();
        expect(res.body.data.ratingDistribution).toBeDefined();
        expect(res.body.data.activityTrend).toBeDefined();

        expect(res.body.data.summary.packages).toBeDefined();
        expect(res.body.data.summary.blogs).toBeDefined();
        expect(res.body.data.summary.subscribers).toBeDefined();
        expect(res.body.data.summary.users).toBeDefined();
        expect(res.body.data.summary.tripRequests).toBeDefined();
        expect(res.body.data.summary.contactRequests).toBeDefined();
        expect(res.body.data.summary.reviewsApproved).toBeDefined();
        expect(res.body.data.summary.reviewsPending).toBeDefined();

        expect(res.body.data.activityTrend).toHaveLength(12);
        expect(res.body.data.activityTrend[0]).toHaveProperty("key");
        expect(res.body.data.activityTrend[0]).toHaveProperty("label");
        expect(res.body.data.activityTrend[0]).toHaveProperty("enquiries");
        expect(res.body.data.activityTrend[0]).toHaveProperty("tripRequests");
        expect(res.body.data.activityTrend[0]).toHaveProperty("contactRequests");

        expect(res.body.data.ratingDistribution).toHaveLength(5);
        expect(res.body.data.ratingDistribution.map((r) => r.rating)).toEqual([1, 2, 3, 4, 5]);
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
