
import express from "express";
import {
  getSettings,
  updateSettings,
} from "../controllers/settings.controller.js";
import { authenticate } from "../middleware/auth.middleware.js";

const router = express.Router();

// Protect all settings routes
router.use(authenticate);

// Get organization settings
router.get("/", getSettings);

// Update organization settings
router.put("/", updateSettings);

export default router;
