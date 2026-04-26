import {
  boolean,
  index,
  integer,
  jsonb,
  numeric,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
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

  // usage limits
  monthlySearchesCount: integer("monthly_searches_count").default(0),
  searchesResetDate: timestamp("searches_reset_date"),
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
  resumeName: text("resume_name"), // candidate's name from resume
  resumeEmail: text("resume_email"),
  resumePhone: text("resume_phone"),
  resumeLocation: text("resume_location"),
  resumeSkills: text("resume_skills").array().default([]), // flat skill list for indexed search
  inferredJobTitles: text("inferred_job_titles").array().default([]),
  resumeRaw: jsonb("resume_raw"), // full ParsedResume object

  // Analysis results
  jobs: jsonb("jobs").default([]), // JobMatch[]
  skillGaps: jsonb("skill_gaps").default([]), // SkillGap[]
  roadmap: jsonb("roadmap").default([]), // RoadmapItem[]
  advice: text("advice"), // AI Advice

  // Meta
  searchLocation: text("search_location"), // location used for job search
  totalJobsFound: integer("total_jobs_found").default(0),
  topMatchScore: integer("top_match_score").default(0), // 0-100
  avgMatchScore: integer("avg_match_score").default(0), // 0-100

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
  jobId: text("job_id").notNull(), // external job listing id
  title: text("title").notNull(),
  company: text("company").notNull(),
  location: text("location").notNull(),
  url: text("url").notNull(),
  matchPercentage: integer("match_percentage").default(0),
  salary: text("salary"),
  employmentType: text("employment_type"),
  isRemote: boolean("is_remote").default(false),
  jobRaw: jsonb("job_raw"), // full JobMatch snapshot

  savedAt: timestamp("saved_at").notNull().defaultNow(),
});

// ─────────────────────────────────────────────────
// Billing Enums
// ─────────────────────────────────────────────────

export const billingCycleEnum = pgEnum("billing_cycle", [
  "monthly",
  "quarterly",
  "yearly",
]);

export const couponTypeEnum = pgEnum("coupon_type", ["percentage", "flat"]);

export const couponStatusEnum = pgEnum("coupon_status", [
  "active",
  "expired",
  "disabled",
]);

export const subscriptionStatusEnum = pgEnum("subscription_status", [
  "active",
  "trialing",
  "past_due",
  "canceled",
]);

export const invoiceStatusEnum = pgEnum("invoice_status", [
  "pending",
  "paid",
  "failed",
  "void",
]);

export const billingReasonEnum = pgEnum("billing_reason", [
  "subscription_create",
  "renewal",
  "upgrade",
  "downgrade",
]);

export const paymentStatusEnum = pgEnum("payment_status", [
  "initiated",
  "success",
  "failed",
  "refunded",
]);

// ─────────────────────────────────────────────────
// Billing Tables
// ─────────────────────────────────────────────────

/**
 * Subscription plans available in the product.
 * Stored in DB so pricing can be managed without redeploys.
 */
export const plan = pgTable("plan", {
  id: text("id").primaryKey(), // e.g. "plan_pro_monthly"
  name: text("name").notNull(), // "Pro Monthly"
  slug: text("slug").notNull().unique(), // "pro-monthly"
  description: text("description"),
  amount: numeric("amount", { precision: 10, scale: 2 }).notNull(), // in INR (stored as string for precision)
  currency: text("currency").notNull().default("INR"),
  billingCycle: billingCycleEnum("billing_cycle").notNull(),
  features: jsonb("features").default([]), // string[] of feature bullets
  isActive: boolean("is_active").notNull().default(true),
  sortOrder: integer("sort_order").notNull().default(0),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

/**
 * Discount coupons. Admin-managed.
 */
export const coupons = pgTable(
  "coupons",
  {
    id: text("id").primaryKey(),
    code: text("code").notNull(), // unique enforced via index below
    type: couponTypeEnum("type").notNull(),
    value: numeric("value", { precision: 10, scale: 2 }).notNull(), // % or flat INR
    maxDiscount: numeric("max_discount", { precision: 10, scale: 2 }), // cap for percentage type
    minOrderValue: numeric("min_order_value", {
      precision: 10,
      scale: 2,
    }).default("0"),
    startTime: timestamp("start_time"),
    endTime: timestamp("end_time"),
    usageLimitGlobal: integer("usage_limit_global"), // null = unlimited
    usageLimitPerUser: integer("usage_limit_per_user").default(1),
    newUserOnly: boolean("new_user_only").notNull().default(false),
    status: couponStatusEnum("status").notNull().default("active"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  },
  (t) => [uniqueIndex("coupons_code_idx").on(t.code)],
);

/**
 * Tracks each coupon reservation and redemption.
 * One row per (coupon, user, order) attempt.
 * status: reserved → redeemed | released
 */
export const couponUsage = pgTable(
  "coupon_usage",
  {
    id: text("id").primaryKey(),
    couponId: text("coupon_id")
      .notNull()
      .references(() => coupons.id, { onDelete: "restrict" }),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    orderId: text("order_id"), // invoice id, set at reservation
    status: text("status").notNull().default("reserved"), // reserved | redeemed | released
    reservedAt: timestamp("reserved_at").notNull().defaultNow(),
    redeemedAt: timestamp("redeemed_at"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  },
  (t) => [
    index("coupon_usage_coupon_id_idx").on(t.couponId),
    index("coupon_usage_user_id_idx").on(t.userId),
  ],
);

/**
 * User subscriptions — one active subscription per user at a time.
 * Manages the subscription lifecycle independently of payment provider.
 */
export const subscription = pgTable(
  "subscription",
  {
    id: text("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    planId: text("plan_id")
      .notNull()
      .references(() => plan.id, { onDelete: "restrict" }),
    status: subscriptionStatusEnum("status").notNull().default("active"),
    startDate: timestamp("start_date").notNull().defaultNow(),
    endDate: timestamp("end_date"), // null = open-ended (until canceled)
    currentPeriodStart: timestamp("current_period_start").notNull(),
    currentPeriodEnd: timestamp("current_period_end").notNull(),
    billingCycle: billingCycleEnum("billing_cycle").notNull(),
    priceAtPurchase: numeric("price_at_purchase", {
      precision: 10,
      scale: 2,
    }).notNull(),
    couponId: text("coupon_id").references(() => coupons.id, {
      onDelete: "set null",
    }),
    discountAmount: numeric("discount_amount", {
      precision: 10,
      scale: 2,
    }).default("0"),
    cashfreeSubscriptionId: text("cashfree_subscription_id"), // reserved for future Cashfree mandate
    metadata: jsonb("metadata").default({}), // extensibility (future credit system)
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  },
  (t) => [
    index("subscription_user_id_status_idx").on(t.userId, t.status),
    index("subscription_user_id_idx").on(t.userId),
  ],
);

/**
 * Invoice — single source of truth for billing.
 * One subscription can have many invoices (create, renewal, etc.)
 */
export const invoice = pgTable(
  "invoice",
  {
    id: text("id").primaryKey(),
    subscriptionId: text("subscription_id").references(() => subscription.id, {
      onDelete: "set null",
    }),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    amountDue: numeric("amount_due", { precision: 10, scale: 2 }).notNull(),
    amountPaid: numeric("amount_paid", { precision: 10, scale: 2 }).default(
      "0",
    ),
    currency: text("currency").notNull().default("INR"),
    status: invoiceStatusEnum("status").notNull().default("pending"),
    billingReason: billingReasonEnum("billing_reason").notNull(),
    dueDate: timestamp("due_date"),
    paidAt: timestamp("paid_at"),
    couponId: text("coupon_id").references(() => coupons.id, {
      onDelete: "set null",
    }),
    discountAmount: numeric("discount_amount", {
      precision: 10,
      scale: 2,
    }).default("0"),
    taxAmount: numeric("tax_amount", { precision: 10, scale: 2 }).default("0"),
    totalAmount: numeric("total_amount", { precision: 10, scale: 2 }).notNull(),
    cashfreeOrderId: text("cashfree_order_id"), // used for webhook lookup
    metadata: jsonb("metadata").default({}),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (t) => [
    index("invoice_user_id_idx").on(t.userId),
    index("invoice_user_id_status_idx").on(t.userId, t.status),
    index("invoice_subscription_id_idx").on(t.subscriptionId),
    uniqueIndex("invoice_cashfree_order_id_idx").on(t.cashfreeOrderId),
  ],
);

/**
 * Individual payment attempts against an invoice.
 * Each invoice can have multiple attempts (retry flow).
 * idempotency_key ensures exactly-once processing.
 */
export const payment = pgTable(
  "payment",
  {
    id: text("id").primaryKey(),
    invoiceId: text("invoice_id")
      .notNull()
      .references(() => invoice.id, { onDelete: "cascade" }),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    amount: numeric("amount", { precision: 10, scale: 2 }).notNull(),
    currency: text("currency").notNull().default("INR"),
    status: paymentStatusEnum("status").notNull().default("initiated"),
    paymentMethod: text("payment_method"), // upi | card | netbanking | wallet
    transactionId: text("transaction_id"), // bank/UPI reference
    cashfreePaymentId: text("cashfree_payment_id"), // cf_payment_id from Cashfree
    idempotencyKey: text("idempotency_key").notNull(), // unique per attempt
    paidAt: timestamp("paid_at"),
    metadata: jsonb("metadata").default({}), // full Cashfree payment object snapshot
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (t) => [
    uniqueIndex("payment_idempotency_key_idx").on(t.idempotencyKey),
    index("payment_invoice_id_idx").on(t.invoiceId),
    index("payment_user_id_idx").on(t.userId),
    index("payment_cashfree_payment_id_idx").on(t.cashfreePaymentId),
  ],
);

// ─────────────────────────────────────────────────
// AI Usage Intelligence
// ─────────────────────────────────────────────────

export const aiActionEnum = pgEnum("ai_action", [
  "parse_resume",
  "analyze_gaps",
]);

/**
 * Append-only log of every AI / LLM call made by the application.
 *
 * Design principles:
 *  - Never update rows — always insert a new record per call.
 *  - Store raw token counts AND an estimated USD cost so historical
 *    records remain accurate even if pricing changes in the future.
 *  - Fire-and-forget writes (non-blocking) so logging never delays the
 *    user response.
 *  - `cache_hit = true` rows have zero tokens consumed but are still
 *    recorded to prove the value of the analysis cache.
 */
export const aiUsageLog = pgTable(
  "ai_usage_log",
  {
    id: text("id").primaryKey(), // nanoid
    userId: text("user_id").references(() => user.id, { onDelete: "set null" }),
    analysisId: text("analysis_id").references(() => resumeAnalysis.id, {
      onDelete: "set null",
    }),
    action: aiActionEnum("action").notNull(), // which route called the LLM
    model: text("model").notNull(), // model identifier as passed to the SDK (e.g. "google/gemini-2.5-flash")
    promptTokens: integer("prompt_tokens").notNull().default(0),
    completionTokens: integer("completion_tokens").notNull().default(0),
    totalTokens: integer("total_tokens").notNull().default(0),
    // Estimated USD cost computed at write-time from the model rate table.
    // Null when the model is unknown / cost cannot be computed.
    costUsd: numeric("cost_usd", { precision: 12, scale: 8 }),
    latencyMs: integer("latency_ms"), // wall-clock time for the LLM call
    cacheHit: boolean("cache_hit").notNull().default(false), // true = no LLM tokens were consumed
    success: boolean("success").notNull().default(true),
    errorCode: text("error_code"), // structured error code, e.g. "PARSE_FAILED"
    metadata: jsonb("metadata").default({}), // extensibility
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (t) => [
    index("ai_usage_log_user_id_idx").on(t.userId),
    index("ai_usage_log_created_at_idx").on(t.createdAt),
    index("ai_usage_log_action_idx").on(t.action),
    index("ai_usage_log_model_idx").on(t.model),
  ],
);

// ─────────────────────────────────────────────────
// Email Hub
// ─────────────────────────────────────────────────

export const receivedEmail = pgTable(
  "received_email",
  {
    id: text("id").primaryKey(), // nanoid
    resendId: text("resend_id").notNull().unique(), // resend internal id
    from: text("from").notNull(),
    to: text("to").notNull(),
    subject: text("subject"),
    text: text("text"),
    html: text("html"),
    raw: jsonb("raw"), // full Resend webhook payload
    receivedAt: timestamp("received_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [
    index("received_email_from_idx").on(t.from),
    index("received_email_received_at_idx").on(t.receivedAt),
  ],
);

export const auditLog = pgTable(
  "audit_log",
  {
    id: text("id").primaryKey(), // nanoid
    adminId: text("admin_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    action: text("action").notNull(), // e.g. "BAN_USER", "DELETE_USER", "UPDATE_PLAN"
    entityType: text("entity_type").notNull(), // e.g. "user", "plan", "coupon"
    entityId: text("entity_id"),
    details: jsonb("details"),
    ipAddress: text("ip_address"),
    userAgent: text("user_agent"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [
    index("audit_log_admin_id_idx").on(t.adminId),
    index("audit_log_entity_type_idx").on(t.entityType),
    index("audit_log_created_at_idx").on(t.createdAt),
  ],
);
