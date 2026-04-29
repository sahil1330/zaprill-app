CREATE TYPE "public"."resume_status" AS ENUM('draft', 'complete', 'archived');--> statement-breakpoint
ALTER TYPE "public"."ai_action" ADD VALUE 'enhance_bullet';--> statement-breakpoint
ALTER TYPE "public"."ai_action" ADD VALUE 'generate_summary';--> statement-breakpoint
ALTER TYPE "public"."ai_action" ADD VALUE 'tailor_resume';--> statement-breakpoint
ALTER TYPE "public"."ai_action" ADD VALUE 'ats_scan';--> statement-breakpoint
ALTER TYPE "public"."ai_action" ADD VALUE 'resume_roast';--> statement-breakpoint
CREATE TABLE "audit_log" (
	"id" text PRIMARY KEY NOT NULL,
	"admin_id" text NOT NULL,
	"action" text NOT NULL,
	"entity_type" text NOT NULL,
	"entity_id" text,
	"details" jsonb,
	"ip_address" text,
	"user_agent" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "received_email" (
	"id" text PRIMARY KEY NOT NULL,
	"resend_id" text NOT NULL,
	"from" text NOT NULL,
	"to" text NOT NULL,
	"subject" text,
	"text" text,
	"html" text,
	"raw" jsonb,
	"received_at" timestamp with time zone DEFAULT now() NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "received_email_resend_id_unique" UNIQUE("resend_id")
);
--> statement-breakpoint
CREATE TABLE "resume" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"title" text DEFAULT 'Untitled Resume' NOT NULL,
	"slug" text NOT NULL,
	"status" "resume_status" DEFAULT 'draft' NOT NULL,
	"template_slug" text DEFAULT 'minimalist' NOT NULL,
	"industry" text DEFAULT 'technology' NOT NULL,
	"data" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"metadata" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"target_role" text,
	"version" integer DEFAULT 1 NOT NULL,
	"is_public" boolean DEFAULT false NOT NULL,
	"share_password" text,
	"view_count" integer DEFAULT 0 NOT NULL,
	"download_count" integer DEFAULT 0 NOT NULL,
	"last_ats_score" integer,
	"source_analysis_id" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "resume_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "resume_ats_analysis" (
	"id" text PRIMARY KEY NOT NULL,
	"resume_id" text NOT NULL,
	"job_description" text,
	"score" integer,
	"breakdown" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "resume_version" (
	"id" text PRIMARY KEY NOT NULL,
	"resume_id" text NOT NULL,
	"version" integer NOT NULL,
	"data" jsonb NOT NULL,
	"metadata" jsonb NOT NULL,
	"change_description" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "plan" ADD COLUMN "original_amount" numeric(10, 2);--> statement-breakpoint
ALTER TABLE "plan" ADD COLUMN "category" text DEFAULT 'pro' NOT NULL;--> statement-breakpoint
ALTER TABLE "audit_log" ADD CONSTRAINT "audit_log_admin_id_user_id_fk" FOREIGN KEY ("admin_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "resume" ADD CONSTRAINT "resume_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "resume" ADD CONSTRAINT "resume_source_analysis_id_resume_analysis_id_fk" FOREIGN KEY ("source_analysis_id") REFERENCES "public"."resume_analysis"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "resume_ats_analysis" ADD CONSTRAINT "resume_ats_analysis_resume_id_resume_id_fk" FOREIGN KEY ("resume_id") REFERENCES "public"."resume"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "resume_version" ADD CONSTRAINT "resume_version_resume_id_resume_id_fk" FOREIGN KEY ("resume_id") REFERENCES "public"."resume"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "audit_log_admin_id_idx" ON "audit_log" USING btree ("admin_id");--> statement-breakpoint
CREATE INDEX "audit_log_entity_type_idx" ON "audit_log" USING btree ("entity_type");--> statement-breakpoint
CREATE INDEX "audit_log_created_at_idx" ON "audit_log" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "received_email_from_idx" ON "received_email" USING btree ("from");--> statement-breakpoint
CREATE INDEX "received_email_received_at_idx" ON "received_email" USING btree ("received_at");--> statement-breakpoint
CREATE INDEX "resume_user_id_idx" ON "resume" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "resume_status_idx" ON "resume" USING btree ("status");--> statement-breakpoint
CREATE INDEX "resume_slug_idx" ON "resume" USING btree ("slug");--> statement-breakpoint
CREATE INDEX "resume_ats_analysis_resume_id_idx" ON "resume_ats_analysis" USING btree ("resume_id");--> statement-breakpoint
CREATE INDEX "resume_version_resume_id_idx" ON "resume_version" USING btree ("resume_id");--> statement-breakpoint
CREATE UNIQUE INDEX "resume_version_unique" ON "resume_version" USING btree ("resume_id","version");