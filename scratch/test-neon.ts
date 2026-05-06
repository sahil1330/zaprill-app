import { neon } from "@neondatabase/serverless";
import * as dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const rawUrl = process.env.DATABASE_URL!;
const cleanUrl = rawUrl.replace(/[&?]channel_binding=require/g, "");

console.log("Original URL:", rawUrl);
console.log("Cleaned URL:", cleanUrl);

async function testConnection() {
  try {
    const sql = neon(cleanUrl);
    const result = await sql`SELECT 1 as connected`;
    console.log("✅ Success!", result);
  } catch (err) {
    console.error("❌ Failed:", err);
  }
}

testConnection();
