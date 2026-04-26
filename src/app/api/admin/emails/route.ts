import { desc } from "drizzle-orm";
import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { Resend } from "resend";
import db from "@/db";
import { receivedEmail } from "@/db/schema";
import { auth } from "@/lib/auth";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function GET(request: Request) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session || session.user.role !== "admin") {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const type = searchParams.get("type") || "sent"; // sent | received

  try {
    if (type === "sent") {
      // Fetch sent emails from Resend
      const { data, error } = await resend.emails.list();
      if (error) throw error;
      return NextResponse.json(data);
    } else {
      // Fetch received emails from DB
      const emails = await db.query.receivedEmail.findMany({
        orderBy: [desc(receivedEmail.receivedAt)],
        limit: 50,
      });
      return NextResponse.json(emails);
    }
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
