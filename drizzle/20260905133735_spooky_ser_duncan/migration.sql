ALTER TABLE "jobs" ALTER COLUMN "required_skills" SET DATA TYPE jsonb USING "required_skills"::jsonb;--> statement-breakpoint
ALTER TABLE "jobs" ALTER COLUMN "required_skills" SET NOT NULL;