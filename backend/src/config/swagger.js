
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
    // AUTHENTICATION APIs

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

    // PRODUCT COLLECTION APIs

    "/api/products": {
      get: {
        summary: "Get all products with search and pagination",
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            in: "query",
            name: "search",
            schema: { type: "string" },
            description: "Search by product name or SKU",
          },
          {
            in: "query",
            name: "page",
            schema: { type: "integer", default: 1, minimum: 1 },
            description: "Page number",
          },
          {
            in: "query",
            name: "limit",
            schema: {
              type: "integer",
              default: 10,
              minimum: 1,
              maximum: 100,
            },
            description: "Products per page",
          },
        ],
        responses: {
          200: { description: "Products retrieved successfully" },
          401: { description: "Unauthorized" },
          500: { description: "Unable to retrieve products" },
        },
      },

      post: {
        summary: "Create a product",
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["name", "sku"],
                properties: {
                  name: { type: "string", example: "Wireless Mouse" },
                  sku: { type: "string", example: "WM-001" },
                  description: {
                    type: "string",
                    example: "Wireless optical mouse",
                  },
                  quantityOnHand: { type: "integer", example: 25 },
                  costPrice: { type: "number", example: 450 },
                  sellingPrice: { type: "number", example: 650 },
                  lowStockThreshold: { type: "integer", example: 5 },
                },
              },
            },
          },
        },
        responses: {
          201: { description: "Product created successfully" },
          400: { description: "Invalid product details" },
          401: { description: "Unauthorized" },
          409: { description: "Duplicate SKU" },
        },
      },
    },

    // INDIVIDUAL PRODUCT APIs

    "/api/products/{id}": {
      get: {
        summary: "Get a product by ID",
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            in: "path",
            name: "id",
            required: true,
            schema: { type: "string" },
            description: "Product ID",
          },
        ],
        responses: {
          200: { description: "Product retrieved successfully" },
          401: { description: "Unauthorized" },
          404: { description: "Product not found" },
          500: { description: "Unable to retrieve product" },
        },
      },

      put: {
        summary: "Update a product",
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            in: "path",
            name: "id",
            required: true,
            schema: { type: "string" },
            description: "Product ID",
          },
        ],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  name: { type: "string", example: "Wireless Mouse Pro" },
                  sku: { type: "string", example: "WM-001" },
                  description: {
                    type: "string",
                    example: "Updated wireless optical mouse",
                  },
                  quantityOnHand: { type: "integer", example: 30 },
                  costPrice: { type: "number", example: 475 },
                  sellingPrice: { type: "number", example: 699 },
                  lowStockThreshold: { type: "integer", example: 8 },
                },
              },
            },
          },
        },
        responses: {
          200: { description: "Product updated successfully" },
          400: { description: "Invalid product details" },
          401: { description: "Unauthorized" },
          404: { description: "Product not found" },
          409: { description: "Duplicate SKU" },
          500: { description: "Unable to update product" },
        },
      },

      delete: {
        summary: "Delete a product",
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            in: "path",
            name: "id",
            required: true,
            schema: { type: "string" },
            description: "Product ID",
          },
        ],
        responses: {
          200: { description: "Product deleted successfully" },
          401: { description: "Unauthorized" },
          404: { description: "Product not found" },
          500: { description: "Unable to delete product" },
        },
      },
    },

    // DASHBOARD API

    "/api/dashboard/summary": {
      get: {
        summary: "Get dashboard summary",
        description:
          "Retrieve total products, total inventory quantity, and low-stock products for the authenticated organization.",
        security: [{ bearerAuth: [] }],
        responses: {
          200: { description: "Dashboard summary retrieved successfully" },
          401: { description: "Unauthorized" },
          500: { description: "Unable to retrieve dashboard summary" },
        },
      },
    },

    // ORGANIZATION SETTINGS APIs

    "/api/settings": {
      get: {
        summary: "Get organization settings",
        security: [{ bearerAuth: [] }],
        responses: {
          200: { description: "Settings retrieved successfully" },
          401: { description: "Unauthorized" },
          404: { description: "Organization settings not found" },
          500: { description: "Unable to retrieve settings" },
        },
      },

      put: {
        summary: "Update organization settings",
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["defaultLowStockThreshold"],
                properties: {
                  defaultLowStockThreshold: {
                    type: "integer",
                    minimum: 0,
                    example: 5,
                  },
                },
              },
            },
          },
        },
        responses: {
          200: { description: "Settings updated successfully" },
          400: { description: "Invalid threshold value" },
          401: { description: "Unauthorized" },
          500: { description: "Unable to update settings" },
        },
      },
    },
  },
};
