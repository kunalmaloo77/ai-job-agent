"use client";
import { z } from "zod";
import { jobAnalysisSchema } from "./src/lib/job-analysis";

type JobAnalysis = z.infer<typeof jobAnalysisSchema>;

type AnalyzeJobResponse = {
  data: JobAnalysis;
};

export default function Home() {
  const handleSubmit = async (event: React.SubmitEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const jobDescription = formData.get("job-description");

    if (typeof jobDescription === "string") {
      try {
        const response = await fetch("/api/analyze-job", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ job_description: jobDescription }),
        });

        if (!response.ok) {
          throw new Error("Network response was not ok");
        }

        const { data }: AnalyzeJobResponse = await response.json();

        if (!data) {
          throw new Error("Invalid response data");
        }
      } catch (error) {
        console.error("Error submitting job description:", error);
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="w-full max-w-2xl rounded-2xl bg-white p-8 shadow-sm border border-gray-200">
        <div className="mb-6">
          <h1 className="text-2xl font-semibold text-gray-900">
            Analyze Job Description
          </h1>
          <p className="mt-2 text-sm text-gray-500">
            Paste the job description below to analyze how well it matches your
            profile.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label
              htmlFor="job-description"
              className="mb-2 block text-sm font-medium text-gray-700"
            >
              Job Description
            </label>

            <textarea
              id="job-description"
              name="job-description"
              rows={12}
              placeholder="Paste the complete job description here..."
              className="w-full resize-none rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-gray-900 focus:ring-2 focus:ring-gray-900/10"
            />
          </div>

          <button
            type="submit"
            className="w-full rounded-xl bg-gray-900 px-5 py-3 text-sm font-medium text-white transition hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:ring-offset-2"
          >
            Analyze Job
          </button>
        </form>
      </div>
    </div>
  );
}
