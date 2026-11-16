# Contribution Log

## Overview

This document summarizes the Sprint 2 development contributions completed by **Chen**, primarily focused on backend support for company data, job searching and filtering, and recruiter job-posting management.

The work contributed directly to CareerConnect's Job Search and Job Listing functionality and allows the implementation of the Recruiter Dashboard and Posting Management functionality required for Sprint 2.

**Total Time Spent: 12 hours**

## Contributions

### 1. Implemented Company API

- **Time Spent:** 3 hours
- **Pull Request:** [#96 – Company API](https://github.com/Nicholas2002p/Soen341Project/pull/96)
- **Description:**
  - Implemented the backend Company API used to support company information associated with job postings.
  - Added company domain entities, repository and service interfaces, service implementation, Prisma repository, controller, and routes.
  - Added endpoints for retrieving company records.
  - Integrated the Company API into the application's dependency container and Express application.
  - Added API tests for company operations and validation.

### 2. Implemented Job Search and Job Listing API

- **Time Spent:** 6 hours
- **Issue:** [#33 – Implement API for creating and managing job postings](https://github.com/Nicholas2002p/Soen341Project/issues/33)
- **Related Issue:** [#89 – Update the job schema](https://github.com/Nicholas2002p/Soen341Project/issues/89)
- **Pull Request:** [#104 – Job API](https://github.com/Nicholas2002p/Soen341Project/pull/104)
- **Description:**
  - Implemented the backend Job API using the project's layered architecture.
  - Added the `Job` domain entity and job repository/service interfaces.
  - Implemented `PrismaJobRepository`, `JobService`, `JobController`, and Job routes.
  - Added an endpoint for retrieving all job listings.
  - Added job searching and filtering by:
    - Keyword
    - Location
    - Category
  - Implemented keyword searching across job titles, descriptions, company names, and required skills.
  - Added an endpoint for retrieving detailed information for an individual job posting.
  - Updated the Prisma Job schema to support job categories, longer titles, detailed descriptions, and required application deadlines.
  - Added and applied Prisma migrations for the Job schema changes.
  - Updated database seed data to conform to the new Job schema.
  - Added extensive Job API tests for successful requests, filtering, invalid IDs, missing jobs, and invalid query parameters.

### 3. Extended Job API for Recruiter Posting Management

- **Time Spent:** 3
- **Pull Request:** [#106 – Job API New Routes](https://github.com/Nicholas2002p/Soen341Project/pull/106)
- **Description:**
  - Extended the Job API to support recruiter job-posting management.
  - Added an endpoint for retrieving currently available jobs based on application deadlines.
  - Added an endpoint for retrieving expired job postings.
  - Added an authenticated endpoint allowing recruiters to retrieve only the jobs they have posted.
  - Added authenticated job creation through `POST /api/jobs`.
  - Added job updating through `PUT /api/jobs/:jobId`.
  - Added job deletion through `DELETE /api/jobs/:jobId`.
  - Added recruiter authorization checks to prevent job seekers from managing job postings.
  - Added ownership checks so recruiters can only update or delete their own postings.
  - Ensured recruiter identity is taken from the authenticated session instead of being supplied by the client.
  - Added validation for job creation and update request bodies, including employment type, salary, deadline, and required fields.
  - Refactored Prisma job-summary mapping to reduce duplicated repository logic.
  - Added API tests for:
    - Available jobs
    - Expired jobs
    - Recruiter's own postings
    - Authenticated job creation
    - Job updates
    - Job deletion
    - Authentication failures
    - Invalid request data
    - Invalid and missing job IDs

## Repository Activity

[Issues assigned to pmflf](https://github.com/Nicholas2002p/Soen341Project/issues?q=is%3Aissue+assignee%3Apmflf)

[Pull Requests by pmflf](https://github.com/Nicholas2002p/Soen341Project/pulls?q=is%3Apr+author%3Apmflf)

[Commits by pmflf on Sprint 2](https://github.com/Nicholas2002p/Soen341Project/commits/sprint-2/?author=pmflf)

### Major Sprint 2 Pull Requests

- [#96 – Company API](https://github.com/Nicholas2002p/Soen341Project/pull/96)
- [#104 – Job API](https://github.com/Nicholas2002p/Soen341Project/pull/104)
- [#106 – Job API New Routes](https://github.com/Nicholas2002p/Soen341Project/pull/106)

## Summary

| Contribution | Time Spent |
|---|---:|
| Company API implementation and testing | 3 hours |
| Job Search and Job Listing API | 6 hours |
| Recruiter job-posting management and additional Job API routes | 3 hours |
| **Total** | **12 hours** |
