-- Additive career profile. Does not alter resume, user_profile, or job tables.
CREATE TYPE "public"."career_segment" AS ENUM('student', 'fresher', 'professional');--> statement-breakpoint
CREATE TYPE "public"."career_skill_level" AS ENUM('unspecified', 'beginner', 'intermediate', 'advanced', 'expert');--> statement-breakpoint
CREATE TYPE "public"."career_record_source" AS ENUM('resume', 'self_reported');--> statement-breakpoint
CREATE TYPE "public"."career_employment_type" AS ENUM('internship', 'full_time', 'part_time', 'contract', 'freelance', 'apprenticeship', 'other');--> statement-breakpoint
CREATE TYPE "public"."career_target_seniority" AS ENUM('intern', 'fresher', 'junior', 'mid', 'senior', 'lead', 'unspecified');--> statement-breakpoint
CREATE TABLE "career_profile" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"segment" "career_segment",
	"headline" text,
	"city" text,
	"region" text,
	"country_code" text DEFAULT 'IN' NOT NULL,
	"current_salary_inr" integer,
	"expected_salary_inr" integer,
	"experience_months" integer,
	"notice_period_days" integer,
	"open_to_relocate" boolean DEFAULT false NOT NULL,
	"field_sources" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"derived_from_resume_id" text,
	"last_derived_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "career_profile_user_id_unique" UNIQUE("user_id")
);
--> statement-breakpoint
CREATE TABLE "career_academic" (
	"id" text PRIMARY KEY NOT NULL,
	"career_profile_id" text NOT NULL,
	"user_id" text NOT NULL,
	"institution" text NOT NULL,
	"study_type" text,
	"area" text,
	"start_date" text,
	"end_date" text,
	"score" text,
	"is_current" boolean DEFAULT false NOT NULL,
	"source" "career_record_source" DEFAULT 'resume' NOT NULL,
	"source_item_id" text,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "career_experience" (
	"id" text PRIMARY KEY NOT NULL,
	"career_profile_id" text NOT NULL,
	"user_id" text NOT NULL,
	"company" text NOT NULL,
	"title" text NOT NULL,
	"location" text,
	"employment_type" "career_employment_type" DEFAULT 'full_time' NOT NULL,
	"start_date" text,
	"end_date" text,
	"is_current" boolean DEFAULT false NOT NULL,
	"summary" text,
	"highlights" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"source" "career_record_source" DEFAULT 'resume' NOT NULL,
	"source_item_id" text,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "career_skill" (
	"id" text PRIMARY KEY NOT NULL,
	"career_profile_id" text NOT NULL,
	"user_id" text NOT NULL,
	"name" text NOT NULL,
	"normalized_name" text NOT NULL,
	"category" "skill_category" DEFAULT 'other' NOT NULL,
	"level" "career_skill_level" DEFAULT 'unspecified' NOT NULL,
	"evidence" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"source" "career_record_source" DEFAULT 'resume' NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "career_target_role" (
	"id" text PRIMARY KEY NOT NULL,
	"career_profile_id" text NOT NULL,
	"user_id" text NOT NULL,
	"title" text NOT NULL,
	"normalized_title" text NOT NULL,
	"seniority" "career_target_seniority" DEFAULT 'unspecified' NOT NULL,
	"is_primary" boolean DEFAULT false NOT NULL,
	"source" "career_record_source" DEFAULT 'resume' NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "career_profile" ADD CONSTRAINT "career_profile_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "career_profile" ADD CONSTRAINT "career_profile_derived_from_resume_id_resume_id_fk" FOREIGN KEY ("derived_from_resume_id") REFERENCES "public"."resume"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "career_academic" ADD CONSTRAINT "career_academic_career_profile_id_career_profile_id_fk" FOREIGN KEY ("career_profile_id") REFERENCES "public"."career_profile"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "career_academic" ADD CONSTRAINT "career_academic_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "career_experience" ADD CONSTRAINT "career_experience_career_profile_id_career_profile_id_fk" FOREIGN KEY ("career_profile_id") REFERENCES "public"."career_profile"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "career_experience" ADD CONSTRAINT "career_experience_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "career_skill" ADD CONSTRAINT "career_skill_career_profile_id_career_profile_id_fk" FOREIGN KEY ("career_profile_id") REFERENCES "public"."career_profile"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "career_skill" ADD CONSTRAINT "career_skill_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "career_target_role" ADD CONSTRAINT "career_target_role_career_profile_id_career_profile_id_fk" FOREIGN KEY ("career_profile_id") REFERENCES "public"."career_profile"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "career_target_role" ADD CONSTRAINT "career_target_role_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "career_academic_user_id_idx" ON "career_academic" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "career_experience_user_id_idx" ON "career_experience" USING btree ("user_id");--> statement-breakpoint
CREATE UNIQUE INDEX "career_skill_user_name_uidx" ON "career_skill" USING btree ("user_id","normalized_name");--> statement-breakpoint
CREATE INDEX "career_skill_user_id_idx" ON "career_skill" USING btree ("user_id");--> statement-breakpoint
CREATE UNIQUE INDEX "career_target_role_user_title_uidx" ON "career_target_role" USING btree ("user_id","normalized_title");--> statement-breakpoint
CREATE INDEX "career_target_role_user_id_idx" ON "career_target_role" USING btree ("user_id");
