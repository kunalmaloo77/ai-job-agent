CREATE TYPE "seniority" AS ENUM('intern', 'junior', 'mid', 'senior', 'staff', 'unknown');--> statement-breakpoint
CREATE TABLE "job_embeddings" (
	"id" bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "job_embeddings_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 9223372036854775807 START WITH 1 CACHE 1),
	"job_id" bigint NOT NULL,
	"content" text NOT NULL,
	"embedding" vector(768)
);
--> statement-breakpoint
CREATE TABLE "jobs" (
	"id" bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "jobs_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 9223372036854775807 START WITH 1 CACHE 1),
	"role" text,
	"seniority" "seniority",
	"required_skills" text[],
	"preferred_roles" text[],
	"min_years_of_experience" numeric(4,1),
	"education_requirements" text[],
	"location_requirements" text[]
);
--> statement-breakpoint
ALTER TABLE "candidate_embeddings" DROP COLUMN "embedding_type ";--> statement-breakpoint
ALTER TABLE "job_embeddings" ADD CONSTRAINT "job_embeddings_job_id_jobs_id_fkey" FOREIGN KEY ("job_id") REFERENCES "jobs"("id") ON DELETE CASCADE;