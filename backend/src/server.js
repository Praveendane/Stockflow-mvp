
import express from "express";
import cors from "cors";
import "dotenv/config";

import { prisma } from "./config/prisma.js";
import authRoutes from "./routes/auth.routes.js";
import productRoutes from "./routes/product.routes.js";
import swaggerUi from "swagger-ui-express";
import { swaggerDocument } from "./config/swagger.js";
import dashboardRoutes from "./routes/dashboard.routes.js";
import settingsRoutes from "./routes/settings.routes.js";

const app = express();

const allowedOrigins = [
  "http://localhost:5174",
  "https://stockflow-3d1bhoqp0-praveendanes-projects.vercel.app",
];

app.use(
  cors({
    origin: allowedOrigins,
  })
);
app.use(express.json());

// Swagger documentation
app.use("/docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// API routes
app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/settings", settingsRoutes);

// Root route
app.get("/", (req, res) => {
  res.json({
    message: "StockFlow API is running successfully!",
  });
});

// Database connection test
app.get("/api/health/db", async (req, res) => {
  try {
    await prisma.$connect();

    res.json({
      message: "Database connected successfully!",
    });
  } catch (error) {
    console.error("Database connection error:", error);

    res.status(500).json({
      message: "Database connection failed",
    });
  }
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});


// Graceful shutdown
const shutdown = async () => {
  console.log("Shutting down StockFlow API...");

  await prisma.$disconnect();
  process.exit(0);
};

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);
