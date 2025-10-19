require("dotenv").config();
const fs = require("fs").promises;
const path = require("path");
const emailService = require("./emailService");
const driveService = require("./driveService");

let processedFiles = new Set();
let currentWorkflow = null; // Track current workflow execution

/**
 * Check for new files in uploads directory and execute automation
 */
async function checkNewFiles() {
  try {
    // Check if uploads directory exists
    try {
      await fs.access("./uploads");
    } catch {
      console.log("📁 Creating uploads directory...");
      await fs.mkdir("./uploads", { recursive: true });
      return;
    }

    const files = await fs.readdir("./uploads");

    // Filter out system files and directories
    const validFiles = [];
    for (const file of files) {
      const filePath = path.join("./uploads", file);
      const stats = await fs.stat(filePath);
      if (stats.isFile() && !file.startsWith(".")) {
        validFiles.push(file);
      }
    }

    // Process new files
    for (const file of validFiles) {
      if (!processedFiles.has(file)) {
        console.log(`\n🔔 New file detected: ${file}`);
        await executeWorkflow(file);
        processedFiles.add(file);
      }
    }
  } catch (error) {
    console.error("❌ Error in polling service:", error.message);
  }
}

/**
 * Execute automation workflow for uploaded file
 * Returns workflow status for frontend polling
 */
async function executeWorkflow(filename, recipientEmail = null) {
  const workflowId = Date.now();

  currentWorkflow = {
    id: workflowId,
    filename: filename,
    status: "running",
    steps: [
      {
        id: "trigger",
        name: "File Upload",
        status: "completed",
        timestamp: new Date(),
      },
      { id: "node1", name: "Send Email", status: "pending", timestamp: null },
      {
        id: "node2",
        name: "Create Drive Folder & Upload",
        status: "pending",
        timestamp: null,
      },
    ],
    startTime: new Date(),
    endTime: null,
    error: null,
    driveLink: null,
    folderLink: null,
  };

  try {
    console.log(`\n🔄 Executing workflow for: ${filename}`);
    console.log("━".repeat(50));

    // Get recipient email from workflow or use default
    const emailRecipient =
      recipientEmail ||
      process.env.DEFAULT_RECIPIENT_EMAIL ||
      "test@example.com";

    // Node 1: Mark as Running (we'll send email AFTER Drive upload)
    console.log("📧 Node 1: Preparing email notification...");
    currentWorkflow.steps[1].status = "running";

    // Node 2: Upload to Google Drive FIRST
    console.log("\n📁 Node 2: Uploading to Google Drive...");
    currentWorkflow.steps[2].status = "running";

    // Check if Drive folder ID is configured
    const driveFolderId = process.env.GOOGLE_DRIVE_FOLDER_ID;
    if (!driveFolderId || driveFolderId === "YOUR_DRIVE_FOLDER_ID_HERE") {
      throw new Error(
        "Google Drive Folder ID not configured in .env file. Please set GOOGLE_DRIVE_FOLDER_ID."
      );
    }

    // Extract original filename (remove timestamp prefix)
    const originalName = filename.split("-").slice(1).join("-");
    const folderName = path.parse(originalName).name;

    // Create folder in Google Drive
    const driveFolder = await driveService.createFolderInDrive(
      folderName,
      driveFolderId
    );

    // Upload file to the created folder
    const localFilePath = path.join("./uploads", filename);
    const uploadedFile = await driveService.uploadFileToDrive(
      localFilePath,
      originalName,
      driveFolder.id
    );

    // Delete local file after successful upload
    await driveService.deleteLocalFile(localFilePath);

    currentWorkflow.steps[2].status = "completed";
    currentWorkflow.steps[2].timestamp = new Date();
    currentWorkflow.driveLink = uploadedFile.webViewLink;
    currentWorkflow.folderLink = driveFolder.webViewLink;

    console.log(
      "✅ Node 2 Complete: File uploaded to Drive and local file deleted"
    );
    console.log("🔗 Drive Link:", uploadedFile.webViewLink);

    // Now send email with Drive link included
    console.log("\n📧 Node 1: Sending email notification with Drive link...");
    await emailService.sendUploadNotification(
      originalName,
      emailRecipient,
      uploadedFile.webViewLink
    );

    currentWorkflow.steps[1].status = "completed";
    currentWorkflow.steps[1].timestamp = new Date();
    console.log("✅ Node 1 Complete: Email sent to", emailRecipient);

    console.log("━".repeat(50));
    console.log("✅ Workflow executed successfully!\n");

    currentWorkflow.status = "completed";
    currentWorkflow.endTime = new Date();

    return {
      success: true,
      workflow: currentWorkflow,
    };
  } catch (error) {
    console.error("❌ Error executing workflow:", error.message);

    currentWorkflow.status = "failed";
    currentWorkflow.error = error.message;
    currentWorkflow.endTime = new Date();

    // Mark current step as failed
    const runningStep = currentWorkflow.steps.find(
      (s) => s.status === "running"
    );
    if (runningStep) {
      runningStep.status = "failed";
      runningStep.timestamp = new Date();
    }

    return {
      success: false,
      error: error.message,
      workflow: currentWorkflow,
    };
  }
}

/**
 * Get current workflow status (for frontend polling)
 */
function getCurrentWorkflowStatus() {
  return currentWorkflow;
}

/**
 * Clear workflow status
 */
function clearWorkflowStatus() {
  currentWorkflow = null;
}

module.exports = {
  checkNewFiles,
  executeWorkflow,
  getCurrentWorkflowStatus,
  clearWorkflowStatus,
};
