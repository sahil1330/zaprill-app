ALTER TYPE "ai_action" ADD VALUE IF NOT EXISTS 'resume_chat';--> statement-breakpoint
CREATE TABLE "resume_chat" (
	"id" text PRIMARY KEY NOT NULL,
	"resume_id" text NOT NULL,
	"user_id" text NOT NULL,
	"messages" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "resume_chat" ADD CONSTRAINT "resume_chat_resume_id_resume_id_fk" FOREIGN KEY ("resume_id") REFERENCES "public"."resume"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "resume_chat" ADD CONSTRAINT "resume_chat_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "resume_chat_resume_id_uidx" ON "resume_chat" USING btree ("resume_id");--> statement-breakpoint
CREATE INDEX "resume_chat_user_id_idx" ON "resume_chat" USING btree ("user_id");
