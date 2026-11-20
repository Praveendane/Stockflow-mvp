import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { prisma } from "../config/prisma.js";

export const register = async (req, res) => {
  try {
    const { email, password, organizationName } = req.body;

    // Validate required fields
    if (!email || !password || !organizationName) {
      return res.status(400).json({
        message: "Email, password and organization name are required",
      });
    }

    if (password.length < 8) {
      return res.status(400).json({
        message: "Password must contain at least 8 characters",
      });
    }

    const normalizedEmail = email.trim().toLowerCase();

    // Check whether email already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (existingUser) {
      return res.status(409).json({
        message: "Email is already registered",
      });
    }

    // Securely hash password
    const passwordHash = await bcrypt.hash(password, 12);

    // Create organization, user and settings together
    const user = await prisma.$transaction(async (tx) => {
      const organization = await tx.organization.create({
        data: {
          name: organizationName.trim(),
        },
      });

      const newUser = await tx.user.create({
        data: {
          email: normalizedEmail,
          passwordHash,
          organizationId: organization.id,
        },
      });

      await tx.settings.create({
        data: {
          organizationId: organization.id,
        },
      });

      return {
        id: newUser.id,
        email: newUser.email,
        organizationId: organization.id,
        organizationName: organization.name,
      };
    });

    // Generate authentication token
    const token = jwt.sign(
      {
        userId: user.id,
        organizationId: user.organizationId,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: process.env.JWT_EXPIRES_IN || "1d",
      }
    );

    return res.status(201).json({
      message: "Registration successful",
      token,
      user,
    });
  } catch (error) {
    console.error("Registration error:", error);

    return res.status(500).json({
      message: "Registration failed",
    });
  }
};