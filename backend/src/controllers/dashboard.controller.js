
import { prisma } from "../config/prisma.js";

export const getDashboardSummary = async (req, res) => {
  try {
    const organizationId = req.user.organizationId;

    // Get organization settings
    const settings = await prisma.settings.findUnique({
      where: {
        organizationId,
      },
    });

    const defaultThreshold =
      settings?.defaultLowStockThreshold ?? 5;

    // Get dashboard statistics
    const [totalProducts, quantityResult, products] =
      await Promise.all([
        prisma.product.count({
          where: { organizationId },
        }),

        prisma.product.aggregate({
          where: { organizationId },
          _sum: {
            quantityOnHand: true,
          },
        }),

        prisma.product.findMany({
          where: { organizationId },
          select: {
            id: true,
            name: true,
            sku: true,
            quantityOnHand: true,
            lowStockThreshold: true,
          },
          orderBy: {
            quantityOnHand: "asc",
          },
        }),
      ]);

    // Identify low-stock products
    const lowStockProducts = products.filter((product) => {
      const threshold =
        product.lowStockThreshold ?? defaultThreshold;

      return product.quantityOnHand <= threshold;
    });

    return res.status(200).json({
      message: "Dashboard summary retrieved successfully",

      summary: {
        totalProducts,
        totalQuantity: quantityResult._sum.quantityOnHand ?? 0,
        lowStockCount: lowStockProducts.length,
        lowStockProducts,
        defaultLowStockThreshold: defaultThreshold,
      },
    });
  } catch (error) {
    console.error("Dashboard summary error:", error);

    return res.status(500).json({
      message: "Unable to retrieve dashboard summary",
    });
  }
};
