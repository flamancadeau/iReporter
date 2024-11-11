const express = require("express");
const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
require("dotenv").config();

 
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
        userId: user.id,  // Send user ID
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

// Creating Report (with location stored as JSON)

router.post("/report", async (req, res) => {
  const {
    type,
    title,
    description,
    status = "PENDING",
    latitude,
    longitude,
    incidentDate,
    reportDate,
    userId,
  } = req.body;

  // Validate required fields
  if (!latitude || !longitude || !incidentDate || !reportDate) {
    return res
      .status(400)
      .json({
        error:
          "Latitude, longitude, incidentDate, and reportDate are required.",
      });
  }

  try {
    const newReport = await prisma.report.create({
      data: {
        type,
        title,
        description,
        status,
        location: { latitude, longitude },
        incidentDate: new Date(incidentDate), // Parse to Date object
        reportDate: new Date(reportDate), // Parse to Date object
        user: {
          connect: { id: userId },
        },
      },
    });

    res.status(201).json({ message: "Report created", newReport });
  } catch (error) {
    console.error("Error creating report:", error);
    res
      .status(400)
      .json({ message: "Failed to create report", error: error.message });
  }
});
router.get("/reports", async (req, res) => {
  try {
    const reports = await prisma.report.findMany();
    res.status(200).json({ reports });
  } catch (error) {
    console.error("Error fetching reports:", error);
    res.status(500).json({ 
      message: "Error fetching reports", 
      error: error.message,
      stack: process.env.NODE_ENV === 'production' ? '🥞' : error.stack
    });
  }
});
module.exports = router;