import { sql } from "drizzle-orm";
import db from "@/db";
import { coachLimitError } from "@/services/coach/errors";
import {
  type CoachQuota,
  type CoachSpend,
  type CoachTier,
  monthlySpendCeilingPaise,
  periodKindFor,
  periodStartFor,
  quotaCap,
  reservePaiseFor,
  utcMonthStart,
} from "@/services/coach/limits";

export interface CoachUsageSnapshot {
  tutorTurns: number;
  practiceGrades: number;
  mockSessions: number;
  spendPaise: number;
}

export interface MeterHold {
  reservePaise: number;
  /** Replace the reservation with the real charge. Keeps the quota. */
  reconcile(actualPaise: number): Promise<void>;
  /** Parse failure or a throw after the provider billed tokens. */
  refundQuota(actualPaise: number): Promise<void>;
  /** Throw before any provider usage. Returns the quota and the reservation. */
  abort(): Promise<void>;
}

function rowsOf(result: unknown): Record<string, unknown>[] {
  if (Array.isArray(result)) return result as Record<string, unknown>[];
  if (result && typeof result === "object" && "rows" in result) {
    const rows = (result as { rows?: unknown }).rows;
    if (Array.isArray(rows)) return rows as Record<string, unknown>[];
  }
  return [];
}

async function ensurePeriod(
  userId: string,
  periodKind: string,
  periodStart: string,
): Promise<void> {
  await db.execute(sql`
    INSERT INTO coach_period_usage (
      user_id, period_kind, period_start,
      tutor_turns, practice_grades, mock_sessions, spend_paise
    ) VALUES (
      ${userId}, ${periodKind}, ${periodStart}::date, 0, 0, 0, 0
    )
    ON CONFLICT (user_id, period_kind, period_start) DO NOTHING
  `);
}

async function incrementQuota(input: {
  userId: string;
  quota: CoachQuota;
  periodStart: string;
  cap: number;
}): Promise<boolean> {
  const { userId, periodStart, cap } = input;
  const result =
    input.quota === "tutor"
      ? await db.execute(sql`
          UPDATE coach_period_usage
          SET tutor_turns = tutor_turns + 1
          WHERE user_id = ${userId}
            AND period_kind = 'day'
            AND period_start = ${periodStart}::date
            AND tutor_turns < ${cap}
          RETURNING tutor_turns
        `)
      : input.quota === "grade"
        ? await db.execute(sql`
            UPDATE coach_period_usage
            SET practice_grades = practice_grades + 1
            WHERE user_id = ${userId}
              AND period_kind = 'week'
              AND period_start = ${periodStart}::date
              AND practice_grades < ${cap}
            RETURNING practice_grades
          `)
        : await db.execute(sql`
            UPDATE coach_period_usage
            SET mock_sessions = mock_sessions + 1
            WHERE user_id = ${userId}
              AND period_kind = 'month'
              AND period_start = ${periodStart}::date
              AND mock_sessions < ${cap}
            RETURNING mock_sessions
          `);
  return rowsOf(result).length > 0;
}

async function refundQuota(input: {
  userId: string;
  quota: CoachQuota;
  periodStart: string;
}): Promise<void> {
  const { userId, periodStart } = input;
  if (input.quota === "tutor") {
    await db.execute(sql`
      UPDATE coach_period_usage
      SET tutor_turns = GREATEST(0, tutor_turns - 1)
      WHERE user_id = ${userId}
        AND period_kind = 'day'
        AND period_start = ${periodStart}::date
    `);
    return;
  }
  if (input.quota === "grade") {
    await db.execute(sql`
      UPDATE coach_period_usage
      SET practice_grades = GREATEST(0, practice_grades - 1)
      WHERE user_id = ${userId}
        AND period_kind = 'week'
        AND period_start = ${periodStart}::date
    `);
    return;
  }
  await db.execute(sql`
    UPDATE coach_period_usage
    SET mock_sessions = GREATEST(0, mock_sessions - 1)
    WHERE user_id = ${userId}
      AND period_kind = 'month'
      AND period_start = ${periodStart}::date
  `);
}

async function reserveSpend(input: {
  userId: string;
  periodStart: string;
  reservePaise: number;
  ceilingPaise: number;
}): Promise<boolean> {
  const result = await db.execute(sql`
    UPDATE coach_period_usage
    SET spend_paise = spend_paise + ${input.reservePaise}
    WHERE user_id = ${input.userId}
      AND period_kind = 'month'
      AND period_start = ${input.periodStart}::date
      AND spend_paise + ${input.reservePaise} <= ${input.ceilingPaise}
    RETURNING spend_paise
  `);
  return rowsOf(result).length > 0;
}

async function applyActualSpend(input: {
  userId: string;
  periodStart: string;
  reservePaise: number;
  actualPaise: number;
}): Promise<void> {
  await db.execute(sql`
    UPDATE coach_period_usage
    SET spend_paise = GREATEST(
      0,
      spend_paise - ${input.reservePaise} + ${input.actualPaise}
    )
    WHERE user_id = ${input.userId}
      AND period_kind = 'month'
      AND period_start = ${input.periodStart}::date
  `);
}

function numberFrom(value: unknown): number {
  if (typeof value === "number") return value;
  if (typeof value === "string") return Number(value) || 0;
  return 0;
}

export async function readCoachUsage(
  userId: string,
  now: Date = new Date(),
): Promise<CoachUsageSnapshot> {
  const result = await db.execute(sql`
    SELECT period_kind, tutor_turns, practice_grades, mock_sessions, spend_paise
    FROM coach_period_usage
    WHERE user_id = ${userId}
      AND (
        (period_kind = 'day' AND period_start = ${periodStartFor("tutor", now)}::date)
        OR (period_kind = 'week' AND period_start = ${periodStartFor("grade", now)}::date)
        OR (period_kind = 'month' AND period_start = ${utcMonthStart(now)}::date)
      )
  `);
  const snapshot: CoachUsageSnapshot = {
    tutorTurns: 0,
    practiceGrades: 0,
    mockSessions: 0,
    spendPaise: 0,
  };
  for (const row of rowsOf(result)) {
    const kind = String(row.period_kind ?? "");
    if (kind === "day") snapshot.tutorTurns = numberFrom(row.tutor_turns);
    if (kind === "week") {
      snapshot.practiceGrades = numberFrom(row.practice_grades);
    }
    if (kind === "month") {
      snapshot.mockSessions = numberFrom(row.mock_sessions);
      snapshot.spendPaise = numberFrom(row.spend_paise);
    }
  }
  return snapshot;
}

/**
 * Atomic quota increment, then a spend reservation.
 * Caps and the ceiling come from COACH_LIMITS via the caller-selected tier.
 */
export async function openCoachMeter(input: {
  userId: string;
  tier: CoachTier;
  quota: CoachQuota | null;
  spend: CoachSpend;
  now?: Date;
}): Promise<MeterHold> {
  const now = input.now ?? new Date();
  const reservePaise = reservePaiseFor(input.spend);
  const ceilingPaise = monthlySpendCeilingPaise(input.tier);
  const monthStart = utcMonthStart(now);
  const quotaPeriod = input.quota
    ? {
        quota: input.quota,
        periodStart: periodStartFor(input.quota, now),
        kind: periodKindFor(input.quota),
        cap: quotaCap(input.tier, input.quota),
      }
    : null;

  if (quotaPeriod) {
    await ensurePeriod(input.userId, quotaPeriod.kind, quotaPeriod.periodStart);
    const allowed = await incrementQuota({
      userId: input.userId,
      quota: quotaPeriod.quota,
      periodStart: quotaPeriod.periodStart,
      cap: quotaPeriod.cap,
    });
    if (!allowed) {
      throw coachLimitError(quotaPeriod.quota, input.tier);
    }
  }

  await ensurePeriod(input.userId, "month", monthStart);
  const reserved = await reserveSpend({
    userId: input.userId,
    periodStart: monthStart,
    reservePaise,
    ceilingPaise,
  });
  if (!reserved) {
    if (quotaPeriod) {
      await refundQuota({
        userId: input.userId,
        quota: quotaPeriod.quota,
        periodStart: quotaPeriod.periodStart,
      });
    }
    throw coachLimitError("spend", input.tier);
  }

  return {
    reservePaise,
    async reconcile(actualPaise: number) {
      await applyActualSpend({
        userId: input.userId,
        periodStart: monthStart,
        reservePaise,
        actualPaise,
      });
    },
    async refundQuota(actualPaise: number) {
      await applyActualSpend({
        userId: input.userId,
        periodStart: monthStart,
        reservePaise,
        actualPaise,
      });
      if (quotaPeriod) {
        await refundQuota({
          userId: input.userId,
          quota: quotaPeriod.quota,
          periodStart: quotaPeriod.periodStart,
        });
      }
    },
    async abort() {
      await applyActualSpend({
        userId: input.userId,
        periodStart: monthStart,
        reservePaise,
        actualPaise: 0,
      });
      if (quotaPeriod) {
        await refundQuota({
          userId: input.userId,
          quota: quotaPeriod.quota,
          periodStart: quotaPeriod.periodStart,
        });
      }
    },
  };
}
