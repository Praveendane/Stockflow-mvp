
import { prisma } from "../config/prisma.js";

// Get organization settings
export const getSettings = async (req, res) => {
  try {
    const organizationId = req.user.organizationId;

    const settings = await prisma.settings.findUnique({
      where: {
        organizationId,
      },
    });

    if (!settings) {
      return res.status(404).json({
        message: "Organization settings not found",
      });
    }

    return res.status(200).json({
      message: "Settings retrieved successfully",
      settings,
    });
  } catch (error) {
    console.error("Get settings error:", error);

    return res.status(500).json({
      message: "Unable to retrieve settings",
    });
  }
};

// Update organization settings
export const updateSettings = async (req, res) => {
  try {
    const organizationId = req.user.organizationId;
    const { defaultLowStockThreshold } = req.body;

    // Validate threshold
    if (
      !Number.isInteger(defaultLowStockThreshold) ||
      defaultLowStockThreshold < 0
    ) {
      return res.status(400).json({
        message: "Default low-stock threshold must be a non-negative integer",
      });
    }

    const settings = await prisma.settings.upsert({
      where: {
        organizationId,
      },
      update: {
        defaultLowStockThreshold,
      },
      create: {
        organizationId,
        defaultLowStockThreshold,
      },
    });

    return res.status(200).json({
      message: "Settings updated successfully",
      settings,
    });
  } catch (error) {
    console.error("Update settings error:", error);

    return res.status(500).json({
      message: "Unable to update settings",
    });
  }
};
