# Sprint 1 Logs
Task ID/Title: Using AI to generate sample data for our database
Purpose of AI Use: It is easy for AI to just randomly generate sample data, since it can be whatever we want it to be
Chat Link or Prompt/Response: 
```
Prompt Here is my current Prisma Schema. Generate me some sample data to put into a postgresSQL database. Just give me sample data do not write the code;
// This is your Prisma schema file,
// learn more about it in the docs: https://pris.ly/d/prisma-schema

// Get a free hosted Postgres database in seconds: `npx create-db`

generator client {
  provider = "prisma-client"
  output   = "../src/generated/prisma"
}

datasource db {
  provider = "postgresql"
}

//enum types
enum UserRole {
  recruiter
  jobseeker
  admin
}

enum EmploymentType {
  on_site
  hybrid
  remote
}

enum ApplicationStatus {
  onhold
  rejected
  accepted
}

//tables

///The information needed to login and register a user
model User {
  userId    Int       @id @default(autoincrement()) @map("userId")
  email     String    @unique @db.VarChar(150)
  password  String    @db.VarChar(60)
  role      UserRole
  createdAt DateTime  @default(now()) @map("created_at")
  updatedAt DateTime? @map("updated_at")

  profile       Profile?
  resumes       Resume[]
  jobs          Job[]
  applications  Application[]
  savedJobs     SavedJob[]
  notifications Notification[]
  salt          Salt?
  sessions      Session[]

  @@map("Users")
  skillOnProfiles SkillOnProfile[]
}

/// Stores hashed authentication tokens for active sessions.
model Session {
  id        Int      @id @default(autoincrement())
  userId    Int      @map("userId")
  tokenHash String   @unique @map("token_hash") @db.VarChar(64)
  expiresAt DateTime @map("expires_at")
  createdAt DateTime @default(now()) @map("created_at")

  user User @relation(fields: [userId], references: [userId], onDelete: Cascade)

  @@index([userId])
  @@map("Session")
}

///To store salt for passwords
model Salt {
  SaltId Int    @id @default(autoincrement()) @map("SaltId")
  userId Int    @unique @map("userId")
  Salt   String @db.VarChar(60)

  user User @relation(fields: [userId], references: [userId])

  @@map("Salt")
}

model Skill{
  skillId Int @id @default(autoincrement())@map("skillId")
  skill   String @db.VarChar(50)

  skillOnProfiles SkillOnProfile[]

  skillOnJobs SkillOnJob[]
}

/// information used in the user's profile
model Profile {
  profileId  Int     @id @default(autoincrement()) @map("profileId")
  userId     Int     @unique @map("userId")
  firstName  String  @db.VarChar(50)
  middleName String? @db.VarChar(50)
  lastName   String  @map("LastName") @db.VarChar(50)
  phone      String? @db.VarChar(13)
  bio        String? @db.VarChar(250)
  location   String? @db.VarChar(100)
  profileURL String?  @db.VarChar(500)


  user User @relation(fields: [userId], references: [userId])

  @@map("Profile")
}


/// saves the users resume 
model Resume {
  resumeId  Int      @id @default(autoincrement()) @map("resumeId")
  userId    Int      @map("userId")
  fileName  String   @db.VarChar(255)
  fileURL   String?  @db.VarChar(500)
  createdAt DateTime @default(now()) @map("created_at")

  user         User          @relation(fields: [userId], references: [userId])
  applications Application[]

  @@map("Resume")
}

/// Company information
model Company {
  companyId   Int     @id @default(autoincrement()) @map("companyId")
  name        String  @db.VarChar(50)
  description String? @db.VarChar(250)

  jobs Job[]

  @@map("Company")
}

/// Information for job board
model Job {
  jobId          Int            @id @default(autoincrement()) @map("jobId")
  companyId      Int            @map("companyId")
  recruiterId    Int            @map("recruitorId")
  location       String?        @db.VarChar(100)
  description    String?        @db.VarChar(250)
  salary         Int
  employmentType EmploymentType @map("employment_type")
  deadline       DateTime?
  createdAt      DateTime       @default(now()) @map("created_at")
  updatedAt     DateTime?       @default(now()) @map("updated_at")

  company      Company       @relation(fields: [companyId], references: [companyId])
  recruiter    User          @relation(fields: [recruiterId], references: [userId])
  applications Application[]
  savedJobs    SavedJob[]

  @@map("Job")
  skillOnJobs SkillOnJob[]
}

///The users application to a job
model Application {
  applicationId Int               @id @default(autoincrement()) @map("applicationId")
  userId        Int               @map("userId")
  jobId         Int               @map("jobId")
  resumeId      Int               @map("resumeId")
  status        ApplicationStatus
  appliedAt     DateTime          @default(now()) @map("applied_at")
  updatedAt     DateTime?         @default(now()) @map("updated_at")

  user          User                       @relation(fields: [userId], references: [userId])
  job           Job                        @relation(fields: [jobId], references: [jobId])
  resume        Resume                     @relation(fields: [resumeId], references: [resumeId])
  statusHistory ApplicationStatusHistory[]

  @@unique([userId, jobId])
  @@map("Application")
}

/// list of jobs the  user bookmarked for later
model SavedJob {
  savedJobId Int @id @default(autoincrement()) @map("savedJobId")
  userId     Int @map("userId")
  jobId      Int @map("jobId")

  user User @relation(fields: [userId], references: [userId])
  job  Job  @relation(fields: [jobId], references: [jobId])

  @@unique([userId, jobId])
  @@map("SavedJob")
}

/// A single notification sent to a user
model Notification {
  id        Int      @id @default(autoincrement())
  userId    Int      @map("userId")
  type      String   @db.VarChar(50)
  message   String   @db.VarChar(500)
  read      Boolean  @default(false)
  createdAt DateTime @default(now()) @map("created_at")

  user User @relation(fields: [userId], references: [userId])

  @@map("Notification")
}

///to see the total history of an application
model ApplicationStatusHistory {
  id            Int               @id @default(autoincrement())
  applicationId Int               @map("applicationId")
  status        ApplicationStatus
  createdAt     DateTime          @default(now()) @map("created_at")

  application Application @relation(fields: [applicationId], references: [applicationId])

  @@map("ApplicationStatusHistory")
}

model SkillOnProfile{
  id            Int      @id @default(autoincrement())
  skillId       Int      @map("skillId")
  userId        Int      @map("userId")

  skill Skill @relation(fields: [skillId], references: [skillId])
  user User @relation(fields: [userId], references: [userId])


}

model SkillOnJob{
  id            Int       @id @default(autoincrement())
  skillId       Int      @map("skillId")
  jobId         Int      @map("jobId")

  skill Skill @relation(fields: [skillId], references: [skillId])
  job Job @relation(fields: [jobId], references: [jobId])
  
}
```
Response: 
```
Below is a coherent sample dataset you can use for your CareerConnect PostgreSQL database. The IDs are written explicitly so the relationships are easy to follow.

### Users

| userId | email | password | role | createdAt |
|---:|---|---|---|---|
| 1 | alice.chen@example.com | `$2b$10$samplehashalice000000000000000000000000000000` | jobseeker | 2026-09-01 10:00:00 |
| 2 | marc.tremblay@example.com | `$2b$10$samplehashmarc00000000000000000000000000000` | jobseeker | 2026-09-02 11:30:00 |
| 3 | sophia.patel@example.com | `$2b$10$samplesophia000000000000000000000000000000` | jobseeker | 2026-09-03 09:15:00 |
| 4 | emily.hr@techcorp.com | `$2b$10$samplehashemily000000000000000000000000000000` | recruiter | 2026-09-01 08:00:00 |
| 5 | david.jobs@northerndata.com | `$2b$10$samplehashdavid000000000000000000000000000000` | recruiter | 2026-09-04 14:00:00 |
| 6 | admin@careerconnect.com | `$2b$10$samplehashadmin000000000000000000000000000000` | admin | 2026-09-01 07:00:00 |

### Profiles

| profileId | userId | firstName | middleName | lastName | phone | bio | location | profileURL |
|---:|---:|---|---|---|---|---|---|---|
| 1 | 1 | Alice | NULL | Chen | 5145550101 | Computer Science student interested in backend development and cloud technologies. | Montreal, QC | https://example.com/profiles/alice |
| 2 | 2 | Marc | Jean | Tremblay | 5145550102 | Software engineering student interested in full-stack development. | Laval, QC | https://example.com/profiles/marc |
| 3 | 3 | Sophia | NULL | Patel | 4385550103 | Data enthusiast interested in machine learning and analytics. | Montreal, QC | https://example.com/profiles/sophia |
| 4 | 4 | Emily | NULL | Johnson | 5145550201 | Technical recruiter at TechCorp. | Montreal, QC | https://example.com/profiles/emily |
| 5 | 5 | David | NULL | Nguyen | 4385550202 | Recruiter specializing in software and data roles. | Toronto, ON | https://example.com/profiles/david |

### Salt

| SaltId | userId | Salt |
|---:|---:|---|
| 1 | 1 | aliceRandomSalt2026 |
| 2 | 2 | marcRandomSalt2026 |
| 3 | 3 | sophiaRandomSalt2026 |
| 4 | 4 | emilyRandomSalt2026 |
| 5 | 5 | davidRandomSalt2026 |
| 6 | 6 | adminRandomSalt2026 |

### Skills

| skillId | skill |
|---:|---|
| 1 | JavaScript |
| 2 | TypeScript |
| 3 | React |
| 4 | Node.js |
| 5 | PostgreSQL |
| 6 | Java |
| 7 | Python |
| 8 | Git |
| 9 | Docker |
| 10 | AWS |
| 11 | Machine Learning |
| 12 | Prisma |
| 13 | REST APIs |
| 14 | SQL |
| 15 | Next.js |

### SkillOnProfile

| id | skillId | userId |
|---:|---:|---:|
| 1 | 2 | 1 |
| 2 | 4 | 1 |
| 3 | 5 | 1 |
| 4 | 8 | 1 |
| 5 | 12 | 1 |
| 6 | 1 | 2 |
| 7 | 3 | 2 |
| 8 | 4 | 2 |
| 9 | 15 | 2 |
| 10 | 8 | 2 |
| 11 | 7 | 3 |
| 12 | 11 | 3 |
| 13 | 14 | 3 |
| 14 | 5 | 3 |
| 15 | 8 | 3 |

### Companies

| companyId | name | description |
|---:|---|---|
| 1 | TechCorp | Software company building cloud-based business applications. |
| 2 | Northern Data Labs | Canadian data analytics and artificial intelligence company. |
| 3 | Maple Finance | Financial technology company developing digital banking solutions. |
| 4 | PixelWorks | Web and mobile application development agency. |

### Jobs

| jobId | companyId | recruiterId | location | description | salary | employmentType | deadline | createdAt |
|---:|---:|---:|---|---|---:|---|---|---|
| 1 | 1 | 4 | Montreal, QC | Junior backend developer working with Node.js, TypeScript and PostgreSQL. | 65000 | hybrid | 2026-10-15 23:59:59 | 2026-09-10 09:00:00 |
| 2 | 1 | 4 | Montreal, QC | Frontend developer responsible for building React and Next.js applications. | 62000 | hybrid | 2026-10-20 23:59:59 | 2026-09-11 10:30:00 |
| 3 | 2 | 5 | Toronto, ON | Junior data analyst working with Python, SQL and analytics tools. | 67000 | remote | 2026-10-25 23:59:59 | 2026-09-12 13:00:00 |
| 4 | 2 | 5 | Toronto, ON | Machine learning intern helping develop predictive models. | 48000 | remote | 2026-11-01 23:59:59 | 2026-09-13 11:00:00 |
| 5 | 3 | 5 | Montreal, QC | Software developer working on financial services APIs. | 72000 | on_site | 2026-10-30 23:59:59 | 2026-09-14 08:45:00 |
| 6 | 4 | 4 | Montreal, QC | Full-stack intern working with React, Node.js and PostgreSQL. | 45000 | hybrid | 2026-11-10 23:59:59 | 2026-09-15 12:00:00 |

### SkillOnJob

| id | skillId | jobId |
|---:|---:|---:|
| 1 | 2 | 1 |
| 2 | 4 | 1 |
| 3 | 5 | 1 |
| 4 | 12 | 1 |
| 5 | 13 | 1 |
| 6 | 1 | 2 |
| 7 | 2 | 2 |
| 8 | 3 | 2 |
| 9 | 15 | 2 |
| 10 | 7 | 3 |
| 11 | 14 | 3 |
| 12 | 5 | 3 |
| 13 | 7 | 4 |
| 14 | 11 | 4 |
| 15 | 14 | 4 |
| 16 | 6 | 5 |
| 17 | 5 | 5 |
| 18 | 13 | 5 |
| 19 | 1 | 6 |
| 20 | 3 | 6 |
| 21 | 4 | 6 |
| 22 | 5 | 6 |

### Resumes

| resumeId | userId | fileName | fileURL | createdAt |
|---:|---:|---|---|---|
| 1 | 1 | Alice_Chen_Backend_Resume.pdf | https://example.com/resumes/alice-backend.pdf | 2026-09-05 14:20:00 |
| 2 | 1 | Alice_Chen_General_Resume.pdf | https://example.com/resumes/alice-general.pdf | 2026-09-08 17:00:00 |
| 3 | 2 | Marc_Tremblay_Resume.pdf | https://example.com/resumes/marc.pdf | 2026-09-06 12:15:00 |
| 4 | 3 | Sophia_Patel_Data_Resume.pdf | https://example.com/resumes/sophia-data.pdf | 2026-09-07 16:45:00 |
| 5 | 3 | Sophia_Patel_ML_Resume.pdf | https://example.com/resumes/sophia-ml.pdf | 2026-09-09 10:30:00 |

### Applications

| applicationId | userId | jobId | resumeId | status | appliedAt |
|---:|---:|---:|---:|---|---|
| 1 | 1 | 1 | 1 | onhold | 2026-09-18 10:20:00 |
| 2 | 1 | 6 | 2 | accepted | 2026-09-19 13:45:00 |
| 3 | 2 | 2 | 3 | onhold | 2026-09-20 09:30:00 |
| 4 | 2 | 6 | 3 | rejected | 2026-09-21 15:00:00 |
| 5 | 3 | 3 | 4 | accepted | 2026-09-18 11:10:00 |
| 6 | 3 | 4 | 5 | onhold | 2026-09-22 16:20:00 |

### ApplicationStatusHistory

| id | applicationId | status | createdAt |
|---:|---:|---|---|
| 1 | 1 | onhold | 2026-09-18 10:20:00 |
| 2 | 2 | onhold | 2026-09-19 13:45:00 |
| 3 | 2 | accepted | 2026-09-24 09:00:00 |
| 4 | 3 | onhold | 2026-09-20 09:30:00 |
| 5 | 4 | onhold | 2026-09-21 15:00:00 |
| 6 | 4 | rejected | 2026-09-23 14:30:00 |
| 7 | 5 | onhold | 2026-09-18 11:10:00 |
| 8 | 5 | accepted | 2026-09-25 10:15:00 |
| 9 | 6 | onhold | 2026-09-22 16:20:00 |

### SavedJobs

| savedJobId | userId | jobId |
|---:|---:|---:|
| 1 | 1 | 3 |
| 2 | 1 | 5 |
| 3 | 2 | 1 |
| 4 | 2 | 5 |
| 5 | 3 | 1 |
| 6 | 3 | 4 |
| 7 | 3 | 6 |

### Notifications

| id | userId | type | message | read | createdAt |
|---:|---:|---|---|---|---|
| 1 | 1 | application_update | Your application for Full-Stack Intern has been accepted. | false | 2026-09-24 09:05:00 |
| 2 | 1 | deadline_reminder | Junior Backend Developer application deadline is approaching. | true | 2026-09-25 08:00:00 |
| 3 | 2 | application_update | Your application for Full-Stack Intern was not selected. | false | 2026-09-23 14:35:00 |
| 4 | 2 | deadline_reminder | Frontend Developer application deadline is October 20. | false | 2026-09-24 08:00:00 |
| 5 | 3 | application_update | Your application for Junior Data Analyst has been accepted. | false | 2026-09-25 10:20:00 |
| 6 | 3 | job_recommendation | A new Machine Learning Intern position matches your skills. | true | 2026-09-20 12:00:00 |
| 7 | 4 | new_application | Alice Chen applied for Junior Backend Developer. | false | 2026-09-18 10:21:00 |
| 8 | 4 | new_application | Marc Tremblay applied for Frontend Developer. | true | 2026-09-20 09:31:00 |

### Sessions

| id | userId | tokenHash | expiresAt | createdAt |
|---:|---:|---|---|---|
| 1 | 1 | `a3f1c281b7379016fd2640460d7779d234f9f57f379e61268bb27688d29584cf` | 2026-10-01 10:00:00 | 2026-09-24 10:00:00 |
| 2 | 2 | `b96d49716c25539469da13ab80481ecae5cc839c091cd7e92c8d584c39633d21` | 2026-10-02 11:00:00 | 2026-09-25 11:00:00 |
| 3 | 4 | `c5c36c952930dee812870b4c23f742a15a75e69135686fd99038e297e86b14ca` | 2026-10-03 09:00:00 | 2026-09-26 09:00:00 |

This dataset covers the main CareerConnect functionality—job seekers, recruiters, profiles, resumes, job postings, applications, application history, saved jobs, notifications, and skills—which aligns with the project scope. :chatgpt-content-reference{index="0"}

One schema detail to keep in mind while using the sample data: your `ApplicationStatus` enum currently only allows `onhold`, `rejected`, and `accepted`, so I kept all application/status-history records within those three values.
```
AI-Suggested Content: Sample data for our database table
Validation: Looked through it and as long as everything made sense for example having a string when it is a name or number if its id
Decision: Modified before use. I decided to not use hard coded id but incremental id from the database and my teammate suggested we actually hash our password instead of writing a fake hash
Reflection: AI quickly generated sample data for our project and was useful so we saved time on making new ideas.
Responsible Person: Qian Yun Chen

# Sprint 2 Log
## #1
Task ID/Title: giving me ideas for test function creation
Purpose of AI Use: wanted to brainstorm the tests i would have to write 
Chat Link or Prompt/Response: 
Prompt
```
import { Router } from 'express';
import { companyController } from '../controllers/CompanyController.js';
import { authMiddleware } from '../middleware/AuthMiddleware.js';

export const companyRoutes = Router();

//NOTE - routes without needing auth
companyRoutes.get(
    '/',
    companyController.getAll.bind(companyController),
);

companyRoutes.get(
    '/:companyId',
    companyController.getById.bind(companyController),
);

//NOTE - routes needing auth
companyRoutes.post(
    '/',
    authMiddleware,
    companyController.create.bind(companyController),
);

companyRoutes.put(
    '/:companyId',
    authMiddleware,
    companyController.update.bind(companyController),
);

companyRoutes.delete(
    '/:companyId',
    authMiddleware,
    companyController.delete.bind(companyController),
);




here is my current routes for my company API backend, give me suggestions for test cases.
```

response
```
Your route structure gives you a good set of API tests. For the Company API, I would test these cases.
| Endpoint | Test case | Expected result |
|---|---|---|
| `GET /api/companies` | Companies exist | `200`, returns array of companies |
| `GET /api/companies` | No companies exist | `200`, returns empty array |
| `GET /api/companies/:companyId` | Valid existing ID | `200`, returns correct company |
| `GET /api/companies/:companyId` | Valid non-existing ID | `404` |
| `GET /api/companies/:companyId` | Invalid ID such as `abc` | `400` |
| `GET /api/companies/:companyId` | Invalid numeric ID such as `0` or `-1` | `400` |
| `POST /api/companies` | Authenticated user + valid body | `201`, company created |
| `POST /api/companies` | No authentication token | `401` |
| `POST /api/companies` | Missing required name | `400` |
| `POST /api/companies` | Empty/whitespace-only name | `400` |
| `POST /api/companies` | Name exceeds DB limit | `400` |
| `POST /api/companies` | Description exceeds DB limit | `400` |
| `PUT /api/companies/:companyId` | Authenticated + valid update | `200`, values updated |
| `PUT /api/companies/:companyId` | Company does not exist | `404` |
| `PUT /api/companies/:companyId` | No authentication | `401` |
| `PUT /api/companies/:companyId` | Invalid body | `400` |
| `DELETE /api/companies/:companyId` | Authenticated + existing company | `204` |
| `DELETE /api/companies/:companyId` | Company not found | `404` |
| `DELETE /api/companies/:companyId` | No authentication | `401` |
| `DELETE /api/companies/:companyId` | Company referenced by jobs | likely `409`, depending on your service design |
```
AI-Suggested Content: AI proposed tests I should write
Validation: Manual review of the tests suggested and what we should test
Decision: Modified before use, I decided to put some of the tests together
Reflection: AI is pretty good at suggesting tests
Responsible Person: Yun Chen Qian
