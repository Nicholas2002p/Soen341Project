# Contribution Log

## Overview

This document summarizes the Sprint 3 development contributions completed by **Chen**, primarily focused on implementing saved-job functionality, improving the database seed data, and deploying the CareerConnect application to Render.

The work contributed directly to CareerConnect's job-seeker functionality by allowing authenticated users to save and manage job postings, while also improving the development and demonstration environment through additional seed data and a publicly accessible deployed version of the application.

**Total Time Spent: [8 Hours]**

## Contributions

### 1. Implemented Saved Jobs Backend API

- **Time Spent:** [3 Hour]
- **Pull Request:** [#121 – Saved Jobs](https://github.com/Nicholas2002p/Soen341Project/pull/121)
- **Description:**
  - Implemented the backend Saved Jobs functionality using the project's layered architecture.
  - Added `ISavedJobRepository` and `ISavedJobService` interfaces.
  - Implemented `SavedJobService` to manage saved-job business logic.
  - Implemented `PrismaSavedJobRepository` to persist saved jobs using Prisma and PostgreSQL.
  - Added `SavedJobController` and `SavedJobRoutes`.
  - Integrated the Saved Jobs service and repository into the application's dependency container.
  - Registered the Saved Jobs routes with the Express application.
  - Added authenticated endpoints for:
    - Retrieving all jobs saved by the current user through `GET /api/saved-jobs`.
    - Saving a job through `POST /api/saved-jobs/:jobId`.
    - Removing a saved job through `DELETE /api/saved-jobs/:jobId`.
  - Added validation to ensure a job exists before it can be saved.
  - Added duplicate checking to prevent the same user from saving the same job more than once.
  - Returned complete job-summary information for saved jobs, including company and skill information.
  - Added API tests for the Saved Jobs functionality.

### 2. Expanded Database Seed Data

- **Time Spent:** [1 hour]
- **Pull Request:** [#124 – Added More Seeding Data for Jobs](https://github.com/Nicholas2002p/Soen341Project/pull/124)
- **Description:**
  - Added more seeding data since our previous data has expired deadlines

### 3. Deployed CareerConnect to Render

- **Time Spent:** [4 hours]
- **Description:**
  - Deployed the CareerConnect application using Render so the project could be accessed through a hosted environment instead of requiring only local development.
  - Configured the application for deployment using the project's production environment settings.
  - Connected the deployed application to the required backend and database services.
  - Configured environment variables required by the application in the Render environment.
  - Verified that the deployed application could start successfully and communicate with its backend services.
  - Helped provide the team with a publicly accessible version of CareerConnect for testing, demonstrations, and Sprint evaluation.
  - Troubleshot deployment-related configuration differences between the local development environment and the hosted Render environment.
  - Hosted our database on Supabase and use Supabase database for our deployed app

## Repository Activity

[Issues assigned to Chen](https://github.com/Nicholas2002p/Soen341Project/issues?q=is%3Aissue+assignee%3Apmflf)

[Pull Requests by Chen](https://github.com/Nicholas2002p/Soen341Project/pulls?q=is%3Apr+author%3Apmflf)

[Commits by Chen on Sprint 3](https://github.com/Nicholas2002p/Soen341Project/commits/sprint-3/?author=pmflf)

### Major Sprint 3 Pull Requests

- [#121 – Saved Jobs](https://github.com/Nicholas2002p/Soen341Project/pull/121)
- [#124 – Added More Seeding Data for Jobs](https://github.com/Nicholas2002p/Soen341Project/pull/124)

## Summary

| Contribution | Time Spent |
|---|---:|
| Saved Jobs backend API implementation and testing | [3 hours] |
| Expanded database seed data | [1 hours] |
| Render deployment and configuration | [4 hours] |
| **Total** | **[8 hours]** |