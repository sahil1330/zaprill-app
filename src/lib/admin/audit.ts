import { nanoid } from "nanoid";
import { headers } from "next/headers";
import db from "@/db";
import { auditLog } from "@/db/schema";
import { auth } from "@/lib/auth";

/**
 * Logs an administrative action to the audit_log table.
 */
export async function logAuditAction(params: {
  action: string;
  entityType: string;
  entityId?: string;
  details?: any;
}) {
  try {
    const headerList = await headers();
    const session = await auth.api.getSession({
      headers: headerList,
    });

    if (!session || session.user.role !== "admin") return;

    await db.insert(auditLog).values({
      id: nanoid(),
      adminId: session.user.id,
      action: params.action,
      entityType: params.entityType,
      entityId: params.entityId,
      details: params.details,
      ipAddress: headerList.get("x-forwarded-for") || "unknown",
      userAgent: headerList.get("user-agent") || "unknown",
    });
  } catch (error) {
    console.error("Audit Logging Error:", error);
  }
}
