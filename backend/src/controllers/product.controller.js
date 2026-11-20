
import { prisma } from "../config/prisma.js";

// Validate optional prices: allow null, otherwise require a finite non-negative number
const isValidOptionalPrice = (value) =>
  value === undefined ||
  value === null ||
  (typeof value === "number" &&
    Number.isFinite(value) &&
    value >= 0);

// Validate optional stock threshold: allow null, otherwise require a non-negative integer
const isValidOptionalThreshold = (value) =>
  value === undefined ||
  value === null ||
  (Number.isInteger(value) && value >= 0);

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
    if (
      typeof name !== "string" ||
      !name.trim() ||
      typeof sku !== "string" ||
      !sku.trim()
    ) {
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

    // Validate prices
    if (
      !isValidOptionalPrice(costPrice) ||
      !isValidOptionalPrice(sellingPrice)
    ) {
      return res.status(400).json({
        message: "Prices must be non-negative numbers",
      });
    }

    // Validate low-stock threshold
    if (!isValidOptionalThreshold(lowStockThreshold)) {
      return res.status(400).json({
        message: "Low-stock threshold must be a non-negative integer",
      });
    }

    // Validate description
    if (
      description !== undefined &&
      description !== null &&
      typeof description !== "string"
    ) {
      return res.status(400).json({
        message: "Description must be a string",
      });
    }

    // Create product for authenticated organization
    const product = await prisma.product.create({
      data: {
        name: name.trim(),
        sku: sku.trim(),
        description: description ?? null,
        quantityOnHand: quantityOnHand ?? 0,
        costPrice: costPrice ?? null,
        sellingPrice: sellingPrice ?? null,
        lowStockThreshold: lowStockThreshold ?? null,
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

export const getProducts = async (req, res) => {
  try {
    // Read pagination and search parameters
    const search = req.query.search?.trim() || "";
    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const limit = Math.min(
      100,
      Math.max(1, parseInt(req.query.limit, 10) || 10)
    );

    const skip = (page - 1) * limit;

    // Always restrict results to the authenticated organization
    const where = {
      organizationId: req.user.organizationId,
      ...(search && {
        OR: [
          {
            name: {
              contains: search,
              mode: "insensitive",
            },
          },
          {
            sku: {
              contains: search,
              mode: "insensitive",
            },
          },
        ],
      }),
    };

    // Fetch products and total matching count
    const [products, totalProducts] = await Promise.all([
      prisma.product.findMany({
        where,
        skip,
        take: limit,
        orderBy: {
          createdAt: "desc",
        },
      }),
      prisma.product.count({ where }),
    ]);

    return res.status(200).json({
      message: "Products retrieved successfully",
      products,
      pagination: {
        currentPage: page,
        pageSize: limit,
        totalProducts,
        totalPages: Math.ceil(totalProducts / limit),
      },
    });
  } catch (error) {
    console.error("Get products error:", error);

    return res.status(500).json({
      message: "Unable to retrieve products",
    });
  }
};

export const getProductById = async (req, res) => {
  try {
    const { id } = req.params;

    const product = await prisma.product.findFirst({
      where: {
        id,
        organizationId: req.user.organizationId,
      },
    });

    if (!product) {
      return res.status(404).json({
        message: "Product not found",
      });
    }

    return res.status(200).json({
      message: "Product retrieved successfully",
      product,
    });
  } catch (error) {
    console.error("Get product error:", error);

    return res.status(500).json({
      message: "Unable to retrieve product",
    });
  }
};

export const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;

    const {
      name,
      sku,
      description,
      quantityOnHand,
      costPrice,
      sellingPrice,
      lowStockThreshold,
    } = req.body;

    // Check whether the product belongs to this organization
    const existingProduct = await prisma.product.findFirst({
      where: {
        id,
        organizationId: req.user.organizationId,
      },
    });

    if (!existingProduct) {
      return res.status(404).json({
        message: "Product not found",
      });
    }

    // Validate required fields when provided
    if (
      (name !== undefined &&
        (typeof name !== "string" || !name.trim())) ||
      (sku !== undefined &&
        (typeof sku !== "string" || !sku.trim()))
    ) {
      return res.status(400).json({
        message: "Product name and SKU cannot be empty",
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

    // Validate prices
    if (
      !isValidOptionalPrice(costPrice) ||
      !isValidOptionalPrice(sellingPrice)
    ) {
      return res.status(400).json({
        message: "Prices must be non-negative numbers",
      });
    }

    // Validate low-stock threshold
    if (!isValidOptionalThreshold(lowStockThreshold)) {
      return res.status(400).json({
        message: "Low-stock threshold must be a non-negative integer",
      });
    }

    // Validate description
    if (
      description !== undefined &&
      description !== null &&
      typeof description !== "string"
    ) {
      return res.status(400).json({
        message: "Description must be a string",
      });
    }

    const product = await prisma.product.update({
      where: {
        id,
      },
      data: {
        ...(name !== undefined && { name: name.trim() }),
        ...(sku !== undefined && { sku: sku.trim() }),
        ...(description !== undefined && { description }),
        ...(quantityOnHand !== undefined && { quantityOnHand }),
        ...(costPrice !== undefined && { costPrice }),
        ...(sellingPrice !== undefined && { sellingPrice }),
        ...(lowStockThreshold !== undefined && { lowStockThreshold }),
      },
    });

    return res.status(200).json({
      message: "Product updated successfully",
      product,
    });
  } catch (error) {
    if (error.code === "P2002") {
      return res.status(409).json({
        message: "SKU already exists in your organization",
      });
    }

    console.error("Update product error:", error);

    return res.status(500).json({
      message: "Unable to update product",
    });
  }
};

export const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;

    // Find the product within the authenticated organization
    const existingProduct = await prisma.product.findFirst({
      where: {
        id,
        organizationId: req.user.organizationId,
      },
    });

    if (!existingProduct) {
      return res.status(404).json({
        message: "Product not found",
      });
    }

    // Delete the product
    await prisma.product.delete({
      where: {
        id,
      },
    });

    return res.status(200).json({
      message: "Product deleted successfully",
    });
  } catch (error) {
    console.error("Delete product error:", error);

    return res.status(500).json({
      message: "Unable to delete product",
    });
  }
};
