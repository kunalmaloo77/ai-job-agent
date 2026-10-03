CREATE TABLE "candidate_embeddings" (
	"id" bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "candidate_embeddings_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 9223372036854775807 START WITH 1 CACHE 1),
	"candidate_id" bigint NOT NULL UNIQUE,
	"embedding_type " text NOT NULL,
	"content" text NOT NULL,
	"embedding" vector(768)
);
--> statement-breakpoint
CREATE TABLE "candidate_projects" (
	"id" bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "candidate_projects_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 9223372036854775807 START WITH 1 CACHE 1),
	"candidate_id" bigint NOT NULL,
	"title" text NOT NULL,
	"summary" text,
	"tech_stack" text[],
	"project_url" text,
	"github_url" text
);
--> statement-breakpoint
CREATE TABLE "candidates" (
	"id" bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "candidates_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 9223372036854775807 START WITH 1 CACHE 1),
	"name" text,
	"email" text,
	"skills" text[],
	"preferred_roles" text[],
	"years_experience" numeric(4,1),
	"education_summary" text,
	"preferred_locations" text[],
	"employment_type" text[]
);
--> statement-breakpoint
ALTER TABLE "candidate_embeddings" ADD CONSTRAINT "candidate_embeddings_candidate_id_candidates_id_fkey" FOREIGN KEY ("candidate_id") REFERENCES "candidates"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "candidate_projects" ADD CONSTRAINT "candidate_projects_candidate_id_candidates_id_fkey" FOREIGN KEY ("candidate_id") REFERENCES "candidates"("id") ON DELETE CASCADE;