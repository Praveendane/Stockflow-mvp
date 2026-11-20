export const swaggerDocument = {
  openapi: "3.0.0",
  info: {
    title: "StockFlow API",
    version: "1.0.0",
    description: "Inventory Management SaaS API",
  },
  servers: [
    {
      url: "http://localhost:5000",
    },
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: "http",
        scheme: "bearer",
        bearerFormat: "JWT",
      },
    },
  },
  paths: {
    "/api/auth/register": {
      post: {
        summary: "Register a new organization and user",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["email", "password", "organizationName"],
                properties: {
                  email: { type: "string", example: "test@example.com" },
                  password: { type: "string", example: "Test@12345" },
                  organizationName: {
                    type: "string",
                    example: "Demo Organization",
                  },
                },
              },
            },
          },
        },
        responses: {
          201: { description: "Registration successful" },
          409: { description: "Email already registered" },
        },
      },
    },
    "/api/auth/login": {
      post: {
        summary: "Login and receive JWT token",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  email: { type: "string", example: "test@example.com" },
                  password: { type: "string", example: "Test@12345" },
                },
              },
            },
          },
        },
        responses: {
          200: { description: "Login successful" },
          401: { description: "Invalid credentials" },
        },
      },
    },
    "/api/auth/me": {
      get: {
        summary: "Get authenticated user profile",
        security: [{ bearerAuth: [] }],
        responses: {
          200: { description: "Authenticated user profile" },
          401: { description: "Unauthorized" },
        },
      },
    },
  },
};