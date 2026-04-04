import {
  boolean,
  integer,
  jsonb,
  pgEnum,
  pgTable,
  text,
  timestamp,
} from "drizzle-orm/pg-core";

// ─────────────────────────────────────────────────
// Enums
// ─────────────────────────────────────────────────

export const skillCategoryEnum = pgEnum("skill_category", [
  "language",
  "framework",
  "database",
  "cloud",
  "tool",
  "soft",
  "other",
]);

export const skillPriorityEnum = pgEnum("skill_priority", [
  "high",
  "medium",
  "low",
]);

// ─────────────────────────────────────────────────
// better-auth required tables
// (must match better-auth's expected column names exactly)
// ─────────────────────────────────────────────────

export const user = pgTable("user", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: boolean("email_verified").notNull().default(false),
  image: text("image"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),

  // better-auth additional fields (defined in auth.ts)
  userMetadata: jsonb("user_metadata"),
  appMetadata: jsonb("app_metadata"),
  invitedAt: timestamp("invited_at"),
  lastSignInAt: timestamp("last_sign_in_at"),
  
  // anonymous plugin fields
  isAnonymous: boolean("is_anonymous").default(false),

  // admin plugin fields
  role: text("role").default("user"),
  banned: boolean("banned").default(false),
  banReason: text("ban_reason"),
  banExpires: timestamp("ban_expires"),
});

export const session = pgTable("session", {
  id: text("id").primaryKey(),
  expiresAt: timestamp("expires_at").notNull(),
  token: text("token").notNull().unique(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),

  // admin plugin session fields
  impersonatedBy: text("impersonated_by"),
});

export const account = pgTable("account", {
  id: text("id").primaryKey(),
  accountId: text("account_id").notNull(),
  providerId: text("provider_id").notNull(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  accessToken: text("access_token"),
  refreshToken: text("refresh_token"),
  idToken: text("id_token"),
  accessTokenExpiresAt: timestamp("access_token_expires_at"),
  refreshTokenExpiresAt: timestamp("refresh_token_expires_at"),
  scope: text("scope"),
  password: text("password"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const verification = pgTable("verification", {
  id: text("id").primaryKey(),
  identifier: text("identifier").notNull(),
  value: text("value").notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Required by better-auth admin plugin
export const jwks = pgTable("jwks", {
  id: text("id").primaryKey(),
  publicKey: text("public_key").notNull(),
  privateKey: text("private_key").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// ─────────────────────────────────────────────────
// Application tables
// ─────────────────────────────────────────────────

export const userProfile = pgTable("user_profile", {
  id: text("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .unique()
    .references(() => user.id, { onDelete: "cascade" }),
  resumeRaw: jsonb("resume_raw").notNull(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

/**
 * Stores each resume analysis run for a user.
 * The heavy JSON blobs (jobs, skillGaps, roadmap) are stored as jsonb
 * for efficient querying without over-normalising.
 */
export const resumeAnalysis = pgTable("resume_analysis", {
  id: text("id").primaryKey(), // nanoid / cuid
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),

  // Parsed resume snapshot
  resumeName: text("resume_name"),          // candidate's name from resume
  resumeEmail: text("resume_email"),
  resumePhone: text("resume_phone"),
  resumeLocation: text("resume_location"),
  resumeSkills: text("resume_skills").array().default([]), // flat skill list for indexed search
  inferredJobTitles: text("inferred_job_titles").array().default([]),
  resumeRaw: jsonb("resume_raw"),           // full ParsedResume object

  // Analysis results
  jobs: jsonb("jobs").default([]),           // JobMatch[]
  skillGaps: jsonb("skill_gaps").default([]), // SkillGap[]
  roadmap: jsonb("roadmap").default([]),     // RoadmapItem[]

  // Meta
  searchLocation: text("search_location"),  // location used for job search
  totalJobsFound: integer("total_jobs_found").default(0),
  topMatchScore: integer("top_match_score").default(0),  // 0-100
  avgMatchScore: integer("avg_match_score").default(0),  // 0-100

  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

/**
 * Jobs that a user explicitly saved/bookmarked.
 */
export const savedJob = pgTable("saved_job", {
  id: text("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  analysisId: text("analysis_id").references(() => resumeAnalysis.id, {
    onDelete: "set null",
  }),

  // Denormalised job snapshot so it stays readable even if the
  // original analysis is deleted
  jobId: text("job_id").notNull(),          // external job listing id
  title: text("title").notNull(),
  company: text("company").notNull(),
  location: text("location").notNull(),
  url: text("url").notNull(),
  matchPercentage: integer("match_percentage").default(0),
  salary: text("salary"),
  employmentType: text("employment_type"),
  isRemote: boolean("is_remote").default(false),
  jobRaw: jsonb("job_raw"),                 // full JobMatch snapshot

  savedAt: timestamp("saved_at").notNull().defaultNow(),
});
