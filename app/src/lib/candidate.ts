export const candidateProfile = {
  name: "Kunal Maloo",
  email: "kunnalmaloo@gmail.com",
  targetRoles: [
    "Software Engineer",
    "SDE-1",
    "Full-Stack Engineer",
    "Backend Engineer",
    "Software Developer",
  ],
  workExperience: 1.5,
  education: {
    degree: "Bachelor of Technology (B.Tech)",
    field: "Computer Science Engineering",
    gradYear: 2025,
  },
  skills: [
    "Redux",
    "Java",
    "Javascript",
    "Typescript",
    "React.js",
    "HTML5",
    "CSS3",
    "Rest APIs",
    "WebSockets",
    "Express",
    "NodeJs",
    "Django Rest Framework",
    "PostgresSQL",
    "Python",
    "MongoDb",
    "Redis",
    "Docker",
    "Git",
    "AWS S3",
    "AWS EC2",
  ],
  projects: [
    {
      title: "Movie Booking System",
      techStack: ["React.js", "Node.js", "PostgreSQL", "REST API", "JWT"],
      highlights:
        "Concurrency-safe seat reservations using PostgreSQL transactions and row-level locking to prevent double booking.",
    },
    {
      title: "Organic Shop E-Commerce Platform",
      techStack: [
        "React",
        "Express.js",
        "MongoDB",
        "AWS S3",
        "Redis",
        "Docker",
        "Razorpay",
      ],
      highlights:
        "Full-stack e-commerce app with JWT/Redis session auth, AWS S3 image storage, Razorpay webhooks, Docker containerization, and AI-powered product description generation.",
    },
  ],
  preferredLocations: ["India", "Remote", "Bengaluru", "Hyderabad", "Pune"],
};

export const embeddingTextForCandidate = `
Role: ${candidateProfile.targetRoles[0]}
Experience: ${candidateProfile.workExperience} years
Education: ${candidateProfile.education.degree} in ${candidateProfile.education.field}
Skills: 
${candidateProfile.skills.map((skill) => `-${skill}`).join("\n")}
`;
