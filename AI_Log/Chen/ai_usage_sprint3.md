Task ID/Title: Generate more jobs for seeding
Purpose of AI Use: Why AI was used create more fake random data
Chat Link or Prompt/Response:
```
this is our current backend seeding for jobs

const backendJob = await prisma.job.create({
    data: {
      companyId: techCorp.companyId,
      recruiterId: emily.userId,
      title: "Junior Backend Developer",
      category: "Software Development",
      location: "Montreal, QC",
      description:
        "Junior backend developer working with Node.js, TypeScript and PostgreSQL.",
      salary: 65000,
      employmentType: EmploymentType.hybrid,
      deadline: new Date("2026-10-15T23:59:59"),
      createdAt: new Date("2026-09-10T09:00:00"),
    },
  });

  const frontendJob = await prisma.job.create({
    data: {
      companyId: techCorp.companyId,
      recruiterId: emily.userId,
      title: "Frontend Developer",
      category: "Software Development",
      location: "Montreal, QC",
      description:
        "Frontend developer responsible for building React and Next.js applications.",
      salary: 62000,
      employmentType: EmploymentType.hybrid,
      deadline: new Date("2026-10-20T23:59:59"),
      createdAt: new Date("2026-09-11T10:30:00"),
    },
  });

  const dataAnalystJob = await prisma.job.create({
    data: {
      companyId: northernData.companyId,
      recruiterId: david.userId,
      title: "Junior Data Analyst",
      category: "Data Analytics",
      location: "Toronto, ON",
      description:
        "Junior data analyst working with Python, SQL and analytics tools.",
      salary: 67000,
      employmentType: EmploymentType.remote,
      deadline: new Date("2026-10-25T23:59:59"),
      createdAt: new Date("2026-09-12T13:00:00"),
    },
  });

  const machineLearningJob = await prisma.job.create({
    data: {
      companyId: northernData.companyId,
      recruiterId: david.userId,
      title: "Machine Learning Intern",
      category: "Artificial Intelligence",
      location: "Toronto, ON",
      description:
        "Machine learning intern helping develop predictive models.",
      salary: 48000,
      employmentType: EmploymentType.remote,
      deadline: new Date("2026-11-01T23:59:59"),
      createdAt: new Date("2026-09-13T11:00:00"),
    },
  });

  const financeDeveloperJob = await prisma.job.create({
    data: {
      companyId: mapleFinance.companyId,
      recruiterId: david.userId,
      title: "Financial Software Developer",
      category: "Software Development",
      location: "Montreal, QC",
      description:
        "Software developer working on financial services APIs.",
      salary: 72000,
      employmentType: EmploymentType.on_site,
      deadline: new Date("2026-10-30T23:59:59"),
      createdAt: new Date("2026-09-14T08:45:00"),
    },
  });

  const fullStackInternJob = await prisma.job.create({
    data: {
      companyId: pixelWorks.companyId,
      recruiterId: emily.userId,
      title: "Full-Stack Developer Intern",
      category: "Software Development",
      location: "Montreal, QC",
      description:
        "Full-stack intern working with React, Node.js and PostgreSQL.",
      salary: 45000,
      employmentType: EmploymentType.hybrid,
      deadline: new Date("2026-11-10T23:59:59"),
      createdAt: new Date("2026-09-15T12:00:00"),
    },
  });


could you add about 20 jobs with variable deadlines that are soon and really far into the future
```
AI-Suggested Content: AI gave me 20 more jobs using our format
Validation: I ran it and verified it was added correctly
Decision: Accepted
Reflection: Ai is good at generating random content
Responsible Person: Yun Chen Qian
