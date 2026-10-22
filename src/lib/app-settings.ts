/**
 * app-settings.ts
 * Typed helper to read and write admin-configurable settings from the
 * `app_settings` key-value table.
 *
 * All keys are listed in the `APP_SETTING_KEYS` constant so the rest of
 * the app can import them without magic strings.
 */

import { eq, inArray } from "drizzle-orm";
import db from "@/db";
import { appSettings } from "@/db/schema";

// ─────────────────────────────────────────────────
// Keys
// ─────────────────────────────────────────────────

export const APP_SETTING_KEYS = [
  "company_name",
  "company_gstin",
  "company_address",
  "company_cin",
  "company_email",
  // Referral system settings
  "referral_enabled", // "true" | "false"
  "referral_referrer_reward_pct", // % discount coupon for referrer (e.g. "20")
  "referral_referee_reward_pct", // % discount coupon for referee  (e.g. "10")
  "referral_expiry_days", // days before a referral expires  (e.g. "90")
  "referral_max_per_user", // max referrals per user (e.g. "50", "" = unlimited)
  // Skill Coach kill switch. Only the exact string "true" allows model calls.
  "coach_enabled",
] as const;

export type AppSettingKey = (typeof APP_SETTING_KEYS)[number];

export interface CompanySettings {
  company_name: string;
  company_gstin: string;
  company_address: string;
  company_cin: string;
  company_email: string;
}

export interface ReferralSettings {
  referral_enabled: boolean;
  referral_referrer_reward_pct: number; // %
  referral_referee_reward_pct: number; // %
  referral_expiry_days: number;
  referral_max_per_user: number | null; // null = unlimited
}

// ─────────────────────────────────────────────────
// Read
// ─────────────────────────────────────────────────

/** Returns all company settings as a typed object. Missing keys default to "". */
export async function getCompanySettings(): Promise<CompanySettings> {
  const rows = await db
    .select()
    .from(appSettings)
    .where(inArray(appSettings.key, [...APP_SETTING_KEYS]));

  const map: Record<string, string> = {};
  for (const row of rows) map[row.key] = row.value;

  return {
    company_name: map.company_name ?? "Zaprill",
    company_gstin: map.company_gstin ?? "",
    company_address: map.company_address ?? "",
    company_cin: map.company_cin ?? "",
    company_email: map.company_email ?? "billing@zaprill.com",
  };
}

/** Returns referral system settings from the app_settings table. */
export async function getReferralSettings(): Promise<ReferralSettings> {
  const keys: AppSettingKey[] = [
    "referral_enabled",
    "referral_referrer_reward_pct",
    "referral_referee_reward_pct",
    "referral_expiry_days",
    "referral_max_per_user",
  ];
  const rows = await db
    .select()
    .from(appSettings)
    .where(inArray(appSettings.key, keys));

  const map: Record<string, string> = {};
  for (const row of rows) map[row.key] = row.value;

  return {
    referral_enabled: (map.referral_enabled ?? "true") === "true",
    referral_referrer_reward_pct: parseFloat(
      map.referral_referrer_reward_pct ?? "20",
    ),
    referral_referee_reward_pct: parseFloat(
      map.referral_referee_reward_pct ?? "10",
    ),
    referral_expiry_days: parseInt(map.referral_expiry_days ?? "90", 10),
    referral_max_per_user: map.referral_max_per_user
      ? parseInt(map.referral_max_per_user, 10)
      : null,
  };
}

/** Get a single setting value. Returns `""` if not found. */
export async function getSettingValue(key: AppSettingKey): Promise<string> {
  const [row] = await db
    .select({ value: appSettings.value })
    .from(appSettings)
    .where(eq(appSettings.key, key))
    .limit(1);
  return row?.value ?? "";
}

// ─────────────────────────────────────────────────
// Write
// ─────────────────────────────────────────────────

/** Upsert a single setting. */
export async function setSettingValue(
  key: AppSettingKey,
  value: string,
): Promise<void> {
  await db
    .insert(appSettings)
    .values({ key, value, updatedAt: new Date() })
    .onConflictDoUpdate({
      target: appSettings.key,
      set: { value, updatedAt: new Date() },
    });
}

/** Upsert multiple company settings at once. */
export async function saveCompanySettings(
  settings: Partial<CompanySettings>,
): Promise<void> {
  const entries = Object.entries(settings) as [AppSettingKey, string][];
  for (const [key, value] of entries) {
    await setSettingValue(key, value ?? "");
  }
}
