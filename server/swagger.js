const swaggerJSDoc = require("swagger-jsdoc");

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "My API",
      version: "1.0.0",
      description: "API documentation for my backend",
    },
    servers: [
      {
        url: "http://localhost:8080", // change if needed
      },
    ],
  },
  apis: ["./routes/*.js"], // where your route files live
};

const swaggerSpec = swaggerJSDoc(options);

module.exports = swaggerSpec;
