ALTER TABLE "user_profile" ALTER COLUMN "resume_raw" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "invoice" ADD COLUMN "gst_percentage" numeric(5, 2);--> statement-breakpoint
ALTER TABLE "plan" ADD COLUMN "is_gst_enabled" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "plan" ADD COLUMN "gst_percentage" numeric(5, 2) DEFAULT '18';