import { prisma } from "../config/prisma.js";

export const createProduct = async (req, res) => {
  try {
    const {
      name,
      sku,
      description,
      quantityOnHand,
      costPrice,
      sellingPrice,
      lowStockThreshold,
    } = req.body;

    // Validate required fields
    if (!name?.trim() || !sku?.trim()) {
      return res.status(400).json({
        message: "Product name and SKU are required",
      });
    }

    // Validate quantity
    if (
      quantityOnHand !== undefined &&
      (!Number.isInteger(quantityOnHand) || quantityOnHand < 0)
    ) {
      return res.status(400).json({
        message: "Quantity must be a non-negative integer",
      });
    }

    // Create product for authenticated organization
    const product = await prisma.product.create({
      data: {
        name: name.trim(),
        sku: sku.trim(),
        description,
        quantityOnHand: quantityOnHand ?? 0,
        costPrice,
        sellingPrice,
        lowStockThreshold,
        organizationId: req.user.organizationId,
      },
    });

    return res.status(201).json({
      message: "Product created successfully",
      product,
    });
  } catch (error) {
    if (error.code === "P2002") {
      return res.status(409).json({
        message: "SKU already exists in your organization",
      });
    }

    console.error("Create product error:", error);

    return res.status(500).json({
      message: "Unable to create product",
    });
  }
};