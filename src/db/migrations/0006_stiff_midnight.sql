ALTER TABLE "user" ADD COLUMN "monthly_searches_count" integer DEFAULT 0;--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "searches_reset_date" timestamp;