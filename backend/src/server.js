import express from "express";
import cors from "cors";
import "dotenv/config";

import { prisma } from "./config/prisma.js";

const app = express();

app.use(cors());
app.use(express.json());

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