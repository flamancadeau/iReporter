const express = require("express");
const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
require("dotenv").config();
// const ReportModel = require("../modals/Report"); // Correct the path if needed

const router = express.Router();
const prisma = new PrismaClient();
const saltRounds = 10;
const jwtSecret = process.env.JWT_SECRET;

// User Registration
router.post("/register", async (req, res) => {
  const { name, email, password } = req.body;

  // Input validation
  if (!name || !email || !password) {
    return res.status(400).json({
      message: "All fields are required",
    });
  }

  try {
    // Check if user already exists
    const existingUser = await prisma.users.findUnique({
      where: { email },
    });

    if (existingUser) {
      return res.status(400).json({
        message: "Email is already registered",
      });
    }

    // Hash password and create user
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    const newUser = await prisma.users.create({
      data: {
        name,
        email,
        password: hashedPassword,
        isAdmin: false, // Default value
      },
      select: {
        id: true,
        name: true,
        email: true,
        isAdmin: true,
        dateOfJoining: true,
        _count: {
          select: {
            reports: true,
          },
        },
      },
    });

    res.status(201).json({
      message: "Registration successful",
      user: newUser,
    });
  } catch (error) {
    console.error("Registration error:", error);
    res.status(500).json({
      message: "Registration failed",
      error: error.message,
    });
  }
});

// User Login
router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    // Find the user by email
    const user = await prisma.users.findUnique({
      where: { email },
      select: {
        id: true,
        password: true,
        name: true,
        isAdmin: true,
        email: true, // Add email to the response data
      },
    });

    if (!user) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    // Compare the provided password with the stored hashed password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    // Generate a JWT token for the user
    const token = jwt.sign(
      {
        userId: user.id,
        isAdmin: user.isAdmin,
        name: user.name,
      },
      jwtSecret,
      { expiresIn: "1d" }
    );

    // Send the response with user info and token
    res.status(200).json({
      message: "Login successful",
      token,
      user: {
        userId: user.id, // Send user ID
        name: user.name,
        email: user.email, // Send email as well
        isAdmin: user.isAdmin,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Error logging in", error: error.message });
  }
});

module.exports = router;
