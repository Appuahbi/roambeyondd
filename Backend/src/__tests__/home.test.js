const request = require("supertest");
const app = require("../app");

describe("GET /api/", () => {
    it("should return 200 with health check message", async () => {
        const res = await request(app).get("/api/");

        expect(res.status).toBe(200);
        expect(res.body.success).toBe(true);
        expect(res.body.message).toBe("Delhi Tour API is running.");
    });
});

describe("Unknown routes", () => {
    it("should return 404 for non-existent routes", async () => {
        const res = await request(app).get("/api/nonexistent");

        expect(res.status).toBe(404);
        expect(res.body.success).toBe(false);
    });
});
