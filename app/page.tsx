"use client";

type requiredSkillsType = {
  skill: string,
  evidence: string, 
}
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

        const data = await response.json();

        if(!data){
          throw new Error("Could not generate data");
        }
        const roleText = data?.role || 'Full Stack Engineer';
        const responsibilityText = data?.responsibilities?.map((responsibility: string) => `- ${responsibility}`
        ).join("\n");
        const requiredSkillsText = data?.requiredSkills?.flat()?.map((item: requiredSkillsType) => item.skill).join(", ");
        const preferredSkills = data?.preferredSkills?.map((skill: string) => `- ${skill}`).join("\n");
        const experience = data?.minimumYearsOfExperience;
        
        const textForEmbedding = `
          Role: ${roleText}
          Responsibilities: 
          ${responsibilityText} 
          RequiredSkills: ${requiredSkillsText}
          PreferredSkills: 
          ${preferredSkills}
          Experience:
          ${experience} years
        `

        const embededContent = await fetch("api/generate-embedding", {
          method: "POST",
          body: textForEmbedding
        })

      } catch (error) {
        console.error("Error submitting job description:", error);
      }
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen py-2">
      <form onSubmit={handleSubmit} className="flex flex-col items-center">
        <label htmlFor="job-description">Job Description</label>
        <textarea
          id="job-description"
          name="job-description"
          rows={10}
          cols={50}
          placeholder="Enter job description here..."
        ></textarea>
        <br />
        <button type="submit">Submit</button>
      </form>
    </div>
  );
}
