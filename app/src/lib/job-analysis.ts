import { z } from "zod";

const skillSchema = z.object({
  skill: z.string().min(1).max(100),
  evidenceFromJobDescription: z
    .string()
    .min(1)
    .max(300)
    .describe(
      "A short sentence or phrase from the job description explaining why this skill is required.",
    ),
});

export const jobAnalysisSchema = z.object({
  role: z.string(),

  seniority: z.enum(["intern", "junior", "mid", "senior", "staff", "unknown"]),

  responsibilities: z.array(z.string().max(300)).max(15),

  minimumYearsOfExperience: z.number().nullable(),

  requiredSkills: z.array(skillSchema).max(30),

  preferredSkills: z.array(z.string().max(100)).max(30),

  educationRequirements: z.array(z.string().max(200)).max(10),

  locationRequirements: z.array(z.string().max(200)).max(10),
});
