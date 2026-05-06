import { BetaAnalyticsDataClient } from "@google-analytics/data";
import { OAuth2Client } from "google-auth-library";

const propertyId = process.env.GA_PROPERTY_ID;
const clientId = process.env.GOOGLE_CLIENT_ID;
const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
const refreshToken = process.env.GOOGLE_REFRESH_TOKEN;

/**
 * Gets an authenticated GA4 client using OAuth2 refresh token.
 */
async function getGA4Client() {
  if (!clientId || !clientSecret || !refreshToken) {
    throw new Error("Google OAuth credentials missing");
  }

  const oauth2Client = new OAuth2Client(clientId, clientSecret);
  oauth2Client.setCredentials({ refresh_token: refreshToken });

  const { token } = await oauth2Client.getAccessToken();

  if (!token) throw new Error("Failed to get Google Access Token");

  return new BetaAnalyticsDataClient({
    auth: oauth2Client as any,
  });
}

/**
 * Fetches core website metrics (Users, Sessions, Views)
 */
export async function getCoreMetrics(days = 7) {
  if (!propertyId) return null;

  try {
    const client = await getGA4Client();

    const [response] = await client.runReport({
      property: `properties/${propertyId}`,
      dateRanges: [{ startDate: `${days}daysAgo`, endDate: "today" }],
      dimensions: [{ name: "date" }],
      metrics: [
        { name: "activeUsers" },
        { name: "sessions" },
        { name: "screenPageViews" },
        { name: "averageSessionDuration" },
      ],
    });

    return response;
  } catch (error) {
    console.error("GA4 Error:", error);
    return null;
  }
}

/**
 * Fetches event distribution
 */
export async function getEventMetrics(days = 7) {
  if (!propertyId) return null;

  try {
    const client = await getGA4Client();

    const [response] = await client.runReport({
      property: `properties/${propertyId}`,
      dateRanges: [{ startDate: `${days}daysAgo`, endDate: "today" }],
      dimensions: [{ name: "eventName" }],
      metrics: [{ name: "eventCount" }],
      limit: 10,
    });

    return response;
  } catch (error) {
    console.error("GA4 Event Error:", error);
    return null;
  }
}

/**
 * Fetches real-time active users (last 30 mins)
 */
export async function getRealtimeUsers() {
  if (!propertyId) return null;

  try {
    const client = await getGA4Client();

    const [response] = await client.runRealtimeReport({
      property: `properties/${propertyId}`,
      metrics: [{ name: "activeUsers" }],
    });

    return response.rows?.[0]?.metricValues?.[0]?.value || "0";
  } catch (error) {
    console.error("GA4 Realtime Error:", error);
    return "0";
  }
}
