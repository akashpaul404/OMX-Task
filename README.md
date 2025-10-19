# 🤖 Document Upload Automation System

MERN stack automation with React Flow visualization, Google Drive upload, and Gmail notifications.

## Prerequisites

- Node.js v16+

## Installation

Clone repository

git clone https://github.com/akashpaul404/OMX-Task.git
cd OMX

Install backend
cd server
npm install

Install frontend
cd ../client
npm install

text

## Setup

**Add provided files to `server/` folder:**
- `.env`
- `credentials.json`
- `token.json`

(Files shared separately via email/zip)

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
3. Watch real-time workflow 
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

OMX/
├── client/ # React frontend
└── server/ # Node.js backend

text

---

**Contact:** Akash Paul | akash.paul8080@gmail.com