const request = require("supertest");
const mongoose = require("mongoose");
const { MongoMemoryServer } = require("mongodb-memory-server");
const app = require("../app");
const { createTestAdmin, createTestUser, getAuthToken } = require("./helpers");
const TourPackage = require("../models/TourPackage");

let mongoServer;
let adminToken;
let userToken;
let testUser;
let testPackage;

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
    testUser = await createTestUser();
    userToken = getAuthToken(testUser);
    testPackage = await TourPackage.create({
        title: "Test Package",
        shortDescription: "A test tour package for testing enquiries.",
        description: "This is a detailed description of the test tour package used for testing enquiry functionality.",
        destination: "Delhi",
        category: "Domestic Tours",
        duration: "2 Days",
        price: 10000,
        createdBy: admin._id
    });
});

describe("POST /api/enquiries", () => {
    it("should create an enquiry when authenticated", async () => {
        const res = await request(app)
            .post("/api/enquiries")
            .set("Authorization", `Bearer ${userToken}`)
            .send({
                customerName: "Test User",
                customerEmail: "test@example.com",
                customerPhone: "9876543210",
                tourPackage: testPackage._id.toString(),
                travelDate: "2026-12-25",
                adults: 2,
                children: 1,
                notes: "Family trip"
            });

        expect(res.status).toBe(201);
        expect(res.body.success).toBe(true);
    });

    it("should allow a guest to create an enquiry when ALLOW_GUEST_ENQUIRIES=true", async () => {
        const previous = process.env.ALLOW_GUEST_ENQUIRIES;
        process.env.ALLOW_GUEST_ENQUIRIES = "true";

        const res = await request(app)
            .post("/api/enquiries")
            .send({
                customerName: "Guest Visitor",
                customerEmail: "guest@example.com",
                customerPhone: "9876543210",
                tourPackage: testPackage._id.toString(),
                travelDate: "2026-12-25",
                adults: 2
            });

        process.env.ALLOW_GUEST_ENQUIRIES = previous;

        expect(res.status).toBe(201);
        expect(res.body.success).toBe(true);
        expect(res.body.data.user).toBeNull();
    });

    it("should return 403 for a guest when ALLOW_GUEST_ENQUIRIES is disabled", async () => {
        const previous = process.env.ALLOW_GUEST_ENQUIRIES;
        process.env.ALLOW_GUEST_ENQUIRIES = "false";

        const res = await request(app)
            .post("/api/enquiries")
            .send({
                customerName: "Guest Visitor",
                customerEmail: "guest@example.com",
                customerPhone: "9876543210",
                tourPackage: testPackage._id.toString(),
                travelDate: "2026-12-25",
                adults: 2
            });

        process.env.ALLOW_GUEST_ENQUIRIES = previous;

        expect(res.status).toBe(403);
    });

    it("should return 400 for invalid package ID", async () => {
        const res = await request(app)
            .post("/api/enquiries")
            .set("Authorization", `Bearer ${userToken}`)
            .send({
                customerName: "Test User",
                customerEmail: "test@example.com",
                customerPhone: "9876543210",
                tourPackage: "invalid-id",
                travelDate: "2026-12-25",
                adults: 2
            });

        expect(res.status).toBe(400);
    });
});

describe("GET /api/enquiries", () => {
    beforeEach(async () => {
        await request(app)
            .post("/api/enquiries")
            .set("Authorization", `Bearer ${userToken}`)
            .send({
                customerName: "Test User",
                customerEmail: "test@example.com",
                customerPhone: "9876543210",
                tourPackage: testPackage._id.toString(),
                travelDate: "2026-12-25",
                adults: 2
            });
    });

    it("should return user's enquiries", async () => {
        const res = await request(app)
            .get("/api/enquiries")
            .set("Authorization", `Bearer ${userToken}`);

        expect(res.status).toBe(200);
        expect(Array.isArray(res.body.data)).toBe(true);
    });
});

describe("GET /api/enquiries/:id", () => {
    let enquiryId;

    beforeEach(async () => {
        const createRes = await request(app)
            .post("/api/enquiries")
            .set("Authorization", `Bearer ${userToken}`)
            .send({
                customerName: "Test User",
                customerEmail: "test@example.com",
                customerPhone: "9876543210",
                tourPackage: testPackage._id.toString(),
                travelDate: "2026-12-25",
                adults: 2
            });
        enquiryId = createRes.body.data._id;
    });

    it("should return enquiry by ID for owner", async () => {
        const res = await request(app)
            .get(`/api/enquiries/${enquiryId}`)
            .set("Authorization", `Bearer ${userToken}`);

        expect(res.status).toBe(200);
    });

    it("should return 400 for invalid ID format", async () => {
        const res = await request(app)
            .get("/api/enquiries/invalid-id")
            .set("Authorization", `Bearer ${userToken}`);

        expect(res.status).toBe(400);
    });

    it("should return 403 when accessing another user's enquiry", async () => {
        const otherUser = await createTestUser();
        const otherToken = getAuthToken(otherUser);

        const createRes = await request(app)
            .post("/api/enquiries")
            .set("Authorization", `Bearer ${userToken}`)
            .send({
                customerName: "Test User",
                customerEmail: "test@example.com",
                customerPhone: "9876543210",
                tourPackage: testPackage._id.toString(),
                travelDate: "2026-12-25",
                adults: 2
            });
        const enquiryId = createRes.body.data._id;

        const res = await request(app)
            .get(`/api/enquiries/${enquiryId}`)
            .set("Authorization", `Bearer ${otherToken}`);

        expect(res.status).toBe(403);
    });
});

describe("GET /api/admin/enquiries", () => {
    beforeEach(async () => {
        await request(app)
            .post("/api/enquiries")
            .set("Authorization", `Bearer ${userToken}`)
            .send({
                customerName: "Test User",
                customerEmail: "test@example.com",
                customerPhone: "9876543210",
                tourPackage: testPackage._id.toString(),
                travelDate: "2026-12-25",
                adults: 2
            });
    });

    it("should return all enquiries when admin", async () => {
        const res = await request(app)
            .get("/api/admin/enquiries")
            .set("Authorization", `Bearer ${adminToken}`);

        expect(res.status).toBe(200);
        expect(res.body.data.enquiries).toBeDefined();
    });

    it("should return 403 for non-admin", async () => {
        const res = await request(app)
            .get("/api/admin/enquiries")
            .set("Authorization", `Bearer ${userToken}`);

        expect(res.status).toBe(403);
    });

    it("should list guest enquiries without a linked user", async () => {
        const previous = process.env.ALLOW_GUEST_ENQUIRIES;
        process.env.ALLOW_GUEST_ENQUIRIES = "true";

        await request(app)
            .post("/api/enquiries")
            .send({
                customerName: "Guest Visitor",
                customerEmail: "guest@example.com",
                customerPhone: "9876543210",
                tourPackage: testPackage._id.toString(),
                travelDate: "2026-12-25",
                adults: 2
            });

        process.env.ALLOW_GUEST_ENQUIRIES = previous;

        const res = await request(app)
            .get("/api/admin/enquiries")
            .set("Authorization", `Bearer ${adminToken}`);

        expect(res.status).toBe(200);
        const guest = res.body.data.enquiries.find((e) => e.customerEmail === "guest@example.com");
        expect(guest).toBeDefined();
        expect(guest.user).toBeNull();
    });
});

describe("PATCH /api/admin/enquiries/:id", () => {
    let enquiryId;

    beforeEach(async () => {
        const createRes = await request(app)
            .post("/api/enquiries")
            .set("Authorization", `Bearer ${userToken}`)
            .send({
                customerName: "Test User",
                customerEmail: "test@example.com",
                customerPhone: "9876543210",
                tourPackage: testPackage._id.toString(),
                travelDate: "2026-12-25",
                adults: 2
            });
        enquiryId = createRes.body.data._id;
    });

    it("should update enquiry when admin", async () => {
        const res = await request(app)
            .patch(`/api/admin/enquiries/${enquiryId}`)
            .set("Authorization", `Bearer ${adminToken}`)
            .send({ leadStatus: "Contacted", priority: "High" });

        expect(res.status).toBe(200);
        expect(res.body.data.leadStatus).toBe("Contacted");
    });

    it("should return 403 for non-admin", async () => {
        const res = await request(app)
            .patch(`/api/admin/enquiries/${enquiryId}`)
            .set("Authorization", `Bearer ${userToken}`)
            .send({ leadStatus: "Contacted" });

        expect(res.status).toBe(403);
    });
});
