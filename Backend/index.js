// Initialize the Express app and connect to the database
const express = require("express");
const { PrismaClient } = require("@prisma/client");
const cors = require("cors");
const app = express();
const prisma = new PrismaClient();
// const { schema } = require("./src/modals/Report");
// const mongoose = require("mongoose");
// help to connected URl from frontend
app.use(
  cors({
    origin: "http://localhost:5173", // Or whatever your frontend URL is
    credentials: true,
  })
);

// Middleware to parse JSON
app.use(express.json());
app.use(cors());
// Check database connection
async function checkDatabaseConnection() {
  try {
    await prisma.$connect();
    console.log("Connected to MongoDB");
  } catch (error) {
    console.error("Error connecting to MongoDB", error);
    process.exit(1); // Exit the process with an error code
  }
}

checkDatabaseConnection();

// Basic route
app.get("/", (req, res) => {
  res.send("Hello, World the app is running!");
});

// routes
const authRoutes = require("./src/routes/auth");
const reportRoutes = require("./src/routes/reports");

app.use("/auth", authRoutes);
app.use("", reportRoutes);


const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
