import { z } from "zod";

const skillSchema = z.object({
  skill: z.string(),
  evidence: z.string(),
});

export const jobAnalysisSchema = z.object({
  role: z.string(),

  seniority: z.enum(["intern", "junior", "mid", "senior", "staff", "unknown"]),

  responsibilities: z.array(z.string()),

  minimumYearsOfExperience: z.number().nullable(),

  requiredSkills: z.array(z.array(skillSchema)),

  preferredSkills: z.array(z.string()),

  educationRequirements: z.array(z.string()),

  locationRequirements: z.array(z.string()),
});
