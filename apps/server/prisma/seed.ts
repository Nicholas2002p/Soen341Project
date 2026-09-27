import "dotenv/config";

import { PrismaPg } from "@prisma/adapter-pg";

import {
  ApplicationStatus,
  EmploymentType,
  PrismaClient,
  UserRole,
} from "../src/generated/prisma/client.js";

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL is not defined.");
}

if (process.env.NODE_ENV === "production") {
  throw new Error("Database seeding is disabled in production.");
}

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL,
});

const prisma = new PrismaClient({
  adapter,
});

async function clearDatabase() {
  console.log("Clearing existing development data...");

  await prisma.applicationStatusHistory.deleteMany();
  await prisma.savedJob.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.skillOnJob.deleteMany();
  await prisma.skillOnProfile.deleteMany();
  await prisma.application.deleteMany();
  await prisma.session.deleteMany();
  await prisma.resume.deleteMany();
  await prisma.job.deleteMany();
  await prisma.company.deleteMany();
  await prisma.skill.deleteMany();
  await prisma.salt.deleteMany();
  await prisma.profile.deleteMany();
  await prisma.user.deleteMany();

  console.log("Existing development data cleared.");
}

async function main() {
  console.log("Starting CareerConnect database seed...");

  await clearDatabase();



  //NOTE - Users

  const alice = await prisma.user.create({
    data: {
      email: "alice.chen@example.com",
      password:
        "$2b$10$samplehashalice000000000000000000000000000000",
      role: UserRole.jobseeker,
      createdAt: new Date("2026-09-01T10:00:00"),
    },
  });

  const marc = await prisma.user.create({
    data: {
      email: "marc.tremblay@example.com",
      password:
        "$2b$10$samplehashmarc00000000000000000000000000000",
      role: UserRole.jobseeker,
      createdAt: new Date("2026-09-02T11:30:00"),
    },
  });

  const sophia = await prisma.user.create({
    data: {
      email: "sophia.patel@example.com",
      password:
        "$2b$10$samplesophia000000000000000000000000000000",
      role: UserRole.jobseeker,
      createdAt: new Date("2026-09-03T09:15:00"),
    },
  });

  const emily = await prisma.user.create({
    data: {
      email: "emily.hr@techcorp.com",
      password:
        "$2b$10$samplehashemily000000000000000000000000000000",
      role: UserRole.recruiter,
      createdAt: new Date("2026-09-01T08:00:00"),
    },
  });

  const david = await prisma.user.create({
    data: {
      email: "david.jobs@northerndata.com",
      password:
        "$2b$10$samplehashdavid000000000000000000000000000000",
      role: UserRole.recruiter,
      createdAt: new Date("2026-09-04T14:00:00"),
    },
  });

  const admin = await prisma.user.create({
    data: {
      email: "admin@careerconnect.com",
      password:
        "$2b$10$samplehashadmin000000000000000000000000000000",
      role: UserRole.admin,
      createdAt: new Date("2026-09-01T07:00:00"),
    },
  });

  //NOTE - Profiles

  await prisma.profile.createMany({
    data: [
      {
        userId: alice.userId,
        firstName: "Alice",
        middleName: null,
        lastName: "Chen",
        phone: "5145550101",
        bio: "Computer Science student interested in backend development and cloud technologies.",
        location: "Montreal, QC",
        profileURL: "https://example.com/profiles/alice",
      },
      {
        userId: marc.userId,
        firstName: "Marc",
        middleName: "Jean",
        lastName: "Tremblay",
        phone: "5145550102",
        bio: "Software engineering student interested in full-stack development.",
        location: "Laval, QC",
        profileURL: "https://example.com/profiles/marc",
      },
      {
        userId: sophia.userId,
        firstName: "Sophia",
        middleName: null,
        lastName: "Patel",
        phone: "4385550103",
        bio: "Data enthusiast interested in machine learning and analytics.",
        location: "Montreal, QC",
        profileURL: "https://example.com/profiles/sophia",
      },
      {
        userId: emily.userId,
        firstName: "Emily",
        middleName: null,
        lastName: "Johnson",
        phone: "5145550201",
        bio: "Technical recruiter at TechCorp.",
        location: "Montreal, QC",
        profileURL: "https://example.com/profiles/emily",
      },
      {
        userId: david.userId,
        firstName: "David",
        middleName: null,
        lastName: "Nguyen",
        phone: "4385550202",
        bio: "Recruiter specializing in software and data roles.",
        location: "Toronto, ON",
        profileURL: "https://example.com/profiles/david",
      },
    ],
  });

  //NOTE - Password Salts

  await prisma.salt.createMany({
    data: [
      {
        userId: alice.userId,
        Salt: "aliceRandomSalt2026",
      },
      {
        userId: marc.userId,
        Salt: "marcRandomSalt2026",
      },
      {
        userId: sophia.userId,
        Salt: "sophiaRandomSalt2026",
      },
      {
        userId: emily.userId,
        Salt: "emilyRandomSalt2026",
      },
      {
        userId: david.userId,
        Salt: "davidRandomSalt2026",
      },
      {
        userId: admin.userId,
        Salt: "adminRandomSalt2026",
      },
    ],
  });

  //NOTE - Skills

  const javascript = await prisma.skill.create({
    data: {
      skill: "JavaScript",
    },
  });

  const typescript = await prisma.skill.create({
    data: {
      skill: "TypeScript",
    },
  });

  const react = await prisma.skill.create({
    data: {
      skill: "React",
    },
  });

  const node = await prisma.skill.create({
    data: {
      skill: "Node.js",
    },
  });

  const postgresql = await prisma.skill.create({
    data: {
      skill: "PostgreSQL",
    },
  });

  const java = await prisma.skill.create({
    data: {
      skill: "Java",
    },
  });

  const python = await prisma.skill.create({
    data: {
      skill: "Python",
    },
  });

  const git = await prisma.skill.create({
    data: {
      skill: "Git",
    },
  });

  await prisma.skill.create({
    data: {
      skill: "Docker",
    },
  });

  await prisma.skill.create({
    data: {
      skill: "AWS",
    },
  });

  const machineLearning = await prisma.skill.create({
    data: {
      skill: "Machine Learning",
    },
  });

  const prismaSkill = await prisma.skill.create({
    data: {
      skill: "Prisma",
    },
  });

  const restApis = await prisma.skill.create({
    data: {
      skill: "REST APIs",
    },
  });

  const sql = await prisma.skill.create({
    data: {
      skill: "SQL",
    },
  });

  const nextjs = await prisma.skill.create({
    data: {
      skill: "Next.js",
    },
  });

  //NOTE - Seeker Skills

  await prisma.skillOnProfile.createMany({
    data: [
      // Alice
      {
        userId: alice.userId,
        skillId: typescript.skillId,
      },
      {
        userId: alice.userId,
        skillId: node.skillId,
      },
      {
        userId: alice.userId,
        skillId: postgresql.skillId,
      },
      {
        userId: alice.userId,
        skillId: git.skillId,
      },
      {
        userId: alice.userId,
        skillId: prismaSkill.skillId,
      },

      // Marc
      {
        userId: marc.userId,
        skillId: javascript.skillId,
      },
      {
        userId: marc.userId,
        skillId: react.skillId,
      },
      {
        userId: marc.userId,
        skillId: node.skillId,
      },
      {
        userId: marc.userId,
        skillId: nextjs.skillId,
      },
      {
        userId: marc.userId,
        skillId: git.skillId,
      },

      // Sophia
      {
        userId: sophia.userId,
        skillId: python.skillId,
      },
      {
        userId: sophia.userId,
        skillId: machineLearning.skillId,
      },
      {
        userId: sophia.userId,
        skillId: sql.skillId,
      },
      {
        userId: sophia.userId,
        skillId: postgresql.skillId,
      },
      {
        userId: sophia.userId,
        skillId: git.skillId,
      },
    ],
  });

  //NOTE - Companies

  const techCorp = await prisma.company.create({
    data: {
      name: "TechCorp",
      description:
        "Software company building cloud-based business applications.",
    },
  });

  const northernData = await prisma.company.create({
    data: {
      name: "Northern Data Labs",
      description:
        "Canadian data analytics and artificial intelligence company.",
    },
  });

  const mapleFinance = await prisma.company.create({
    data: {
      name: "Maple Finance",
      description:
        "Financial technology company developing digital banking solutions.",
    },
  });

  const pixelWorks = await prisma.company.create({
    data: {
      name: "PixelWorks",
      description:
        "Web and mobile application development agency.",
    },
  });

  //NOTE - Jobs

  const backendJob = await prisma.job.create({
    data: {
      companyId: techCorp.companyId,
      recruiterId: emily.userId,
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
      location: "Montreal, QC",
      description:
        "Full-stack intern working with React, Node.js and PostgreSQL.",
      salary: 45000,
      employmentType: EmploymentType.hybrid,
      deadline: new Date("2026-11-10T23:59:59"),
      createdAt: new Date("2026-09-15T12:00:00"),
    },
  });

  //NOTE - Job Skills

  await prisma.skillOnJob.createMany({
    data: [
      // Junior Backend Developer
      {
        jobId: backendJob.jobId,
        skillId: typescript.skillId,
      },
      {
        jobId: backendJob.jobId,
        skillId: node.skillId,
      },
      {
        jobId: backendJob.jobId,
        skillId: postgresql.skillId,
      },
      {
        jobId: backendJob.jobId,
        skillId: prismaSkill.skillId,
      },
      {
        jobId: backendJob.jobId,
        skillId: restApis.skillId,
      },

      // Frontend Developer
      {
        jobId: frontendJob.jobId,
        skillId: javascript.skillId,
      },
      {
        jobId: frontendJob.jobId,
        skillId: typescript.skillId,
      },
      {
        jobId: frontendJob.jobId,
        skillId: react.skillId,
      },
      {
        jobId: frontendJob.jobId,
        skillId: nextjs.skillId,
      },

      // Junior Data Analyst
      {
        jobId: dataAnalystJob.jobId,
        skillId: python.skillId,
      },
      {
        jobId: dataAnalystJob.jobId,
        skillId: sql.skillId,
      },
      {
        jobId: dataAnalystJob.jobId,
        skillId: postgresql.skillId,
      },

      // Machine Learning Intern
      {
        jobId: machineLearningJob.jobId,
        skillId: python.skillId,
      },
      {
        jobId: machineLearningJob.jobId,
        skillId: machineLearning.skillId,
      },
      {
        jobId: machineLearningJob.jobId,
        skillId: sql.skillId,
      },

      // Financial Software Developer
      {
        jobId: financeDeveloperJob.jobId,
        skillId: java.skillId,
      },
      {
        jobId: financeDeveloperJob.jobId,
        skillId: postgresql.skillId,
      },
      {
        jobId: financeDeveloperJob.jobId,
        skillId: restApis.skillId,
      },

      // Full-Stack Intern
      {
        jobId: fullStackInternJob.jobId,
        skillId: javascript.skillId,
      },
      {
        jobId: fullStackInternJob.jobId,
        skillId: react.skillId,
      },
      {
        jobId: fullStackInternJob.jobId,
        skillId: node.skillId,
      },
      {
        jobId: fullStackInternJob.jobId,
        skillId: postgresql.skillId,
      },
    ],
  });

  //NOTE - Resumes

  const aliceBackendResume = await prisma.resume.create({
    data: {
      userId: alice.userId,
      fileName: "Alice_Chen_Backend_Resume.pdf",
      fileURL: "https://example.com/resumes/alice-backend.pdf",
      createdAt: new Date("2026-09-05T14:20:00"),
    },
  });

  const aliceGeneralResume = await prisma.resume.create({
    data: {
      userId: alice.userId,
      fileName: "Alice_Chen_General_Resume.pdf",
      fileURL: "https://example.com/resumes/alice-general.pdf",
      createdAt: new Date("2026-09-08T17:00:00"),
    },
  });

  const marcResume = await prisma.resume.create({
    data: {
      userId: marc.userId,
      fileName: "Marc_Tremblay_Resume.pdf",
      fileURL: "https://example.com/resumes/marc.pdf",
      createdAt: new Date("2026-09-06T12:15:00"),
    },
  });

  const sophiaDataResume = await prisma.resume.create({
    data: {
      userId: sophia.userId,
      fileName: "Sophia_Patel_Data_Resume.pdf",
      fileURL: "https://example.com/resumes/sophia-data.pdf",
      createdAt: new Date("2026-09-07T16:45:00"),
    },
  });

  const sophiaMlResume = await prisma.resume.create({
    data: {
      userId: sophia.userId,
      fileName: "Sophia_Patel_ML_Resume.pdf",
      fileURL: "https://example.com/resumes/sophia-ml.pdf",
      createdAt: new Date("2026-09-09T10:30:00"),
    },
  });

  //NOTE - Applications

  const aliceBackendApplication = await prisma.application.create({
    data: {
      userId: alice.userId,
      jobId: backendJob.jobId,
      resumeId: aliceBackendResume.resumeId,
      status: ApplicationStatus.onhold,
      appliedAt: new Date("2026-09-18T10:20:00"),
    },
  });

  const aliceFullStackApplication = await prisma.application.create({
    data: {
      userId: alice.userId,
      jobId: fullStackInternJob.jobId,
      resumeId: aliceGeneralResume.resumeId,
      status: ApplicationStatus.accepted,
      appliedAt: new Date("2026-09-19T13:45:00"),
    },
  });

  const marcFrontendApplication = await prisma.application.create({
    data: {
      userId: marc.userId,
      jobId: frontendJob.jobId,
      resumeId: marcResume.resumeId,
      status: ApplicationStatus.onhold,
      appliedAt: new Date("2026-09-20T09:30:00"),
    },
  });

  const marcFullStackApplication = await prisma.application.create({
    data: {
      userId: marc.userId,
      jobId: fullStackInternJob.jobId,
      resumeId: marcResume.resumeId,
      status: ApplicationStatus.rejected,
      appliedAt: new Date("2026-09-21T15:00:00"),
    },
  });

  const sophiaDataApplication = await prisma.application.create({
    data: {
      userId: sophia.userId,
      jobId: dataAnalystJob.jobId,
      resumeId: sophiaDataResume.resumeId,
      status: ApplicationStatus.accepted,
      appliedAt: new Date("2026-09-18T11:10:00"),
    },
  });

  const sophiaMlApplication = await prisma.application.create({
    data: {
      userId: sophia.userId,
      jobId: machineLearningJob.jobId,
      resumeId: sophiaMlResume.resumeId,
      status: ApplicationStatus.onhold,
      appliedAt: new Date("2026-09-22T16:20:00"),
    },
  });

  //NOTE - Application History

  await prisma.applicationStatusHistory.createMany({
    data: [
      {
        applicationId: aliceBackendApplication.applicationId,
        status: ApplicationStatus.onhold,
        createdAt: new Date("2026-09-18T10:20:00"),
      },

      {
        applicationId: aliceFullStackApplication.applicationId,
        status: ApplicationStatus.onhold,
        createdAt: new Date("2026-09-19T13:45:00"),
      },
      {
        applicationId: aliceFullStackApplication.applicationId,
        status: ApplicationStatus.accepted,
        createdAt: new Date("2026-09-24T09:00:00"),
      },

      {
        applicationId: marcFrontendApplication.applicationId,
        status: ApplicationStatus.onhold,
        createdAt: new Date("2026-09-20T09:30:00"),
      },

      {
        applicationId: marcFullStackApplication.applicationId,
        status: ApplicationStatus.onhold,
        createdAt: new Date("2026-09-21T15:00:00"),
      },
      {
        applicationId: marcFullStackApplication.applicationId,
        status: ApplicationStatus.rejected,
        createdAt: new Date("2026-09-23T14:30:00"),
      },

      {
        applicationId: sophiaDataApplication.applicationId,
        status: ApplicationStatus.onhold,
        createdAt: new Date("2026-09-18T11:10:00"),
      },
      {
        applicationId: sophiaDataApplication.applicationId,
        status: ApplicationStatus.accepted,
        createdAt: new Date("2026-09-25T10:15:00"),
      },

      {
        applicationId: sophiaMlApplication.applicationId,
        status: ApplicationStatus.onhold,
        createdAt: new Date("2026-09-22T16:20:00"),
      },
    ],
  });

  //NOTE - Saved Jobs

  await prisma.savedJob.createMany({
    data: [
      {
        userId: alice.userId,
        jobId: dataAnalystJob.jobId,
      },
      {
        userId: alice.userId,
        jobId: financeDeveloperJob.jobId,
      },

      {
        userId: marc.userId,
        jobId: backendJob.jobId,
      },
      {
        userId: marc.userId,
        jobId: financeDeveloperJob.jobId,
      },

      {
        userId: sophia.userId,
        jobId: backendJob.jobId,
      },
      {
        userId: sophia.userId,
        jobId: machineLearningJob.jobId,
      },
      {
        userId: sophia.userId,
        jobId: fullStackInternJob.jobId,
      },
    ],
  });

  //NOTE - Notifications

  await prisma.notification.createMany({
    data: [
      {
        userId: alice.userId,
        type: "application_update",
        message:
          "Your application for Full-Stack Intern has been accepted.",
        read: false,
        createdAt: new Date("2026-09-24T09:05:00"),
      },
      {
        userId: alice.userId,
        type: "deadline_reminder",
        message:
          "Junior Backend Developer application deadline is approaching.",
        read: true,
        createdAt: new Date("2026-09-25T08:00:00"),
      },

      {
        userId: marc.userId,
        type: "application_update",
        message:
          "Your application for Full-Stack Intern was not selected.",
        read: false,
        createdAt: new Date("2026-09-23T14:35:00"),
      },
      {
        userId: marc.userId,
        type: "deadline_reminder",
        message:
          "Frontend Developer application deadline is October 20.",
        read: false,
        createdAt: new Date("2026-09-24T08:00:00"),
      },

      {
        userId: sophia.userId,
        type: "application_update",
        message:
          "Your application for Junior Data Analyst has been accepted.",
        read: false,
        createdAt: new Date("2026-09-25T10:20:00"),
      },
      {
        userId: sophia.userId,
        type: "job_recommendation",
        message:
          "A new Machine Learning Intern position matches your skills.",
        read: true,
        createdAt: new Date("2026-09-20T12:00:00"),
      },

      {
        userId: emily.userId,
        type: "new_application",
        message:
          "Alice Chen applied for Junior Backend Developer.",
        read: false,
        createdAt: new Date("2026-09-18T10:21:00"),
      },
      {
        userId: emily.userId,
        type: "new_application",
        message:
          "Marc Tremblay applied for Frontend Developer.",
        read: true,
        createdAt: new Date("2026-09-20T09:31:00"),
      },
    ],
  });

  //NOTE - Sessions

  await prisma.session.createMany({
    data: [
      {
        userId: alice.userId,
        tokenHash:
          "a3f1c281b7379016fd2640460d7779d234f9f57f379e61268bb27688d29584cf",
        expiresAt: new Date("2026-10-01T10:00:00"),
        createdAt: new Date("2026-09-24T10:00:00"),
      },
      {
        userId: marc.userId,
        tokenHash:
          "b96d49716c25539469da13ab80481ecae5cc839c091cd7e92c8d584c39633d21",
        expiresAt: new Date("2026-10-02T11:00:00"),
        createdAt: new Date("2026-09-25T11:00:00"),
      },
      {
        userId: emily.userId,
        tokenHash:
          "c5c36c952930dee812870b4c23f742a15a75e69135686fd99038e297e86b14ca",
        expiresAt: new Date("2026-10-03T09:00:00"),
        createdAt: new Date("2026-09-26T09:00:00"),
      },
    ],
  });
  //NOTE - Successful Seeding
  console.log("CareerConnect database seeded successfully.");
}

main()
  .catch((error) => {
    console.error("Database seed failed:");
    console.error(error);

    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });