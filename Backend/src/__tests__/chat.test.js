const request = require("supertest");
const mongoose = require("mongoose");
const { MongoMemoryServer } = require("mongodb-memory-server");
const app = require("../app");
const TourPackage = require("../models/TourPackage");
const { createTestUser, getAuthToken } = require("./helpers");

process.env.AI_PROVIDER = "openai";
process.env.OPENAI_API_KEY = "test-key";

let mongoServer;
let token;

const openAIResponse = (message) => ({ choices: [{ message }] });

const finalMessage = (content) => ({ role: "assistant", content });

const toolCallMessage = (name, args, id = "call_1") => ({
    role: "assistant",
    content: null,
    tool_calls: [
        {
            id,
            type: "function",
            function: { name, arguments: JSON.stringify(args) }
        }
    ]
});

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
    const user = await createTestUser();
    token = getAuthToken(user);
});

describe("POST /api/chat", () => {
    let fetchMock;

    beforeEach(() => {
        fetchMock = jest.fn();
        global.fetch = fetchMock;
    });

    afterEach(() => {
        delete global.fetch;
    });

    it("returns the assistant reply when no tool call is made", async () => {
        fetchMock.mockResolvedValue({
            ok: true,
            json: async () => openAIResponse(finalMessage("Hello! How can I help you plan a trip today?"))
        });

        const res = await request(app)
            .post("/api/chat")
            .set("Authorization", `Bearer ${token}`)
            .send({ messages: [{ role: "user", content: "Hi" }] });

        expect(res.status).toBe(200);
        expect(res.body.success).toBe(true);
        expect(res.body.data.message).toContain("How can I help");
    });

    it("executes search_packages tool and returns the final answer", async () => {
        await TourPackage.create({
            title: "Jaipur Heritage Tour",
            slug: "jaipur-heritage-tour",
            shortDescription: "Explore the pink city palaces, forts and bazaars.",
            description: "A comprehensive guided tour of Jaipur covering Amber Fort, City Palace, Hawa Mahal and more.",
            destination: "Jaipur",
            category: "Domestic Tours",
            duration: "3 Days / 2 Nights",
            price: 12500,
            isActive: true,
            createdBy: new mongoose.Types.ObjectId()
        });

        fetchMock
            .mockResolvedValueOnce({
                ok: true,
                json: async () => openAIResponse(toolCallMessage("search_packages", { destination: "Jaipur" }))
            })
            .mockResolvedValueOnce({
                ok: true,
                json: async () => openAIResponse(finalMessage("Here are packages to Jaipur."))
            });

        const res = await request(app)
            .post("/api/chat")
            .set("Authorization", `Bearer ${token}`)
            .send({ messages: [{ role: "user", content: "Show me packages to Jaipur" }] });

        expect(res.status).toBe(200);
        expect(res.body.data.message).toBe("Here are packages to Jaipur.");

        const toolBody = JSON.parse(fetchMock.mock.calls[1][1].body);
        const toolMessage = toolBody.messages.find((m) => m.role === "tool");
        expect(toolMessage).toBeDefined();
        expect(toolMessage.content).toContain("Jaipur Heritage Tour");
    });

    it("returns 401 without authentication", async () => {
        const res = await request(app)
            .post("/api/chat")
            .send({ messages: [{ role: "user", content: "Hi" }] });

        expect(res.status).toBe(401);
    });

    it("returns 400 for an invalid payload", async () => {
        const res = await request(app)
            .post("/api/chat")
            .set("Authorization", `Bearer ${token}`)
            .send({ messages: [] });

        expect(res.status).toBe(400);
    });
});
