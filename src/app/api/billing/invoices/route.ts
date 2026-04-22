/**
 * GET /api/billing/invoices — Paginated invoice history
 */

import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getInvoicesByUser } from "@/services/billing/invoice.service";

export async function GET(request: Request) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const url = new URL(request.url);
    const limit = Math.min(Number(url.searchParams.get("limit") ?? 20), 100);
    const offset = Number(url.searchParams.get("offset") ?? 0);

    const invoices = await getInvoicesByUser(session.user.id, limit, offset);
    return NextResponse.json({ invoices });
  } catch (err) {
    console.error("[invoices GET]", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
