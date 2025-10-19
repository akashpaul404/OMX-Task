require("dotenv").config();
const express = require("express");
const cors = require("cors");
const cron = require("node-cron");
const fs = require("fs");
const emailService = require("./services/emailService");
const driveService = require("./services/driveService");
const pollingService = require("./services/pollingService");
const uploadRoutes = require("./routes/uploadRoutes");

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(express.json());
app.use(cors());

// Routes
app.use("/api", uploadRoutes);

// Health check endpoint
app.get("/", (req, res) => {
  res.json({
    status: "running",
    message: "Document Automation Server is running!",
    environment: process.env.NODE_ENV || "development",
    driveConfigured:
      process.env.GOOGLE_DRIVE_FOLDER_ID !== "YOUR_DRIVE_FOLDER_ID_HERE",
    emailConfigured:
      process.env.SMTP_USER && process.env.SMTP_USER !== "your-email@gmail.com",
  });
});

// Initialize services when server starts
async function startServer() {
  try {
    console.log("\n" + "=".repeat(60));
    console.log("🚀 DOCUMENT AUTOMATION SYSTEM - Starting...");
    console.log("=".repeat(60) + "\n");

    // Create necessary folders
    ["./uploads"].forEach((dir) => {
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
        console.log(`📁 Created directory: ${dir}`);
      }
    });

    // Initialize Google Drive API
    console.log("\n📦 Initializing Google Drive API...");
    await driveService.initializeDriveClient();

    // Initialize Email Service
    console.log("\n📧 Initializing Email Service...");
    await emailService.initializeTransporter();

    // Check configuration
    console.log("\n⚙️  Configuration Check:");
    console.log(
      `   • Drive Folder ID: ${
        process.env.GOOGLE_DRIVE_FOLDER_ID === "YOUR_DRIVE_FOLDER_ID_HERE"
          ? "⚠️  NOT SET"
          : "✅ Configured"
      }`
    );
    console.log(
      `   • Gmail SMTP: ${
        process.env.SMTP_USER === "your-email@gmail.com"
          ? "⚠️  NOT SET"
          : "✅ Configured"
      }`
    );
    console.log(
      `   • Polling Interval: ${process.env.POLLING_INTERVAL || 30} seconds`
    );

    // Start polling service (optional, since we trigger workflow immediately on upload)
    const pollingInterval = parseInt(process.env.POLLING_INTERVAL) || 30;
    console.log(
      `\n⏰ Starting background polling service (every ${pollingInterval} seconds)...`
    );

    cron.schedule(`*/${pollingInterval} * * * * *`, () => {
      pollingService.checkNewFiles();
    });

    // Start server
    app.listen(PORT, () => {
      console.log("\n" + "=".repeat(60));
      console.log(`✅ Server running on http://localhost:${PORT}`);
      console.log("=".repeat(60) + "\n");

      if (process.env.GOOGLE_DRIVE_FOLDER_ID === "YOUR_DRIVE_FOLDER_ID_HERE") {
        console.log(
          "⚠️  WARNING: Please set GOOGLE_DRIVE_FOLDER_ID in .env file\n"
        );
      }
    });
  } catch (error) {
    console.error("\n❌ Failed to start server:", error.message);
    console.error("\nPlease check:");
    console.error("1. .env file is properly configured");
    console.error("2. credentials.json and token.json exist in server folder");
    console.error("3. Gmail App Password is correct\n");
    process.exit(1);
  }
}

startServer();
