import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

import { google } from "googleapis";
import readline from "readline";

const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_OAUTH_CLIENT_ID,
  process.env.GOOGLE_OAUTH_CLIENT_SECRET,
  "http://localhost:3000/api/auth/callback/google",
);

const scopes = ["https://www.googleapis.com/auth/analytics.readonly"];

const url = oauth2Client.generateAuthUrl({
  access_type: "offline", // 🔥 important
  prompt: "consent", // 🔥 ensures refresh_token
  scope: scopes,
});

console.log("Authorize this app:", url);

// paste code here
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

rl.question("Enter code: ", async (code) => {
  const { tokens } = await oauth2Client.getToken(code);
  console.log("TOKENS:", tokens);
  rl.close();
});
