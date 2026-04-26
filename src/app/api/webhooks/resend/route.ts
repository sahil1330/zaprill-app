import { nanoid } from "nanoid";
import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { Webhook } from "svix";
import db from "@/db";
import { receivedEmail } from "@/db/schema";

export async function POST(request: Request) {
  const WEBHOOK_SECRET = process.env.RESEND_WEBHOOK_SECRET;

  if (!WEBHOOK_SECRET) {
    console.error("Missing RESEND_WEBHOOK_SECRET");
    return NextResponse.json({ error: "Configuration Error" }, { status: 500 });
  }

  // Get the headers for verification
  const headerPayload = await headers();
  const svix_id = headerPayload.get("svix-id");
  const svix_timestamp = headerPayload.get("svix-timestamp");
  const svix_signature = headerPayload.get("svix-signature");

  // If there are no headers, error out
  if (!svix_id || !svix_timestamp || !svix_signature) {
    return NextResponse.json({ error: "Missing signatures" }, { status: 400 });
  }

  // Get the body
  const payload = await request.text();
  const wh = new Webhook(WEBHOOK_SECRET);

  let evt: any;

  // Verify the payload with the headers
  try {
    evt = wh.verify(payload, {
      "svix-id": svix_id,
      "svix-timestamp": svix_timestamp,
      "svix-signature": svix_signature,
    });
  } catch (err) {
    console.error("Error verifying webhook:", err);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  try {
    // Resend inbound webhook payload structure
    // See: https://resend.com/docs/dashboard/emails/inbound-emails
    const {
      from,
      to,
      subject,
      text,
      html,
      id: resendId,
      created_at,
    } = evt.data;

    await db
      .insert(receivedEmail)
      .values({
        id: nanoid(),
        resendId,
        from: from.email || from,
        to: to[0]?.email || to[0],
        subject,
        text,
        html,
        raw: evt,
        receivedAt: new Date(created_at),
      })
      .onConflictDoNothing();

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Resend Webhook Processing Error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
