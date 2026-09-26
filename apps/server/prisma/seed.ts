import "dotenv/config";

import { PrismaPg } from "@prisma/adapter-pg";

import {
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
  //NOTE - Successful Seeding Message
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