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

const validBlog = {
    title: "Best Places to Visit in Delhi",
    content: "Delhi is a city rich with history and culture. From the magnificent Red Fort to the serene Lotus Temple, there is something for everyone.",
    excerpt: "Discover the top attractions in Delhi",
    category: "Destination Guides",
    tags: "delhi,travel,heritage"
};

describe("POST /api/blogs", () => {
    it("should create a blog when admin", async () => {
        const res = await request(app)
            .post("/api/blogs")
            .set("Authorization", `Bearer ${adminToken}`)
            .field("title", validBlog.title)
            .field("content", validBlog.content)
            .field("excerpt", validBlog.excerpt)
            .field("category", validBlog.category)
            .field("tags", validBlog.tags);

        expect(res.status).toBe(201);
        expect(res.body.success).toBe(true);
        expect(res.body.data.title).toBe(validBlog.title);
    });

    it("should return 401 without auth", async () => {
        const res = await request(app)
            .post("/api/blogs")
            .send(validBlog);

        expect(res.status).toBe(401);
    });

    it("should return 401 for non-admin user", async () => {
        const res = await request(app)
            .post("/api/blogs")
            .set("Authorization", `Bearer ${userToken}`)
            .field("title", validBlog.title)
            .field("content", validBlog.content)
            .field("category", validBlog.category);

        expect(res.status).toBe(403);
    });
});

describe("GET /api/blogs", () => {
    beforeEach(async () => {
        await request(app)
            .post("/api/blogs")
            .set("Authorization", `Bearer ${adminToken}`)
            .field("title", validBlog.title)
            .field("content", validBlog.content)
            .field("category", validBlog.category)
            .field("status", "published");
    });

    it("should return published blogs", async () => {
        const res = await request(app).get("/api/blogs");

        expect(res.status).toBe(200);
        expect(res.body.data.blogs).toBeDefined();
        expect(res.body.data.pagination).toBeDefined();
    });

    it("should return 200 with query params", async () => {
        const res = await request(app)
            .get("/api/blogs?page=1&limit=5&category=Destination+Guides");

        expect(res.status).toBe(200);
    });
});

describe("GET /api/blogs/:slug", () => {
    let slug;

    beforeEach(async () => {
        const createRes = await request(app)
            .post("/api/blogs")
            .set("Authorization", `Bearer ${adminToken}`)
            .field("title", validBlog.title)
            .field("content", validBlog.content)
            .field("category", validBlog.category)
            .field("status", "published");
        slug = createRes.body.data.slug;
    });

    it("should return blog by slug", async () => {
        const res = await request(app).get(`/api/blogs/${slug}`);

        expect(res.status).toBe(200);
        expect(res.body.data.title).toBe(validBlog.title);
    });

    it("should return 404 for non-existent slug", async () => {
        const res = await request(app).get("/api/blogs/non-existent-slug");

        expect(res.status).toBe(404);
    });
});

describe("PATCH /api/blogs/:id", () => {
    let blogId;

    beforeEach(async () => {
        const createRes = await request(app)
            .post("/api/blogs")
            .set("Authorization", `Bearer ${adminToken}`)
            .field("title", validBlog.title)
            .field("content", validBlog.content)
            .field("category", validBlog.category);
        blogId = createRes.body.data.id;
    });

    it("should update blog when admin", async () => {
        const res = await request(app)
            .patch(`/api/blogs/${blogId}`)
            .set("Authorization", `Bearer ${adminToken}`)
            .field("title", "Updated Blog Title");

        expect(res.status).toBe(200);
        expect(res.body.data.title).toBe("Updated Blog Title");
    });
});

describe("DELETE /api/blogs/:id", () => {
    let blogId;

    beforeEach(async () => {
        const createRes = await request(app)
            .post("/api/blogs")
            .set("Authorization", `Bearer ${adminToken}`)
            .field("title", validBlog.title)
            .field("content", validBlog.content)
            .field("category", validBlog.category);
        blogId = createRes.body.data.id;
    });

    it("should delete blog when admin", async () => {
        const res = await request(app)
            .delete(`/api/blogs/${blogId}`)
            .set("Authorization", `Bearer ${adminToken}`);

        expect(res.status).toBe(200);
        expect(res.body.success).toBe(true);
    });

    it("should return 401 without auth", async () => {
        const res = await request(app).delete(`/api/blogs/${blogId}`);

        expect(res.status).toBe(401);
    });
});
