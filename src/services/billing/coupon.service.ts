/**
 * CouponService — Coupon validation, reservation, and redemption.
 *
 * Race condition prevention:
 * The reservation step uses a pg transaction with SELECT ... FOR UPDATE
 * to lock the coupon row while checking usage counts. This prevents
 * two concurrent requests from both passing the usage limit check.
 */

import { and, count, eq, inArray } from "drizzle-orm";
import db from "@/db";
import { withTransaction } from "@/db/pool";
import { coupons, couponUsage } from "@/db/schema";
import {
  BillingError,
  calculateDiscount,
  generateId,
} from "@/lib/billing-utils";
import type { Coupon, CouponValidationResult } from "@/types/billing";

// ─────────────────────────────────────────────────
// Validation
// ─────────────────────────────────────────────────

/**
 * Validate a coupon code WITHOUT reserving it.
 * Used for the "preview" endpoint to show discount to user.
 */
export async function validateCoupon(
  code: string,
  userId: string,
  orderAmount: number,
  isNewUser = false,
): Promise<CouponValidationResult> {
  const now = new Date();

  // 1. Find coupon by code
  const [coupon] = await db
    .select()
    .from(coupons)
    .where(eq(coupons.code, code.toUpperCase().trim()))
    .limit(1);

  if (!coupon) {
    return { valid: false, error: "Invalid coupon code" };
  }

  // 2. Status check
  if (coupon.status !== "active") {
    return {
      valid: false,
      error: `Coupon is ${coupon.status}`,
    };
  }

  // 3. Date range check
  if (coupon.startTime && now < coupon.startTime) {
    return { valid: false, error: "Coupon is not yet active" };
  }
  if (coupon.endTime && now > coupon.endTime) {
    return { valid: false, error: "Coupon has expired" };
  }

  // 4. Minimum order value check
  const minOrder = parseFloat(coupon.minOrderValue ?? "0");
  if (orderAmount < minOrder) {
    return {
      valid: false,
      error: `Minimum order value for this coupon is ₹${minOrder}`,
    };
  }

  // 5. New-user-only check
  if (coupon.newUserOnly && !isNewUser) {
    return { valid: false, error: "This coupon is for new users only" };
  }

  // 6. Global usage limit check
  if (coupon.usageLimitGlobal !== null) {
    const [{ value: globalUsed }] = await db
      .select({ value: count() })
      .from(couponUsage)
      .where(
        and(
          eq(couponUsage.couponId, coupon.id),
          inArray(couponUsage.status, ["reserved", "redeemed"]),
        ),
      );

    if (Number(globalUsed) >= coupon.usageLimitGlobal) {
      return { valid: false, error: "Coupon usage limit has been reached" };
    }
  }

  // 7. Per-user usage limit check
  const perUserLimit = coupon.usageLimitPerUser ?? 1;
  const [{ value: userUsed }] = await db
    .select({ value: count() })
    .from(couponUsage)
    .where(
      and(
        eq(couponUsage.couponId, coupon.id),
        eq(couponUsage.userId, userId),
        inArray(couponUsage.status, ["reserved", "redeemed"]),
      ),
    );

  if (Number(userUsed) >= perUserLimit) {
    return { valid: false, error: "You have already used this coupon" };
  }

  // 8. Calculate discount
  const discountAmount = calculateDiscount(
    coupon.type,
    coupon.value,
    orderAmount,
    coupon.maxDiscount,
  );
  const finalAmount = Math.max(0, orderAmount - discountAmount);

  return {
    valid: true,
    coupon: coupon as Coupon,
    discountAmount,
    finalAmount,
  };
}

// ─────────────────────────────────────────────────
// Reservation (transactional, race-condition safe)
// ─────────────────────────────────────────────────

/**
 * Reserve a coupon for an in-progress checkout.
 * Uses SELECT ... FOR UPDATE inside a transaction to prevent
 * concurrent over-redemption.
 *
 * Returns the coupon_usage row id.
 */
export async function reserveCoupon(
  couponCode: string,
  userId: string,
  invoiceId: string,
): Promise<{ couponUsageId: string; coupon: Coupon }> {
  return withTransaction(async (client) => {
    // Lock the coupon row for update
    const couponResult = await client.query(
      `SELECT * FROM coupons WHERE code = $1 FOR UPDATE`,
      [couponCode.toUpperCase().trim()],
    );

    if (couponResult.rows.length === 0) {
      throw new BillingError("Invalid coupon code", "COUPON_NOT_FOUND");
    }

    const row = couponResult.rows[0];

    if (row.status !== "active") {
      throw new BillingError(`Coupon is ${row.status}`, "COUPON_INACTIVE");
    }

    const now = new Date();
    if (row.end_time && now > new Date(row.end_time)) {
      throw new BillingError("Coupon has expired", "COUPON_EXPIRED");
    }

    // Check global usage (within lock)
    if (row.usage_limit_global !== null) {
      const usageRes = await client.query(
        `SELECT count(*) FROM coupon_usage WHERE coupon_id = $1 AND status IN ('reserved','redeemed')`,
        [row.id],
      );
      if (Number(usageRes.rows[0].count) >= Number(row.usage_limit_global)) {
        throw new BillingError(
          "Coupon usage limit has been reached",
          "COUPON_GLOBAL_LIMIT",
        );
      }
    }

    // Check per-user usage (within lock)
    const perUserLimit = row.usage_limit_per_user ?? 1;
    const userUsageRes = await client.query(
      `SELECT count(*) FROM coupon_usage WHERE coupon_id = $1 AND user_id = $2 AND status IN ('reserved','redeemed')`,
      [row.id, userId],
    );
    if (Number(userUsageRes.rows[0].count) >= perUserLimit) {
      throw new BillingError(
        "You have already used this coupon",
        "COUPON_USER_LIMIT",
      );
    }

    // Insert reservation
    const usageId = generateId("cu");
    await client.query(
      `INSERT INTO coupon_usage (id, coupon_id, user_id, order_id, status, reserved_at, created_at, updated_at)
       VALUES ($1, $2, $3, $4, 'reserved', NOW(), NOW(), NOW())`,
      [usageId, row.id, userId, invoiceId],
    );

    // Map snake_case to camelCase
    const coupon: Coupon = {
      id: row.id,
      code: row.code,
      type: row.type,
      value: row.value,
      maxDiscount: row.max_discount,
      minOrderValue: row.min_order_value,
      startTime: row.start_time,
      endTime: row.end_time,
      usageLimitGlobal: row.usage_limit_global,
      usageLimitPerUser: row.usage_limit_per_user,
      newUserOnly: row.new_user_only,
      status: row.status,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };

    return { couponUsageId: usageId, coupon };
  });
}

// ─────────────────────────────────────────────────
// Redemption / Release
// ─────────────────────────────────────────────────

/** Mark coupon as redeemed after successful payment. Idempotent. */
export async function redeemCoupon(couponUsageId: string): Promise<void> {
  await db
    .update(couponUsage)
    .set({
      status: "redeemed",
      redeemedAt: new Date(),
      updatedAt: new Date(),
    })
    .where(
      and(
        eq(couponUsage.id, couponUsageId),
        eq(couponUsage.status, "reserved"), // only transition from reserved
      ),
    );
}

/** Release a reserved coupon on payment failure. Idempotent. */
export async function releaseCoupon(couponUsageId: string): Promise<void> {
  await db
    .update(couponUsage)
    .set({
      status: "released",
      updatedAt: new Date(),
    })
    .where(
      and(
        eq(couponUsage.id, couponUsageId),
        eq(couponUsage.status, "reserved"),
      ),
    );
}

/** Find the active coupon_usage for an invoice. */
export async function getCouponUsageByInvoice(
  invoiceId: string,
): Promise<{ id: string; couponId: string } | null> {
  const [row] = await db
    .select({ id: couponUsage.id, couponId: couponUsage.couponId })
    .from(couponUsage)
    .where(
      and(
        eq(couponUsage.orderId, invoiceId),
        eq(couponUsage.status, "reserved"),
      ),
    )
    .limit(1);

  return row ?? null;
}
