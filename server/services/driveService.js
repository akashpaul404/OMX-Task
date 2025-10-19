require('dotenv').config();
const fs = require('fs').promises;
const path = require('path');
const { google } = require('googleapis');

let driveClient = null;

/**
 * Initialize Google Drive API client
 */
async function initializeDriveClient() {
  try {
    const credentialsPath = path.join(__dirname, '..', process.env.GOOGLE_CREDENTIALS_PATH);
    const tokenPath = path.join(__dirname, '..', process.env.GOOGLE_TOKEN_PATH);

    // Check if credentials exist
    try {
      await fs.access(credentialsPath);
      await fs.access(tokenPath);
    } catch (error) {
      throw new Error(`Missing Google Drive credentials. Please ensure credentials.json and token.json exist in server folder.`);
    }

    // Load credentials
    const credentials = JSON.parse(await fs.readFile(credentialsPath, 'utf8'));
    const token = JSON.parse(await fs.readFile(tokenPath, 'utf8'));

    const { client_secret, client_id, redirect_uris } = credentials.installed || credentials.web;

    // Create OAuth2 client
    const oAuth2Client = new google.auth.OAuth2(
      client_id,
      client_secret,
      redirect_uris[0]
    );

    oAuth2Client.setCredentials(token);

    // Create Drive client
    driveClient = google.drive({ version: 'v3', auth: oAuth2Client });

    console.log('✅ Google Drive API initialized successfully');
    return driveClient;

  } catch (error) {
    console.error('❌ Failed to initialize Google Drive:', error.message);
    throw error;
  }
}

/**
 * Create folder in Google Drive
 */
async function createFolderInDrive(folderName, parentFolderId) {
  try {
    if (!driveClient) {
      await initializeDriveClient();
    }

    // Check if folder already exists
    const query = `name='${folderName}' and '${parentFolderId}' in parents and mimeType='application/vnd.google-apps.folder' and trashed=false`;
    
    const existingFolders = await driveClient.files.list({
      q: query,
      fields: 'files(id, name)',
    });

    if (existingFolders.data.files.length > 0) {
      console.log(`📁 Folder "${folderName}" already exists in Drive`);
      return existingFolders.data.files[0];
    }

    // Create new folder
    const fileMetadata = {
      name: folderName,
      mimeType: 'application/vnd.google-apps.folder',
      parents: [parentFolderId],
    };

    const folder = await driveClient.files.create({
      requestBody: fileMetadata,
      fields: 'id, name, webViewLink',
    });

    console.log(`✅ Created folder in Drive: ${folderName}`);
    console.log(`🔗 Folder link: ${folder.data.webViewLink}`);

    return folder.data;

  } catch (error) {
    console.error(`❌ Error creating folder in Drive:`, error.message);
    throw error;
  }
}

/**
 * Upload file to Google Drive
 */
async function uploadFileToDrive(localFilePath, fileName, folderId) {
  try {
    if (!driveClient) {
      await initializeDriveClient();
    }

    // Get file mime type
    const mimeType = getMimeType(fileName);

    const fileMetadata = {
      name: fileName,
      parents: [folderId],
    };

    const media = {
      mimeType: mimeType,
      body: require('fs').createReadStream(localFilePath),
    };

    const file = await driveClient.files.create({
      requestBody: fileMetadata,
      media: media,
      fields: 'id, name, webViewLink, mimeType, size',
    });

    console.log(`✅ Uploaded file to Drive: ${fileName}`);
    console.log(`🔗 File link: ${file.data.webViewLink}`);

    return file.data;

  } catch (error) {
    console.error(`❌ Error uploading file to Drive:`, error.message);
    throw error;
  }
}

/**
 * Get MIME type from file extension
 */
function getMimeType(fileName) {
  const ext = path.extname(fileName).toLowerCase();
  const mimeTypes = {
    '.pdf': 'application/pdf',
    '.doc': 'application/msword',
    '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    '.xls': 'application/vnd.ms-excel',
    '.xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    '.ppt': 'application/vnd.ms-powerpoint',
    '.pptx': 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    '.txt': 'text/plain',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.png': 'image/png',
    '.gif': 'image/gif',
    '.zip': 'application/zip',
    '.rar': 'application/x-rar-compressed',
  };
  
  return mimeTypes[ext] || 'application/octet-stream';
}

/**
 * Delete local file after successful upload
 */
async function deleteLocalFile(filePath) {
  try {
    await fs.unlink(filePath);
    console.log(`🗑️  Deleted local file: ${path.basename(filePath)}`);
  } catch (error) {
    console.error(`⚠️  Warning: Could not delete local file:`, error.message);
  }
}

module.exports = {
  initializeDriveClient,
  createFolderInDrive,
  uploadFileToDrive,
  deleteLocalFile,
};
