const fs = require("fs");
const readline = require("readline");
const { google } = require("googleapis");

const SCOPES = ["https://www.googleapis.com/auth/drive"];
const TOKEN_PATH = "./token.json";
const CREDENTIALS_PATH = "./credentials.json";

async function authorize() {
  let credentials;
  try {
    credentials = JSON.parse(fs.readFileSync(CREDENTIALS_PATH));
  } catch (err) {
    console.log("❌ Error: credentials.json not found!");
    console.log("Please download OAuth credentials from Google Cloud Console");
    return;
  }

  const { client_secret, client_id, redirect_uris } =
    credentials.installed || credentials.web;
  const oAuth2Client = new google.auth.OAuth2(
    client_id,
    client_secret,
    redirect_uris[0]
  );

  const authUrl = oAuth2Client.generateAuthUrl({
    access_type: "offline",
    scope: SCOPES,
  });

  console.log("\n📋 STEP 1: Copy this URL and open in browser:\n");
  console.log(authUrl);
  console.log("\n📋 STEP 2: After authorizing, copy the code from browser");
  console.log("📋 STEP 3: Paste the code below:\n");

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  rl.question("Enter code: ", (code) => {
    rl.close();
    oAuth2Client.getToken(code, (err, token) => {
      if (err) {
        console.error("❌ Error retrieving token:", err);
        return;
      }
      fs.writeFileSync(TOKEN_PATH, JSON.stringify(token));
      console.log("\n✅ Token saved to token.json");
      console.log("✅ Setup complete! You can now run: node server.js\n");
    });
  });
}

authorize();
