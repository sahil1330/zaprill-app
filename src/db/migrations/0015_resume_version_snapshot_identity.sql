ALTER TABLE "resume_version" ADD COLUMN IF NOT EXISTS "template_slug" text;--> statement-breakpoint
ALTER TABLE "resume_version" ADD COLUMN IF NOT EXISTS "title" text;--> statement-breakpoint
ALTER TABLE "resume_version" ADD COLUMN IF NOT EXISTS "industry" text;
