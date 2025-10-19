require("dotenv").config();
const nodemailer = require("nodemailer");

let transporter = null;

/**
 * Initialize email transporter with Gmail SMTP
 */
async function initializeTransporter() {
  try {
    // Check if Gmail credentials are configured
    if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
      throw new Error("Gmail SMTP credentials not configured in .env file");
    }

    if (process.env.SMTP_PASS === "your-app-password-here") {
      throw new Error(
        "Please update SMTP_PASS in .env with your Gmail App Password"
      );
    }

    // Create transporter with Gmail SMTP
    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT),
      secure: process.env.SMTP_SECURE === "true",
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    // Verify connection
    await transporter.verify();

    console.log("✅ Gmail SMTP service initialized successfully");
    console.log(`📧 Sending emails from: ${process.env.SMTP_USER}`);

    return transporter;
  } catch (error) {
    console.error("❌ Failed to initialize email service:", error.message);
    throw error;
  }
}

/**
 * Send email notification when document is uploaded
 */
async function sendUploadNotification(
  filename,
  recipientEmail,
  driveLink = null
) {
  try {
    if (!transporter) {
      await initializeTransporter();
    }

    const mailOptions = {
      from: `"${process.env.EMAIL_FROM_NAME}" <${process.env.EMAIL_FROM_ADDRESS}>`,
      to: recipientEmail,
      subject: "📄 Document Uploaded Successfully - Automation Workflow",
      text: `Your document "${filename}" has been uploaded successfully.${
        driveLink ? "\nView in Drive: " + driveLink : ""
      }`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f5f5f5;">
          <div style="background-color: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 5px rgba(0,0,0,0.1);">
            <h2 style="color: #2c3e50; margin-top: 0;">📄 Document Upload Notification</h2>
            
            <div style="background-color: #e8f5e9; padding: 15px; border-left: 4px solid #4caf50; margin: 20px 0;">
              <p style="margin: 0; color: #2e7d32;">
                <strong>Success!</strong> Your document has been processed by the automation workflow.
              </p>
            </div>
            
            <div style="margin: 20px 0;">
              <p style="color: #555;"><strong>Document Name:</strong></p>
              <p style="background-color: #f9f9f9; padding: 10px; border-radius: 5px; font-family: monospace;">
                ${filename}
              </p>
            </div>
            
            ${
              driveLink
                ? `
              <div style="margin: 20px 0;">
                <a href="${driveLink}" 
                   style="display: inline-block; background-color: #4285f4; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold;">
                  📁 View in Google Drive
                </a>
              </div>
            `
                : ""
            }
            
            <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee;">
              <p style="color: #999; font-size: 12px; margin: 5px 0;">
                <strong>Workflow Steps Completed:</strong>
              </p>
              <ul style="color: #999; font-size: 12px;">
                <li>✅ Document uploaded</li>
                <li>✅ Email notification sent</li>
                <li>✅ Folder created in Google Drive</li>
              </ul>
            </div>
            
            <div style="margin-top: 20px; padding: 15px; background-color: #fff3cd; border-radius: 5px;">
              <p style="margin: 0; color: #856404; font-size: 14px;">
                <strong>⏰ Timestamp:</strong> ${new Date().toLocaleString(
                  "en-IN",
                  { timeZone: "Asia/Kolkata" }
                )}
              </p>
            </div>
          </div>
          
          <div style="text-align: center; margin-top: 20px; color: #999; font-size: 12px;">
            <p>This is an automated email from Document Automation System</p>
          </div>
        </div>
      `,
    };

    // Send email
    const info = await transporter.sendMail(mailOptions);

    console.log("✅ Email sent successfully");
    console.log(`📧 Sent to: ${recipientEmail}`);
    console.log("Message ID:", info.messageId);

    return {
      success: true,
      messageId: info.messageId,
      recipient: recipientEmail,
    };
  } catch (error) {
    console.error("❌ Error sending email:", error.message);
    throw error;
  }
}

module.exports = {
  initializeTransporter,
  sendUploadNotification,
};
