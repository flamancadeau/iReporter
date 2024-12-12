const express = require("express");
const { PrismaClient } = require("@prisma/client");
const router = express.Router();
const prisma = new PrismaClient();
// import { NextResponse } from 'next/server';
// Create a new report (POST endpoint)
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
    return res.status(400).json({
      error: "Latitude, longitude, incidentDate, and reportDate are required.",
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

// Get all reports (GET endpoint)
router.get("/reports", async (req, res) => {
  try {
    const reports = await prisma.report.findMany(); // Fetch all reports
    res.status(200).json({ reports });
  } catch (error) {
    console.error("Error fetching reports:", error);
    res
      .status(500)
      .json({ message: "Failed to fetch reports", error: error.message });
  }
});

// Get reports for a specific user (GET endpoint)
router.get("/report/:userId", async (req, res) => {
  const { userId } = req.params; // Get userId from URL parameter

  try {
    const userReports = await prisma.report.findMany({
      where: {
        userId: userId, // Filter by userId
      },
    });

    if (userReports.length === 0) {
      return res
        .status(404)
        .json({ message: "No reports found for this user." });
    }

    res.status(200).json({ reports: userReports });
  } catch (error) {
    console.error("Error fetching user's reports:", error);
    res.status(500).json({
      message: "Failed to fetch reports for the user",
      error: error.message,
    });
  }
});

// Endpoint to delete a post
router.delete("/report/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const deletedReport = await prisma.report.delete({
      where: { id: id },
    });
    res
      .status(200)
      .json({ message: "report deleted successful", deletedReport });
  } catch (error) {
    res.status(400).json({ message: "Failed to delete report", error });
  }
});

router.patch("/report/:id", async (req, res) => {
  const { id } = req.params;
  const { title, description, incidentDate, latitude, longitude } = req.body;

  try {
    // Validate the ID
    if (!id) {
      return res.status(400).json({ message: "Report ID is required" });
    }

    // Ensure the fields to be updated are optional and only updated if present
    const updateData = {};

    if (title) updateData.title = title;
    if (description) updateData.description = description;

    // Convert incidentDate to a proper Date object if it's provided
    if (incidentDate) {
      const parsedDate = new Date(incidentDate);
      if (isNaN(parsedDate)) {
        return res
          .status(400)
          .json({ message: "Invalid date format for incidentDate" });
      }
      updateData.incidentDate = parsedDate;
    }

    // Validate and update location if latitude and longitude are provided
    if (latitude !== undefined && longitude !== undefined) {
      const parsedLatitude = parseFloat(latitude);
      const parsedLongitude = parseFloat(longitude);

      if (
        isNaN(parsedLatitude) ||
        parsedLatitude < -90 ||
        parsedLatitude > 90
      ) {
        return res
          .status(400)
          .json({ message: "Invalid latitude. Must be between -90 and 90." });
      }

      if (
        isNaN(parsedLongitude) ||
        parsedLongitude < -180 ||
        parsedLongitude > 180
      ) {
        return res.status(400).json({
          message: "Invalid longitude. Must be between -180 and 180.",
        });
      }

      updateData.location = {
        latitude: parsedLatitude,
        longitude: parsedLongitude,
      };
    }

    // Check if there's anything to update
    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({ message: "No fields to update" });
    }

    // Check if the report exists before updating
    const existingReport = await prisma.report.findUnique({
      where: { id: id },
    });

    if (!existingReport) {
      return res.status(404).json({ message: "Report not found" });
    }

    // Update the report in the database
    const updatedReport = await prisma.report.update({
      where: { id: id },
      data: updateData,
    });

    res
      .status(200)
      .json({ message: "Report updated successfully", updatedReport });
  } catch (error) {
    console.error("Error updating report:", error);

    if (error.code === "P2002") {
      return res
        .status(400)
        .json({ message: "Unique constraint violation", error: error.message });
    }

    res
      .status(500)
      .json({ message: "Failed to update report", error: error.message });
  }
});

// Update Report Status endpoint
router.put("/report/:id", async (req, res) => {
  // Extract the 'id' from the URL parameter (req.params) and 'status' from the request body (req.body)
  const { id } = req.params; // Extract id from route parameter
  const { status } = req.body; // Extract status from request body

  // Validate the status field
  const validStatuses = [
    "PENDING",
    "UNDER_INVESTIGATION",
    "RESOLVED",
    "REJECTED",
  ];
  if (!validStatuses.includes(status)) {
    return res.status(400).json({ error: "Invalid status provided." });
  }

  // Validate that the 'id' is present
  if (!id) {
    return res.status(400).json({ error: "Report ID is required." });
  }

  try {
    // Find the report by its ID
    const existingReport = await prisma.report.findUnique({
      where: { id: id },
    });

    if (!existingReport) {
      return res.status(404).json({ error: "Report not found" });
    }

    // Update the report's status
    const updatedReport = await prisma.report.update({
      where: { id: id },
      data: {
        status: status, // Update the status
        updatedAt: new Date(), // Optionally update the updatedAt timestamp
      },
    });

    // Return the updated report
    res.status(200).json({
      message: "Report status updated successfully",
      updatedReport,
    });
  } catch (error) {
    console.error("Error updating report status:", error);
    res.status(500).json({
      message: "Failed to update report status",
      error: error.message,
    });
  }
});

module.exports = router;
