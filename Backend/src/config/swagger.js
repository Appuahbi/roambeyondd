const swaggerJsdoc = require("swagger-jsdoc");
const swaggerUi = require("swagger-ui-express");

const options = {

    definition: {

        openapi: "3.0.0",

        info: {

            title: "Delhi Tour Backend API",

            version: "1.0.0",

            description:
                "REST API documentation for Delhi Tour Backend"

        },

        servers: [

            {

                url: "http://localhost:5000/api",

                description: "Local Development Server"

            }

        ],

        components: {

            securitySchemes: {

                bearerAuth: {

                    type: "http",

                    scheme: "bearer",

                    bearerFormat: "JWT"

                }

            }

        },

        security: [

            {

                bearerAuth: []

            }

        ]

    },

    apis: [
    "./src/docs/**/*.yaml"
]

};

const swaggerSpec = swaggerJsdoc(options);

module.exports = {

    swaggerUi,

    swaggerSpec

};