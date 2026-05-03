CREATE TYPE "public"."onboarding_status" AS ENUM('not_started', 'in_progress', 'completed');--> statement-breakpoint
ALTER TABLE "user_profile" ADD COLUMN "onboarding_status" "onboarding_status" DEFAULT 'not_started' NOT NULL;--> statement-breakpoint
ALTER TABLE "user_profile" ADD COLUMN "primary_resume_id" text;--> statement-breakpoint
ALTER TABLE "user_profile" ADD CONSTRAINT "user_profile_primary_resume_id_resume_id_fk" FOREIGN KEY ("primary_resume_id") REFERENCES "public"."resume"("id") ON DELETE set null ON UPDATE no action;