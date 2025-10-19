const express = require("express");
const multer = require("multer");
const path = require("path");
const pollingService = require("../services/pollingService");
const router = express.Router();

// Configure multer storage - IMPORTANT: Use buffer to preserve file integrity
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./uploads/");
  },
  filename: function (req, file, cb) {
    // Keep original filename with timestamp to avoid duplicates
    const uniqueName = Date.now() + "-" + file.originalname;
    cb(null, uniqueName);
  },
});

// File filter (optional - only allow certain file types)
const fileFilter = (req, file, cb) => {
  // Accept any file type for testing
  cb(null, true);
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB limit
  },
});

// Upload endpoint with email recipient
router.post("/upload", upload.single("file"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "No file uploaded",
      });
    }

    // Get recipient email from request body
    const recipientEmail = req.body.recipientEmail;

    if (!recipientEmail) {
      return res.status(400).json({
        success: false,
        message: "Recipient email is required",
      });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(recipientEmail)) {
      return res.status(400).json({
        success: false,
        message: "Invalid email format",
      });
    }

    console.log("📤 File uploaded:", req.file.filename);
    console.log("📧 Recipient email:", recipientEmail);

    // Store recipient email for polling service
    // We'll trigger workflow immediately for better UX
    const workflowResult = await pollingService.executeWorkflow(
      req.file.filename,
      recipientEmail
    );

    if (workflowResult.success) {
      res.json({
        success: true,
        message: "File uploaded successfully! Workflow executed.",
        filename: req.file.filename,
        originalName: req.file.originalname,
        size: req.file.size,
        recipientEmail: recipientEmail,
        workflow: workflowResult.workflow,
      });
    } else {
      res.status(500).json({
        success: false,
        message: "File uploaded but workflow failed",
        error: workflowResult.error,
        workflow: workflowResult.workflow,
      });
    }
  } catch (error) {
    console.error("Upload error:", error);
    res.status(500).json({
      success: false,
      message: "Error uploading file",
      error: error.message,
    });
  }
});

// Get workflow status endpoint (for frontend polling)
router.get("/workflow-status", (req, res) => {
  const status = pollingService.getCurrentWorkflowStatus();
  res.json({
    success: true,
    workflow: status,
  });
});

module.exports = router;
