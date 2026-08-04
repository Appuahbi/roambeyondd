const TourPackage = require("../models/TourPackage");
const Category = require("../models/Category");
const SiteContent = require("../models/SiteContent");
const TripRequest = require("../models/TripRequest");
const AppError = require("../utils/AppError");
const escapeRegex = require("../utils/sanitizeRegex");
const { createTripRequest: createTripRequestService } = require("./tripRequestService");

const VALID_PREFERENCES = ["adventure", "culture", "food", "luxury", "budget", "family", "romantic", "spiritual", "wildlife", "beach"];

const MAX_ITERATIONS = 5;
const MAX_HISTORY = 14;
const MAX_TOOL_CONTENT = 4000;

const SYSTEM_PROMPT = `
You are Travis AI, the friendly AI travel assistant for RoamBeyond Travels (an Indian travel company selling tour packages). Always refer to yourself as Travis AI.

Your job is to help logged-in travelers discover packages, understand inclusions, get quick answers from site content, and submit trip requests.

Rules:
- ONLY talk about tour packages, trip planning, itineraries, FAQs, and site information. Stay on-topic.
- Use the provided tools to look things up. NEVER invent package names, prices, durations, or details — always ground answers in tool output.
- When a user asks for package recommendations, ask for destination, budget, or duration if missing, then call search_packages.
- When the user wants to plan a custom trip, collect destination, startDate, endDate, groupSize, adults, and optional budget before calling create_trip_request. If any required detail is missing, ask for it. Confirm the details with the user before creating the request.
- Prices are in Indian Rupees (INR).
- Be warm, concise, and helpful. Use short bullet lists when listing packages.
- Format answers with clean Markdown: use headings, bold, and bullet lists so they render nicely in the chat widget.
`.trim();

/*
|--------------------------------------------------------------------------
| AI provider configuration
|--------------------------------------------------------------------------
| openai: standard chat/completions API (Bearer token).
| gemini: native generateContent API. Uses x-goog-api-key header because
|         current AI Studio "Auth keys" (AQ. prefix) are rejected on the
|         OpenAI-compatible endpoint. Request/response bodies are translated
|         to/from the OpenAI-style format used by the agent loop.
*/

const PROVIDERS = {
    openai: {
        kind: "openai",
        url: "https://api.openai.com/v1/chat/completions",
        keyEnv: "OPENAI_API_KEY",
        modelEnv: "OPENAI_MODEL",
        defaultModel: "gpt-4o-mini"
    },
    gemini: {
        kind: "gemini",
        keyEnv: "GEMINI_API_KEY",
        modelEnv: "GEMINI_MODEL",
        defaultModel: "gemini-3.5-flash"
    },
    ollama: {
        kind: "openai",
        url: "http://localhost:11434/v1/chat/completions",
        keyEnv: "OLLAMA_API_KEY",
        modelEnv: "OLLAMA_MODEL",
        defaultModel: "gemma4:12b",
        requiresKey: false,
        keepAlive: "30m"
    }
};

const normalizeGeminiSchema = (schema) => {
    if (Array.isArray(schema)) return schema.map(normalizeGeminiSchema);
    if (!schema || typeof schema !== "object") return schema;
    const out = {};
    for (const [key, value] of Object.entries(schema)) {
        if (key === "type") {
            out.type = String(value).toUpperCase();
        } else {
            out[key] = normalizeGeminiSchema(value);
        }
    }
    return out;
};

const toGeminiTools = (tools) => {
    if (!tools || tools.length === 0) return undefined;
    const functionDeclarations = tools.map((t) => {
        const fn = t.function || t;
        const declaration = { name: fn.name, description: fn.description };
        if (fn.parameters) declaration.parameters = normalizeGeminiSchema(fn.parameters);
        return declaration;
    });
    return [{ functionDeclarations }];
};

const toGeminiContents = (messages) => {
    const contents = [];
    let systemText = "";

    for (const m of messages) {
        if (m.role === "system") {
            systemText = m.content || "";
            continue;
        }

        if (m.role === "tool") {
            let response;
            try {
                response = JSON.parse(m.content);
            } catch {
                response = { result: m.content };
            }
            contents.push({
                role: "user",
                parts: [{ functionResponse: { name: m.tool_call_id, response } }]
            });
            continue;
        }

        if (m.role === "assistant") {
            const parts = [];
            if (m.content) parts.push({ text: m.content });
            for (const call of m.tool_calls || []) {
                let args = {};
                try {
                    args = JSON.parse(call.function?.arguments || "{}");
                } catch { /* malformed args */ }
                const part = { functionCall: { name: call.id || call.function?.name, args } };
                if (call.thoughtSignature) part.thoughtSignature = call.thoughtSignature;
                parts.push(part);
            }
            contents.push({ role: "model", parts });
            continue;
        }

        contents.push({ role: "user", parts: [{ text: m.content }] });
    }

    return {
        contents,
        systemInstruction: systemText ? { parts: [{ text: systemText }] } : undefined
    };
};

const fromGeminiResponse = (data) => {
    const content = data?.candidates?.[0]?.content;
    if (!content) return null;

    const parts = content.parts || [];
    const text = parts
        .filter((p) => p.text)
        .map((p) => p.text)
        .join("")
        .trim();
    const toolCalls = parts
        .filter((p) => p.functionCall)
        .map((p) => {
            const fullName = p.functionCall.name;
            const name = fullName.includes(":")
                ? fullName.slice(fullName.lastIndexOf(":") + 1)
                : fullName;
            return {
                id: fullName,
                type: "function",
                function: {
                    name,
                    arguments: JSON.stringify(p.functionCall.args ?? {})
                },
                thoughtSignature: p.thoughtSignature
            };
        });

    const message = { role: "assistant", content: text };
    if (toolCalls.length > 0) message.tool_calls = toolCalls;
    return message;
};

const callProvider = async ({ messages, tools }) => {
    const provider = PROVIDERS[process.env.AI_PROVIDER] || PROVIDERS.openai;
    const apiKey = process.env[provider.keyEnv];
    if (provider.requiresKey !== false && !apiKey) {
        throw new AppError(`AI assistant is not configured (missing ${provider.keyEnv})`, 503);
    }

    const model = process.env[provider.modelEnv] || provider.defaultModel;
    const maxTokens = parseInt(process.env.AI_MAX_TOKENS, 10) || 800;

    let response;
    try {
        if (provider.kind === "gemini") {
            const { contents, systemInstruction } = toGeminiContents(messages);
            const geminiTools = toGeminiTools(tools);
            response = await fetch(
                `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        "x-goog-api-key": apiKey
                    },
                    body: JSON.stringify({
                        contents,
                        ...(systemInstruction ? { systemInstruction } : {}),
                        ...(geminiTools ? { tools: geminiTools } : {}),
                        generationConfig: { maxOutputTokens: maxTokens }
                    })
                }
            );
        } else {
            const headers = { "Content-Type": "application/json" };
            if (apiKey) headers.Authorization = `Bearer ${apiKey}`;
            response = await fetch(provider.url, {
                method: "POST",
                headers,
                body: JSON.stringify({
                    model,
                    messages,
                    tools,
                    tool_choice: "auto",
                    max_tokens: maxTokens,
                    ...(provider.keepAlive ? { keep_alive: provider.keepAlive } : {})
                })
            });
        }
    } catch (err) {
        throw new AppError("Unable to reach the AI provider. Please try again later.", 502);
    }

    if (!response.ok) {
        let detail = `AI provider request failed with status ${response.status}`;
        try {
            const body = await response.json();
            if (body?.error?.message) detail = body.error.message;
        } catch { /* non-JSON error body */ }
        throw new AppError(detail, 502);
    }

    const data = await response.json();

    const message = provider.kind === "gemini"
        ? fromGeminiResponse(data)
        : data?.choices?.[0]?.message;

    if (!message) {
        throw new AppError("Unexpected response from the AI provider.", 502);
    }

    return message;
};

/*
|--------------------------------------------------------------------------
| Tools
|--------------------------------------------------------------------------
*/

const searchPackages = async ({ destination, category, minPrice, maxPrice, query, limit = 6 }) => {
    const filter = { isActive: true };

    if (destination) {
        filter.destination = { $regex: escapeRegex(destination), $options: "i" };
    }
    if (category) {
        filter.category = category;
    }
    if (minPrice || maxPrice) {
        filter.price = {};
        if (Number.isFinite(Number(minPrice)) && Number(minPrice) > 0) filter.price.$gte = Number(minPrice);
        if (Number.isFinite(Number(maxPrice)) && Number(maxPrice) > 0) filter.price.$lte = Number(maxPrice);
    }
    if (query) {
        filter.$or = [
            { title: { $regex: escapeRegex(query), $options: "i" } },
            { destination: { $regex: escapeRegex(query), $options: "i" } },
            { shortDescription: { $regex: escapeRegex(query), $options: "i" } }
        ];
    }

    const packages = await TourPackage.find(filter)
        .select("title slug category destination duration price discountPrice rating reviewsCount shortDescription")
        .sort({ rating: -1 })
        .limit(Math.min(Number(limit) || 6, 10))
        .lean();

    return { count: packages.length, packages };
};

const getPackage = async ({ slug }) => {
    if (!slug) return { error: "A package slug is required." };

    const tourPackage = await TourPackage.findOne({ slug, isActive: true }).lean();
    if (!tourPackage) return { error: `No active package found with slug "${slug}".` };

    return {
        title: tourPackage.title,
        slug: tourPackage.slug,
        category: tourPackage.category,
        destination: tourPackage.destination,
        duration: tourPackage.duration,
        price: tourPackage.price,
        discountPrice: tourPackage.discountPrice,
        maxGroupSize: tourPackage.maxGroupSize,
        rating: tourPackage.rating,
        reviewsCount: tourPackage.reviewsCount,
        shortDescription: tourPackage.shortDescription,
        description: tourPackage.description,
        highlights: tourPackage.highlights || [],
        included: tourPackage.included || [],
        excluded: tourPackage.excluded || [],
        itinerary: tourPackage.itinerary || [],
        faq: tourPackage.faq || []
    };
};

const listCategories = async () => {
    const categories = await Category.find({ type: "package", isActive: true })
        .select("name description highlights")
        .sort({ sortOrder: 1 })
        .lean();

    return { categories };
};

const getSiteInfo = async () => {
    const docs = await SiteContent.find({}).select("section content").lean();
    const info = {};
    for (const doc of docs) info[doc.section] = doc.content;
    return info;
};

const getMyTripRequests = async (user) => {
    if (!user) return { error: "You must be logged in to view your trip requests." };

    const requests = await TripRequest.find({ user: user.id })
        .sort({ createdAt: -1 })
        .limit(10)
        .lean();

    return {
        requests: requests.map((r) => ({
            destination: r.destination,
            startDate: r.startDate,
            endDate: r.endDate,
            status: r.status,
            groupSize: r.groupSize,
            budget: r.budget
        }))
    };
};

const createTripRequestForChat = async (user, args) => {
    if (!user) return { error: "You must be logged in to submit a trip request." };

    const {
        destination,
        startDate,
        endDate,
        budgetMin,
        budgetMax,
        groupSize,
        adults,
        children,
        preferences,
        specialRequests
    } = args;

    const errors = {};
    if (!destination || !destination.trim()) errors.destination = "destination is required";
    if (!startDate || Number.isNaN(Date.parse(startDate))) errors.startDate = "a valid startDate (YYYY-MM-DD) is required";
    if (!endDate || Number.isNaN(Date.parse(endDate))) errors.endDate = "a valid endDate (YYYY-MM-DD) is required";
    if (startDate && endDate && Date.parse(endDate) < Date.parse(startDate)) errors.endDate = "endDate must be after startDate";
    if (!groupSize || Number(groupSize) < 1) errors.groupSize = "groupSize must be at least 1";
    if (!adults || Number(adults) < 1) errors.adults = "adults must be at least 1";

    if (Object.keys(errors).length > 0) {
        return { error: "Missing or invalid trip details.", fields: errors };
    }

    const data = {
        destination: destination.trim(),
        startDate: new Date(Date.parse(startDate)),
        endDate: new Date(Date.parse(endDate)),
        budget: {
            min: Number(budgetMin) || 0,
            max: Number(budgetMax) || 0
        },
        groupSize: Number(groupSize),
        adults: Number(adults),
        children: Number(children) || 0,
        preferences: Array.isArray(preferences)
            ? preferences.filter((p) => VALID_PREFERENCES.includes(p))
            : [],
        specialRequests: specialRequests || ""
    };

    const tripRequest = await createTripRequestService({
        userId: user.id,
        userName: user.name || "A traveler",
        data
    });

    return {
        success: true,
        message: "Trip request submitted successfully. A travel agent will get back to you soon.",
        tripRequest: {
            _id: tripRequest._id,
            destination: tripRequest.destination,
            startDate: tripRequest.startDate,
            endDate: tripRequest.endDate,
            status: tripRequest.status
        }
    };
};

const executeTool = async (name, args, user) => {
    switch (name) {
        case "search_packages":
            return searchPackages(args || {});
        case "get_package":
            return getPackage(args || {});
        case "list_categories":
            return listCategories();
        case "get_site_info":
            return getSiteInfo();
        case "get_my_trip_requests":
            return getMyTripRequests(user);
        case "create_trip_request":
            return createTripRequestForChat(user, args || {});
        default:
            throw new Error(`Unknown tool: ${name}`);
    }
};

/*
|--------------------------------------------------------------------------
| Tool definitions (OpenAI function-calling schema)
|--------------------------------------------------------------------------
*/

const TOOLS = [
    {
        type: "function",
        function: {
            name: "search_packages",
            description: "Search active tour packages by destination, category, price range, or a free-text query.",
            parameters: {
                type: "object",
                properties: {
                    destination: { type: "string", description: "Destination city/region, e.g. Jaipur" },
                    category: { type: "string", description: "Package category name" },
                    minPrice: { type: "number", description: "Minimum price in INR" },
                    maxPrice: { type: "number", description: "Maximum price in INR" },
                    query: { type: "string", description: "Free-text search over title/destination/description" },
                    limit: { type: "number", description: "Max results to return (default 6)" }
                }
            }
        }
    },
    {
        type: "function",
        function: {
            name: "get_package",
            description: "Get full details of a single package by its slug, including itinerary, inclusions, exclusions and FAQs.",
            parameters: {
                type: "object",
                properties: {
                    slug: { type: "string", description: "Package slug, e.g. golden-triangle" }
                },
                required: ["slug"]
            }
        }
    },
    {
        type: "function",
        function: {
            name: "list_categories",
            description: "List all package categories offered by RoamBeyond."
        }
    },
    {
        type: "function",
        function: {
            name: "get_site_info",
            description: "Get general site information (why-us, contact, footer content) for FAQ-style answers."
        }
    },
    {
        type: "function",
        function: {
            name: "get_my_trip_requests",
            description: "List the logged-in user's submitted trip requests and their statuses."
        }
    },
    {
        type: "function",
        function: {
            name: "create_trip_request",
            description: "Submit a custom trip request for the logged-in user. All required fields must be present.",
            parameters: {
                type: "object",
                properties: {
                    destination: { type: "string", description: "Destination for the trip" },
                    startDate: { type: "string", description: "Start date as YYYY-MM-DD" },
                    endDate: { type: "string", description: "End date as YYYY-MM-DD" },
                    budgetMin: { type: "number", description: "Minimum budget in INR" },
                    budgetMax: { type: "number", description: "Maximum budget in INR" },
                    groupSize: { type: "number", description: "Total group size" },
                    adults: { type: "number", description: "Number of adults" },
                    children: { type: "number", description: "Number of children" },
                    preferences: {
                        type: "array",
                        items: { type: "string" },
                        description: "Preferences from: adventure, culture, food, luxury, budget, family, romantic, spiritual, wildlife, beach"
                    },
                    specialRequests: { type: "string", description: "Any special requests" }
                },
                required: ["destination", "startDate", "endDate", "groupSize", "adults"]
            }
        }
    }
];

/*
|--------------------------------------------------------------------------
| Agent loop
|--------------------------------------------------------------------------
*/

const runChat = async ({ user, messages }) => {
    const history = (messages || [])
        .slice(-MAX_HISTORY)
        .map((m) => ({ role: m.role, content: m.content }));

    const apiMessages = [
        { role: "system", content: SYSTEM_PROMPT },
        ...history
    ];

    let finalText = "";

    for (let i = 0; i < MAX_ITERATIONS; i++) {
        const message = await callProvider({ messages: apiMessages, tools: TOOLS });
        if (!message) {
            throw new AppError("Unexpected response from the AI provider.", 502);
        }

        // Some reasoning models (e.g. Gemma) return their answer in a separate
        // `reasoning` field with empty `content`. Fall back to that text so the
        // agent still responds instead of bailing with the canned fallback.
        if (!message.content && !(message.tool_calls && message.tool_calls.length > 0) && message.reasoning) {
            message.content = message.reasoning.trim();
        }

        apiMessages.push(message);

        if (message.content) {
            finalText = message.content.trim();
        }

        const toolCalls = message.tool_calls || [];
        if (toolCalls.length === 0) break;

        // Small local models (e.g. llama3.2) often emit a junk tool call
        // *alongside* their final answer. If we already have an answer, trust
        // it and stop instead of looping on the spurious call for many rounds.
        if (message.content) break;

        for (const call of toolCalls) {
            let result;
            try {
                const args = call.function?.arguments ? JSON.parse(call.function.arguments) : {};
                result = await executeTool(call.function?.name, args, user);
            } catch (err) {
                result = { error: err.message || "Tool execution failed." };
            }

            const serialized = JSON.stringify(result);
            apiMessages.push({
                role: "tool",
                tool_call_id: call.id,
                content: serialized.length > MAX_TOOL_CONTENT
                    ? serialized.slice(0, MAX_TOOL_CONTENT)
                    : serialized
            });
        }
    }

    return finalText || "I couldn't complete that request. Could you rephrase it or try again?";
};

module.exports = { runChat, executeTool, searchPackages, getPackage };
