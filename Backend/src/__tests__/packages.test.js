const request = require("supertest");
const mongoose = require("mongoose");
const { MongoMemoryServer } = require("mongodb-memory-server");
const app = require("../app");
const { createTestAdmin, getAuthToken } = require("./helpers");

let mongoServer;
let adminToken;

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
});

const validPackage = {
    title: "Delhi Heritage Tour",
    shortDescription: "Explore the rich heritage of Delhi with our guided tour.",
    description: "A comprehensive tour covering all major historical monuments in Delhi including Red Fort, Qutub Minar, Humayun's Tomb and more.",
    destination: "Delhi",
    category: "Domestic Tours",
    duration: "3 Days",
    price: 15000
};

describe("POST /api/packages", () => {
    it("should create a package when admin", async () => {
        const res = await request(app)
            .post("/api/packages")
            .set("Authorization", `Bearer ${adminToken}`)
            .send(validPackage);

        expect(res.status).toBe(201);
        expect(res.body.success).toBe(true);
        expect(res.body.data.title).toBe(validPackage.title);
    });

    it("should return 401 without auth", async () => {
        const res = await request(app)
            .post("/api/packages")
            .send(validPackage);

        expect(res.status).toBe(401);
    });

    it("should return 400 for missing required fields", async () => {
        const res = await request(app)
            .post("/api/packages")
            .set("Authorization", `Bearer ${adminToken}`)
            .send({ title: "Short" });

        expect(res.status).toBe(400);
    });
});

describe("GET /api/packages", () => {
    beforeEach(async () => {
        await request(app)
            .post("/api/packages")
            .set("Authorization", `Bearer ${adminToken}`)
            .send(validPackage);
    });

    it("should return all active packages", async () => {
        const res = await request(app).get("/api/packages");

        expect(res.status).toBe(200);
        expect(res.body.success).toBe(true);
        expect(Array.isArray(res.body.data.data)).toBe(true);
        expect(res.body.data.data.length).toBe(1);
        expect(res.body.data.pagination).toBeDefined();
    });
});

describe("GET /api/packages/:slug", () => {
    let slug;

    beforeEach(async () => {
        const createRes = await request(app)
            .post("/api/packages")
            .set("Authorization", `Bearer ${adminToken}`)
            .send(validPackage);
        slug = createRes.body.data.slug;
    });

    it("should return package by slug", async () => {
        const res = await request(app).get(`/api/packages/${slug}`);

        expect(res.status).toBe(200);
        expect(res.body.data.package.title).toBe(validPackage.title);
        expect(res.body.data.relatedPackages).toBeDefined();
    });

    it("should return 404 for non-existent slug", async () => {
        const res = await request(app).get("/api/packages/non-existent-slug");

        expect(res.status).toBe(404);
    });
});

describe("PATCH /api/packages/:id", () => {
    let packageId;

    beforeEach(async () => {
        const createRes = await request(app)
            .post("/api/packages")
            .set("Authorization", `Bearer ${adminToken}`)
            .send(validPackage);
        packageId = createRes.body.data._id;
    });

    it("should update package when admin", async () => {
        const res = await request(app)
            .patch(`/api/packages/${packageId}`)
            .set("Authorization", `Bearer ${adminToken}`)
            .send({ price: 18000 });

        expect(res.status).toBe(200);
        expect(res.body.data.price).toBe(18000);
    });

    it("should return 400 for invalid ID format", async () => {
        const res = await request(app)
            .patch("/api/packages/invalid-id")
            .set("Authorization", `Bearer ${adminToken}`)
            .send({ price: 18000 });

        expect(res.status).toBe(400);
    });
});

describe("DELETE /api/packages/:id", () => {
    let packageId;

    beforeEach(async () => {
        const createRes = await request(app)
            .post("/api/packages")
            .set("Authorization", `Bearer ${adminToken}`)
            .send(validPackage);
        packageId = createRes.body.data._id;
    });

    it("should soft delete package when admin", async () => {
        const res = await request(app)
            .delete(`/api/packages/${packageId}`)
            .set("Authorization", `Bearer ${adminToken}`);

        expect(res.status).toBe(200);
        expect(res.body.success).toBe(true);
    });

    it("should return 401 without auth", async () => {
        const res = await request(app).delete(`/api/packages/${packageId}`);

        expect(res.status).toBe(401);
    });

    it("should hide soft-deleted package from public listing", async () => {
        await request(app)
            .delete(`/api/packages/${packageId}`)
            .set("Authorization", `Bearer ${adminToken}`);

        const res = await request(app).get("/api/packages");

        expect(res.status).toBe(200);
        expect(res.body.data.data.length).toBe(0);
    });
});
