ALTER TYPE "ai_action" ADD VALUE IF NOT EXISTS 'coach_plan';--> statement-breakpoint
ALTER TYPE "ai_action" ADD VALUE IF NOT EXISTS 'coach_tutor';--> statement-breakpoint
ALTER TYPE "ai_action" ADD VALUE IF NOT EXISTS 'coach_practice';--> statement-breakpoint
ALTER TYPE "ai_action" ADD VALUE IF NOT EXISTS 'coach_mock';--> statement-breakpoint
ALTER TABLE "ai_usage_log" ADD COLUMN IF NOT EXISTS "reasoning_tokens" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "coach_program" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"role_key" text NOT NULL,
	"role_title" text NOT NULL,
	"status" text DEFAULT 'active' NOT NULL,
	"advice" text,
	"source_analysis_id" text,
	"gap_fingerprint" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "coach_plan" (
	"id" text PRIMARY KEY NOT NULL,
	"program_id" text NOT NULL,
	"user_id" text NOT NULL,
	"skill_key" text NOT NULL,
	"display_name" text NOT NULL,
	"priority" text DEFAULT 'medium' NOT NULL,
	"category" text DEFAULT 'other' NOT NULL,
	"status" text DEFAULT 'active' NOT NULL,
	"outline" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"outline_source" text DEFAULT 'gap_roadmap' NOT NULL,
	"gap_evidence" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "coach_progress" (
	"plan_id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"state" text DEFAULT 'not_started' NOT NULL,
	"current_module_key" text,
	"tasks_attempted" integer DEFAULT 0 NOT NULL,
	"tasks_passed" integer DEFAULT 0 NOT NULL,
	"last_session_at" timestamp,
	"mastery_score" integer
);--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "coach_outline_cache" (
	"skill_key" text NOT NULL,
	"segment" text NOT NULL,
	"outline" jsonb NOT NULL,
	"model" text NOT NULL,
	"generated_at" timestamp DEFAULT now() NOT NULL
);--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "coach_session" (
	"id" text PRIMARY KEY NOT NULL,
	"plan_id" text NOT NULL,
	"program_id" text NOT NULL,
	"user_id" text NOT NULL,
	"kind" text NOT NULL,
	"status" text DEFAULT 'active' NOT NULL,
	"messages" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"summary" text,
	"module_key" text,
	"turn_count" integer DEFAULT 0 NOT NULL,
	"started_at" timestamp DEFAULT now() NOT NULL,
	"ended_at" timestamp
);--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "coach_task" (
	"id" text PRIMARY KEY NOT NULL,
	"plan_id" text NOT NULL,
	"module_key" text,
	"kind" text NOT NULL,
	"prompt" text NOT NULL,
	"rubric" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"resource_id" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "coach_attempt" (
	"id" text PRIMARY KEY NOT NULL,
	"task_id" text NOT NULL,
	"session_id" text,
	"user_id" text NOT NULL,
	"answer" text NOT NULL,
	"score" integer,
	"feedback" text,
	"passed" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "coach_period_usage" (
	"user_id" text NOT NULL,
	"period_kind" text NOT NULL,
	"period_start" date NOT NULL,
	"tutor_turns" integer DEFAULT 0 NOT NULL,
	"practice_grades" integer DEFAULT 0 NOT NULL,
	"mock_sessions" integer DEFAULT 0 NOT NULL,
	"spend_paise" integer DEFAULT 0 NOT NULL
);--> statement-breakpoint
DO $$ BEGIN
	ALTER TABLE "coach_program" ADD CONSTRAINT "coach_program_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
	WHEN duplicate_object THEN NULL;
END $$;--> statement-breakpoint
DO $$ BEGIN
	ALTER TABLE "coach_program" ADD CONSTRAINT "coach_program_source_analysis_id_resume_analysis_id_fk" FOREIGN KEY ("source_analysis_id") REFERENCES "public"."resume_analysis"("id") ON DELETE set null ON UPDATE no action;
EXCEPTION
	WHEN duplicate_object THEN NULL;
END $$;--> statement-breakpoint
DO $$ BEGIN
	ALTER TABLE "coach_plan" ADD CONSTRAINT "coach_plan_program_id_coach_program_id_fk" FOREIGN KEY ("program_id") REFERENCES "public"."coach_program"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
	WHEN duplicate_object THEN NULL;
END $$;--> statement-breakpoint
DO $$ BEGIN
	ALTER TABLE "coach_plan" ADD CONSTRAINT "coach_plan_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
	WHEN duplicate_object THEN NULL;
END $$;--> statement-breakpoint
DO $$ BEGIN
	ALTER TABLE "coach_progress" ADD CONSTRAINT "coach_progress_plan_id_coach_plan_id_fk" FOREIGN KEY ("plan_id") REFERENCES "public"."coach_plan"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
	WHEN duplicate_object THEN NULL;
END $$;--> statement-breakpoint
DO $$ BEGIN
	ALTER TABLE "coach_progress" ADD CONSTRAINT "coach_progress_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
	WHEN duplicate_object THEN NULL;
END $$;--> statement-breakpoint
DO $$ BEGIN
	ALTER TABLE "coach_session" ADD CONSTRAINT "coach_session_plan_id_coach_plan_id_fk" FOREIGN KEY ("plan_id") REFERENCES "public"."coach_plan"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
	WHEN duplicate_object THEN NULL;
END $$;--> statement-breakpoint
DO $$ BEGIN
	ALTER TABLE "coach_session" ADD CONSTRAINT "coach_session_program_id_coach_program_id_fk" FOREIGN KEY ("program_id") REFERENCES "public"."coach_program"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
	WHEN duplicate_object THEN NULL;
END $$;--> statement-breakpoint
DO $$ BEGIN
	ALTER TABLE "coach_session" ADD CONSTRAINT "coach_session_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
	WHEN duplicate_object THEN NULL;
END $$;--> statement-breakpoint
DO $$ BEGIN
	ALTER TABLE "coach_task" ADD CONSTRAINT "coach_task_plan_id_coach_plan_id_fk" FOREIGN KEY ("plan_id") REFERENCES "public"."coach_plan"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
	WHEN duplicate_object THEN NULL;
END $$;--> statement-breakpoint
DO $$ BEGIN
	ALTER TABLE "coach_task" ADD CONSTRAINT "coach_task_resource_id_learning_resources_id_fk" FOREIGN KEY ("resource_id") REFERENCES "public"."learning_resources"("id") ON DELETE set null ON UPDATE no action;
EXCEPTION
	WHEN duplicate_object THEN NULL;
END $$;--> statement-breakpoint
DO $$ BEGIN
	ALTER TABLE "coach_attempt" ADD CONSTRAINT "coach_attempt_task_id_coach_task_id_fk" FOREIGN KEY ("task_id") REFERENCES "public"."coach_task"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
	WHEN duplicate_object THEN NULL;
END $$;--> statement-breakpoint
DO $$ BEGIN
	ALTER TABLE "coach_attempt" ADD CONSTRAINT "coach_attempt_session_id_coach_session_id_fk" FOREIGN KEY ("session_id") REFERENCES "public"."coach_session"("id") ON DELETE set null ON UPDATE no action;
EXCEPTION
	WHEN duplicate_object THEN NULL;
END $$;--> statement-breakpoint
DO $$ BEGIN
	ALTER TABLE "coach_attempt" ADD CONSTRAINT "coach_attempt_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
	WHEN duplicate_object THEN NULL;
END $$;--> statement-breakpoint
DO $$ BEGIN
	ALTER TABLE "coach_period_usage" ADD CONSTRAINT "coach_period_usage_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
	WHEN duplicate_object THEN NULL;
END $$;--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "coach_program_active_role_uidx" ON "coach_program" USING btree ("user_id","role_key") WHERE "status" = 'active';--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "coach_program_user_id_idx" ON "coach_program" USING btree ("user_id");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "coach_plan_program_skill_uidx" ON "coach_plan" USING btree ("program_id","skill_key");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "coach_plan_user_id_idx" ON "coach_plan" USING btree ("user_id");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "coach_outline_cache_skill_segment_uidx" ON "coach_outline_cache" USING btree ("skill_key","segment");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "coach_session_plan_id_idx" ON "coach_session" USING btree ("plan_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "coach_session_user_id_idx" ON "coach_session" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "coach_task_plan_id_idx" ON "coach_task" USING btree ("plan_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "coach_attempt_task_id_idx" ON "coach_attempt" USING btree ("task_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "coach_attempt_user_id_idx" ON "coach_attempt" USING btree ("user_id");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "coach_period_usage_pk" ON "coach_period_usage" USING btree ("user_id","period_kind","period_start");--> statement-breakpoint
INSERT INTO "app_settings" ("key", "value") VALUES ('coach_enabled', 'true') ON CONFLICT ("key") DO NOTHING;
