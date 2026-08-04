const express = require("express");

const helmet = require("helmet");

const cors = require("cors");

const pinoHttp = require("pino-http");

const compression = require("compression");

const cookieParser = require("cookie-parser");

const limiter = require("./middlewares/rateLimiter");

const errorHandler = require("./middlewares/errorHandler");

const notFound = require("./middlewares/notFound");

const indexRoutes = require("./routes");

const logger = require("./config/logger");

const app = express();

const {
    swaggerUi,
    swaggerSpec
} = require("./config/swagger");

/*
Security Headers
- CSP is configured explicitly so external assets (Cloudinary, Unsplash,
  Google Fonts) and WebSocket connections keep working in production.
*/
app.use(
    helmet({
        contentSecurityPolicy: {
            directives: {
                defaultSrc: ["'self'"],
                baseUri: ["'self'"],
                fontSrc: ["'self'", "https:", "data:"],
                formAction: ["'self'"],
                frameAncestors: ["'none'"],
                imgSrc: [
                    "'self'",
                    "data:",
                    "https://res.cloudinary.com",
                    "https://images.unsplash.com"
                ],
                objectSrc: ["'none'"],
                scriptSrc: ["'self'"],
                scriptSrcAttr: ["'none'"],
                styleSrc: ["'self'", "https:", "'unsafe-inline'"],
                upgradeInsecureRequests: []
            }
        }
    })
);

/*
Trust the first proxy hop (nginx / Cloudflare / load balancer) so
rate-limiters and req.ip see real client IPs instead of the proxy IP.
*/
app.set("trust proxy", process.env.NODE_ENV === "production" ? 1 : false);

/*
Allow frontend
*/
app.use(cors({
    origin: process.env.CORS_ORIGIN || "http://localhost:3000",
    credentials: true,
    methods: ["GET", "POST", "PATCH", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"]
}));

/*
Log requests
*/
app.use(pinoHttp({ logger }));

/*
Compress responses
*/
app.use(compression());

/*
JSON parser
*/
app.use(express.json({ limit: "10kb" }));

/*
Cookies
*/
app.use(cookieParser());

/*
Rate Limit
*/
app.use(limiter);

/*
Routes
*/
app.use("/api", indexRoutes);

if (process.env.NODE_ENV !== "production") {
    app.use(
        "/api-docs",
        swaggerUi.serve,
        swaggerUi.setup(swaggerSpec)
    );
}

/*
404
*/
app.use(notFound);

/*
Global Error Handler
*/
app.use(errorHandler);

module.exports = app;
