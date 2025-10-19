# 🤖 Document Upload Automation System

MERN stack automation with React Flow visualization, Google Drive upload, and Gmail notifications.

## Prerequisites

- Node.js v16+

## Installation

**Clone repository:**
git clone https://github.com/akashpaul404/OMX-Task.git
cd OMX-Task

text

**Install backend:**
cd server
npm install

text

**Install frontend:**
cd ../client
npm install

text

## Credential Setup

### Step 1: Get Google Drive Credentials

**Create OAuth 2.0 Credentials:**

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create new project: "Document Automation"
3. Enable **Google Drive API**:
   - APIs & Services → Library
   - Search "Google Drive API"
   - Click Enable
4. Create credentials:
   - APIs & Services → Credentials
   - Click "Create Credentials" → "OAuth client ID"
   - Application type: **Desktop app**
   - Name: "Document Automation Desktop"
   - Click "Create"
5. **Download JSON** → Save as `credentials.json`
6. Place in `server/` folder

### Step 2: Generate Token

cd server
node generateToken.js

text

**Follow the prompts:**

1. Copy the URL shown
2. Open in browser and authorize
3. Copy the code from browser
4. Paste back into terminal
5. `token.json` will be created automatically

### Step 3: Gmail Setup

**Create App Password:**

1. **Enable 2-Step Verification:**

   - Go to [Google Security](https://myaccount.google.com/security)
   - Click "2-Step Verification" → Turn on

2. **Create App Password:**
   - Go to [App Passwords](https://myaccount.google.com/apppasswords)
   - App name: "Document Automation"
   - Click "Create"
   - Copy the 16-digit password

### Step 4: Create Drive Folder

1. Open [Google Drive](https://drive.google.com)
2. Create new folder: "Automation Demo"
3. Open the folder
4. Copy folder ID from URL:
   https://drive.google.com/drive/folders/1AbC2DeF3GhI
                                          ^^^^^^^^^^^^^^^^
   This is your folder ID

text

### Step 5: Configure .env

Create `server/.env` file:

PORT=5000
GOOGLE_DRIVE_FOLDER_ID=paste_your_folder_id_here
GOOGLE_CREDENTIALS_PATH=./credentials.json
GOOGLE_TOKEN_PATH=./token.json
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-16-digit-app-password
EMAIL_FROM_NAME=Document Automation
EMAIL_FROM_ADDRESS=your-email@gmail.com
POLLING_INTERVAL=30

text

**✅ Save and you're ready!**

## Run

**Terminal 1 - Backend:**
cd server
node server.js

text
✅ Wait for: `Server running on http://localhost:5000`

**Terminal 2 - Frontend:**
cd client
npm start

text
✅ Opens: `http://localhost:3000`

## Usage

1. Enter your email address
2. Select and upload any document
3. Watch real-time workflow animation
4. Check your email for notification with Drive link

## Features

- Real-time workflow visualization with animated nodes
- Automated email notifications via Gmail
- Google Drive integration with folder creation
- File upload with polling-based automation

## Troubleshooting

**Error: `ERR_CONNECTION_REFUSED`**

- Ensure backend is running (Terminal 1)
- Hard refresh browser: `Ctrl + Shift + R`

**Backend doesn't start:**

- Check all 3 files (`.env`, `credentials.json`, `token.json`) are in `server/` folder
- Run: `cd server && npm install` again

## Tech Stack

React 19 · React Flow 11 · Node.js · Express 5 · Google Drive API · Gmail SMTP

## Project Structure

OMX-Task/
├── client/ # React frontend (port 3000)
└── server/ # Node.js backend (port 5000)

text

---

**Contact:** Akash Paul | akash.paul8080@gmail.com
