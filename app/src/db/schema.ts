import {
  bigint,
  jsonb,
  numeric,
  pgEnum,
  pgTable,
  text,
  vector,
} from "drizzle-orm/pg-core";
import { EMBEDDING_DIMENSIONS } from "../lib/constants";
import { defineRelations } from "drizzle-orm";

export const seniorityEnum = pgEnum("seniority", [
  "intern",
  "junior",
  "mid",
  "senior",
  "staff",
  "unknown",
]);

type SkillEvidence = {
  skill: string;
  evidenceFromJobDescription: string;
};

export const candidates = pgTable("candidates", {
  id: bigint("id", { mode: "number" }).primaryKey().generatedAlwaysAsIdentity(),
  name: text("name"),
  email: text("email"),
  skills: text("skills").array(),
  preferredRoles: text("preferred_roles").array(),
  yearsExperience: numeric("years_experience", { precision: 4, scale: 1 }),
  educationSummary: text("education_summary"),
  preferredLocations: text("preferred_locations").array(),
  employmentType: text("employment_type").array(),
});

export const jobs = pgTable("jobs", {
  id: bigint("id", { mode: "number" }).primaryKey().generatedAlwaysAsIdentity(),
  role: text("role"),
  seniority: seniorityEnum(),
  requiredSkills: jsonb("required_skills").$type<SkillEvidence[]>().notNull(),
  minimumYearsOfExperience: numeric("min_years_of_experience", {
    precision: 4,
    scale: 1,
    mode: "number",
  }),
  educationRequirements: text("education_requirements").array(),
  locationRequirements: text("location_requirements").array(),
});

export const candidateEmbeddings = pgTable("candidate_embeddings", {
  id: bigint("id", { mode: "number" }).primaryKey().generatedAlwaysAsIdentity(),
  candidateId: bigint("candidate_id", { mode: "number" })
    .notNull()
    .unique()
    .references(() => candidates.id, { onDelete: "cascade" }),
  content: text("content").notNull(),
  embedding: vector("embedding", { dimensions: EMBEDDING_DIMENSIONS }),
});

export const jobEmbeddings = pgTable("job_embeddings", {
  id: bigint("id", { mode: "number" }).primaryKey().generatedAlwaysAsIdentity(),
  jobId: bigint("job_id", { mode: "number" })
    .notNull()
    .references(() => jobs.id, { onDelete: "cascade" }),
  content: text("content").notNull(),
  embedding: vector("embedding", { dimensions: EMBEDDING_DIMENSIONS }),
});

export const candidateProjects = pgTable("candidate_projects", {
  id: bigint("id", { mode: "number" }).primaryKey().generatedAlwaysAsIdentity(),
  candidateId: bigint("candidate_id", { mode: "number" })
    .notNull()
    .references(() => candidates.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  summary: text("summary"),
  techStack: text("tech_stack").array(),
  projectUrl: text("project_url"),
  githubUrl: text("github_url"),
});

export const candidatesRelations = defineRelations(
  { candidates, candidateEmbeddings },
  (r) => ({
    candidates: {
      embedding: r.one.candidateEmbeddings({
        from: r.candidates.id,
        to: r.candidateEmbeddings.candidateId,
      }),
    },

    candidate_embeddings: {
      candidate: r.one.candidates({
        from: r.candidateEmbeddings.candidateId,
        to: r.candidates.id,
      }),
    },
  }),
);
