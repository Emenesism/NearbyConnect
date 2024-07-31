import swaggerJSDoc from "swagger-jsdoc";

const swaggerDefinition = {
  openapi: "3.0.0",
  info: {
    title: "register-org API Documentation",
    version: "1.0.0",
  },
  security: [
    {
      bearerAuth: [],
    },
  ],
};

const options = {
  swaggerDefinition,
  apis: [
    "./src/routes/admin/*.ts",
    "./src/routes/clients/*.ts",
    "./src/routes/files/*.ts",
  ],
};

export const swaggerSpec = swaggerJSDoc(options);
