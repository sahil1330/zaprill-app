CREATE INDEX IF NOT EXISTS "resume_analysis_user_created_idx" ON "resume_analysis" ("user_id", "created_at" DESC);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "coach_progress_user_id_idx" ON "coach_progress" ("user_id");
