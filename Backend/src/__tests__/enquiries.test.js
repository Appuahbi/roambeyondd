const request = require("supertest");
const mongoose = require("mongoose");
const { MongoMemoryServer } = require("mongodb-memory-server");
const app = require("../app");
const { createTestAdmin, createTestUser, getAuthToken } = require("./helpers");
const TourPackage = require("../models/TourPackage");

jest.mock("../services/emailService");
const emailService = require("../services/emailService");

let mongoServer;
let adminToken;
let testUser;
let userToken;
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
    emailService.sendNewEnquiryAlert.mockClear();
});

const enquiryPayload = (overrides = {}) => ({
    customerName: "Test User",
    customerEmail: "test@example.com",
    customerPhone: "9876543210",
    tourPackage: testPackage._id.toString(),
    travelDate: "2026-12-25",
    adults: 2,
    children: 1,
    notes: "Family trip",
    ...overrides
});

describe("POST /api/enquiries (public)", () => {
    it("should create an enquiry as a guest without authentication", async () => {
        const res = await request(app)
            .post("/api/enquiries")
            .send(enquiryPayload({ customerEmail: "guest@example.com" }));

        expect(res.status).toBe(201);
        expect(res.body.success).toBe(true);
        expect(res.body.data.user).toBeNull();
        expect(res.body.data.customerEmail).toBe("guest@example.com");
    });

    it("should create an enquiry for a logged-in user", async () => {
        const res = await request(app)
            .post("/api/enquiries")
            .set("Authorization", `Bearer ${userToken}`)
            .send(enquiryPayload());

        expect(res.status).toBe(201);
        expect(res.body.success).toBe(true);
    });

    it("should return 400 for an invalid package ID", async () => {
        const res = await request(app)
            .post("/api/enquiries")
            .send(enquiryPayload({ tourPackage: "invalid-id" }));

        expect(res.status).toBe(400);
        expect(res.body.success).toBe(false);
    });

    it("should return 404 for a non-existent package", async () => {
        const res = await request(app)
            .post("/api/enquiries")
            .send(enquiryPayload({ tourPackage: "6864c31ad45b0d1234567890" }));

        expect(res.status).toBe(404);
        expect(res.body.success).toBe(false);
    });

    it("should return 400 when required fields are missing", async () => {
        const res = await request(app)
            .post("/api/enquiries")
            .send({ customerEmail: "test@example.com" });

        expect(res.status).toBe(400);
        expect(res.body.success).toBe(false);
    });
});

describe("GET /api/enquiries/lookup (public)", () => {
    it("should find an enquiry by email", async () => {
        await request(app)
            .post("/api/enquiries")
            .send(enquiryPayload({ customerEmail: "rahul@example.com" }));

        const res = await request(app)
            .get("/api/enquiries/lookup")
            .query({ email: "rahul@example.com" });

        expect(res.status).toBe(200);
        expect(res.body.success).toBe(true);
        expect(res.body.data.customerEmail).toBe("rahul@example.com");
    });

    it("should find an enquiry by phone", async () => {
        await request(app)
            .post("/api/enquiries")
            .send(enquiryPayload({ customerPhone: "9876500000" }));

        const res = await request(app)
            .get("/api/enquiries/lookup")
            .query({ phone: "9876543210" });

        expect(res.status).toBe(404);

        const found = await request(app)
            .get("/api/enquiries/lookup")
            .query({ phone: "9876500000" });

        expect(found.status).toBe(200);
        expect(found.body.data.customerPhone).toBe("9876500000");
    });

    it("should find an enquiry by enquiry number", async () => {
        const createRes = await request(app)
            .post("/api/enquiries")
            .send(enquiryPayload());

        const res = await request(app)
            .get("/api/enquiries/lookup")
            .query({ enquiryNumber: createRes.body.data.enquiryNumber });

        expect(res.status).toBe(200);
        expect(res.body.data.enquiryNumber).toBe(createRes.body.data.enquiryNumber);
    });

    it("should return 404 when no enquiry matches", async () => {
        const res = await request(app)
            .get("/api/enquiries/lookup")
            .query({ email: "nobody@example.com" });

        expect(res.status).toBe(404);
        expect(res.body.success).toBe(false);
    });

    it("should return 400 when no lookup fields are provided", async () => {
        const res = await request(app).get("/api/enquiries/lookup");

        expect(res.status).toBe(400);
        expect(res.body.success).toBe(false);
    });
});

describe("GET /api/admin/enquiries", () => {
    beforeEach(async () => {
        await request(app)
            .post("/api/enquiries")
            .send(enquiryPayload());
    });

    it("should return all enquiries when admin", async () => {
        const res = await request(app)
            .get("/api/admin/enquiries")
            .set("Authorization", `Bearer ${adminToken}`);

        expect(res.status).toBe(200);
        expect(res.body.data.enquiries).toBeDefined();
        expect(res.body.data.total).toBeGreaterThanOrEqual(1);
    });

    it("should return 403 for non-admin", async () => {
        const res = await request(app)
            .get("/api/admin/enquiries")
            .set("Authorization", `Bearer ${userToken}`);

        expect(res.status).toBe(403);
    });

    it("should list guest enquiries without a linked user", async () => {
        await request(app)
            .post("/api/enquiries")
            .send(enquiryPayload({ customerEmail: "guest@example.com" }));

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
            .send(enquiryPayload());
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

describe("DELETE /api/admin/enquiries/:id", () => {
    it("should delete an enquiry when admin", async () => {
        const createRes = await request(app)
            .post("/api/enquiries")
            .send(enquiryPayload());
        const enquiryId = createRes.body.data._id;

        const res = await request(app)
            .delete(`/api/admin/enquiries/${enquiryId}`)
            .set("Authorization", `Bearer ${adminToken}`);

        expect(res.status).toBe(200);
        expect(res.body.success).toBe(true);

        const list = await request(app)
            .get("/api/admin/enquiries")
            .set("Authorization", `Bearer ${adminToken}`);

        expect(list.body.data.enquiries.find((e) => e._id === enquiryId)).toBeUndefined();
    });

    it("should return 403 for non-admin", async () => {
        const createRes = await request(app)
            .post("/api/enquiries")
            .send(enquiryPayload());

        const res = await request(app)
            .delete(`/api/admin/enquiries/${createRes.body.data._id}`)
            .set("Authorization", `Bearer ${userToken}`);

        expect(res.status).toBe(403);
    });
});