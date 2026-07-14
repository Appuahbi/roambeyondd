const express = require("express");

const helmet = require("helmet");

const cors = require("cors");

const morgan = require("morgan");

const compression = require("compression");

const cookieParser = require("cookie-parser");

const limiter = require("./middlewares/rateLimiter");

const errorHandler = require("./middlewares/errorHandler");

const notFound = require("./middlewares/notFound");

const indexRoutes = require("./routes");

const app = express();


const authRoutes = require("./routes/authRoutes");

const packageRoutes = require("./routes/packageRoutes");

const {
    swaggerUi,
    swaggerSpec
} = require("./config/swagger");

/*
Security Headers
*/
app.use(helmet());

/*
Allow frontend
*/
app.use(cors());

/*
Log requests
*/
app.use(morgan("dev"));

/*
Compress responses
*/
app.use(compression());

/*
JSON parser
*/
app.use(express.json());

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






app.use("/api/auth", authRoutes);


app.use("/api/packages", packageRoutes);


app.use(
    "/api-docs",
    swaggerUi.serve,
    swaggerUi.setup(swaggerSpec)
);

/*
404
*/
app.use(notFound);




/*
Global Error Handler
*/

app.use(errorHandler);





module.exports = app;