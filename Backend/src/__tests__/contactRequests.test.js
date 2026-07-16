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

const validContactRequest = {
    name: "John Doe",
    email: "john@example.com",
    phone: "9876543210",
    subject: "Inquiry about Delhi Tour",
    message: "I would like to know more about your Delhi tour packages."
};

describe("POST /api/contact", () => {
    it("should create a contact request", async () => {
        const res = await request(app)
            .post("/api/contact")
            .send(validContactRequest);

        expect(res.status).toBe(201);
        expect(res.body.success).toBe(true);
        expect(res.body.data.name).toBe(validContactRequest.name);
    });

    it("should return 400 for missing required fields", async () => {
        const res = await request(app)
            .post("/api/contact")
            .send({ name: "John" });

        expect(res.status).toBe(400);
    });

    it("should return 400 for invalid email", async () => {
        const res = await request(app)
            .post("/api/contact")
            .send({ ...validContactRequest, email: "invalid" });

        expect(res.status).toBe(400);
    });
});

describe("GET /api/contact/admin", () => {
    beforeEach(async () => {
        await request(app)
            .post("/api/contact")
            .send(validContactRequest);
    });

    it("should return all contact requests when admin", async () => {
        const res = await request(app)
            .get("/api/contact/admin")
            .set("Authorization", `Bearer ${adminToken}`);

        expect(res.status).toBe(200);
        expect(res.body.data.contactRequests).toBeDefined();
    });

    it("should return 403 for non-admin", async () => {
        const res = await request(app)
            .get("/api/contact/admin")
            .set("Authorization", `Bearer ${userToken}`);

        expect(res.status).toBe(403);
    });

    it("should return 401 without auth", async () => {
        const res = await request(app).get("/api/contact/admin");

        expect(res.status).toBe(401);
    });
});

describe("GET /api/contact/admin/:id", () => {
    let contactId;

    beforeEach(async () => {
        const createRes = await request(app)
            .post("/api/contact")
            .send(validContactRequest);
        contactId = createRes.body.data._id;
    });

    it("should return contact request by ID when admin", async () => {
        const res = await request(app)
            .get(`/api/contact/admin/${contactId}`)
            .set("Authorization", `Bearer ${adminToken}`);

        expect(res.status).toBe(200);
    });

    it("should return 400 for invalid ID format", async () => {
        const res = await request(app)
            .get("/api/contact/admin/invalid-id")
            .set("Authorization", `Bearer ${adminToken}`);

        expect(res.status).toBe(400);
    });
});

describe("PATCH /api/contact/admin/:id", () => {
    let contactId;

    beforeEach(async () => {
        const createRes = await request(app)
            .post("/api/contact")
            .send(validContactRequest);
        contactId = createRes.body.data._id;
    });

    it("should update contact request when admin", async () => {
        const res = await request(app)
            .patch(`/api/contact/admin/${contactId}`)
            .set("Authorization", `Bearer ${adminToken}`)
            .send({ status: "Contacted", remarks: "Called the customer" });

        expect(res.status).toBe(200);
        expect(res.body.data.status).toBe("Contacted");
    });

    it("should return 403 for non-admin", async () => {
        const res = await request(app)
            .patch(`/api/contact/admin/${contactId}`)
            .set("Authorization", `Bearer ${userToken}`)
            .send({ status: "Contacted" });

        expect(res.status).toBe(403);
    });
});

describe("DELETE /api/contact/admin/:id", () => {
    let contactId;

    beforeEach(async () => {
        const createRes = await request(app)
            .post("/api/contact")
            .send(validContactRequest);
        contactId = createRes.body.data._id;
    });

    it("should delete contact request when admin", async () => {
        const res = await request(app)
            .delete(`/api/contact/admin/${contactId}`)
            .set("Authorization", `Bearer ${adminToken}`);

        expect(res.status).toBe(200);
        expect(res.body.success).toBe(true);
    });

    it("should return 403 for non-admin", async () => {
        const res = await request(app)
            .delete(`/api/contact/admin/${contactId}`)
            .set("Authorization", `Bearer ${userToken}`);

        expect(res.status).toBe(403);
    });
});
