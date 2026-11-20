import express from "express";
import { createProduct } from "../controllers/product.controller.js";
import { authenticate } from "../middleware/auth.middleware.js";

const router = express.Router();

router.use(authenticate);

router.post("/", createProduct);

export default router;