
import express from "express";
import {
  createProduct,
  getProducts,
  getProductById,
  updateProduct,
  deleteProduct,
} from "../controllers/product.controller.js";
import { authenticate } from "../middleware/auth.middleware.js";

const router = express.Router();

// Protect all product routes
router.use(authenticate);

// Create a product
router.post("/", createProduct);

// Get products with search and pagination
router.get("/", getProducts);
router.get("/:id", getProductById);
router.put("/:id", updateProduct);
// Delete a product
router.delete("/:id", deleteProduct);

export default router;
