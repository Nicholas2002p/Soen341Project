## Sprint 1 – AI Usage Log

## Entry 1: Sourcing file signatures and MIME types (PR #72 review)

Task ID/Title: Task 3.2 (#13), respond to review comments on PR #72 about file signatures and MIME types

Purpose of AI Use: Research and documentation. A reviewer asked where the file signature codes in ResumeFile.ts came from and what the MIME_TYPES table does. I used AI to better understand both, find reliable sources, and help write my replies.

Chat Link or Prompt/Response: Claude (Anthropic), used through Claude Code. No shareable link, see Appendix A for the prompts and responses.

AI-Suggested Content:
- Explained that the signatures are "magic numbers" (the first bytes of a file type): 25 50 44 46 (%PDF), D0 CF 11 E0 (.doc), 50 4B 03 04 (ZIP, used by .docx), and that checking them stops renamed files from being accepted.
- Explained that MIME_TYPES maps each file type to the Content-Type header sent when a resume is downloaded, so the browser knows how to open it.
- Suggested sources: Wikipedia "List of file signatures", Gary Kessler's File Signatures table, and MDN "Common MIME types".

Validation:
- Opened each source and confirmed the three signatures appear on the Wikipedia and Gary Kessler pages, and the three MIME types appear on the MDN page.
- Nicholas reviewed the replies and the updated code and approved the PR.

Decision: Modified before use. I shortened the suggested replies before posting them, and the code change was reduced to source comments only.

Reflection: I learned that a file extension can't be trusted and that the first bytes of a file show its real type, and how Content-Type is used on downloads. The AI was useful for finding sources quickly, but I still had to to change the code. This also led to another reviewer (Chen) pointing out that the ZIP signature alone isn't enough for .docx, which we fixed later.

Responsible Person: Abdulla

## Appendix A: Prompts and responses

Prompt 1: "What are file signatures or ‘magic numbers,’ and how can checking signatures like 25 50 44 46, D0 CF 11 E0, and 50 4B 03 04 prevent users from uploading renamed or fake resume files?"
Response (summary): He explained to me what magic numbers are and how checking them prevents renamed or fake files from being accepted.

Prompt 2: “What is the purpose of a MIME_TYPES mapping when downloading resume files, and how does the Content-Type header help the browser correctly open PDF, DOC, and DOCX files?”
Response: He explained to me how MIME types tell the browser what type of file is being downloaded and how to handle it.

Prompt 3: “What reliable sources can I use to verify file signatures and MIME types for PDF, DOC, and DOCX files?
Response: He suggested reliable sources where I could verify file signatures and MIME types, such as Wikipedia, Gary Kessler’s File Signatures table, and MDN.






## Sprint 2 – AI Usage Log

## Entry 1: Implementation Planning for US-05 – Application Tracking

Task ID/Title: US-05 – Application Tracking

User Story:
"As a job seeker, I want to track my submitted applications so that I can monitor their progress."

Purpose of AI Use:
Implementation planning and guidance. I used AI to help break down the user story into smaller development steps and understand how to structure the feature before implementing it.

AI Tool Used: AI assistant.

Chat Link or Prompt/Response: See Appendix B for the reconstructed prompt and the AI response.

AI-Suggested Content

Store the current application status and maintain a separate history of status changes.

Define business rules controlling who can update application statuses and which transitions are allowed.

Create endpoints for recruiters to update statuses and job seekers to view their application progress.

Separate the business logic, database operations, and HTTP request handling into services, repositories, and controllers.

Test both individual business rules and the complete application tracking flow.

Validation

The suggestions were reviewed against the user story to identify the main components needed for implementation. The proposed structure served as a development guide rather than ready-to-use code.

Decision

Used as guidance. The AI response was used to organize the implementation approach and identify the necessary components. It was not directly copied as application code.

Reflection

The AI helped me understand how to approach a user story systematically instead of immediately starting to code.

I learned the importance of separating responsibilities between controllers, services, and repositories, as well as keeping a history of status changes to provide meaningful application tracking.

The response was particularly useful for identifying business rules and planning the testing process.

Responsible Person: Abdulla

## Appendix B – Sprint 2 Prompt and Response

Prompt 1 – Application Tracking Implementation Structure

Prompt:

For (Application Tracking), where a job seeker wants to track submitted applications and monitor their progress, can you give me a simple step-by-step structure to help me implement this feature? Explain the database, business rules, endpoints, and testing.

AI Response:

Application Tracking ("As a job seeker, I want to track my submitted applications so that I can monitor their progress"), explained as if guiding someone to build it:

1. Start with the data.
Each application needs a current status (Applied, Interview, Offered…). To show progress, you also need a history table: every time the status changes, you add a row with the new status and the date.

2. Decide the rules.

Who can change a status? Only the recruiter who posted the job.

Which changes make sense? Statuses only move forward, and Offered/Rejected are final.

Who can see it? Only the applicant and that recruiter.

3. Build the actions as endpoints.

Recruiter changes a status: check the rules, then update the status and add a history row together, so they never get out of sync.

Job seeker views their applications: return each one with its current status, and its history for the full picture.

4. Keep each part in its place.
The rules go in one place (the service), the database queries in another (the repository), and the request/response handling in a third (the controller). That way each part is simple and can be tested on its own.

5. Test it.
Test each rule on its own (e.g. "Rejected can't go back to Interview"), then the whole flow on a real database: apply → recruiter changes the status → job seeker sees the updated history.

In short: store the status and its history → define who can change it and how → expose it through endpoints → test the rules and the full flow.







## Sprint 3 – AI Usage Log

## Entry 1: Implementation Planning for Job Archiving

**Task ID/Title:** Job Archiving Feature

**Purpose of AI Use:**

Implementation planning and guidance. I used AI to help understand how to implement a job archiving feature without permanently deleting job postings. I wanted to break down the implementation into smaller steps and identify the changes needed in the database, business logic, endpoints, and testing.

**AI Tool Used:** AI assistant.

**Chat Link or Prompt/Response:** See Appendix C for the reconstructed prompt and the AI response.

**AI-Suggested Content:**

- Add an `archived` boolean field to jobs, with a default value of `false`.
- Update the job model to include the archived field.
- Define business rules so that only recruiters can archive or unarchive their own jobs.
- Exclude archived jobs from public listings and prevent job seekers from applying to them.
- Add database queries and endpoints to retrieve archived jobs and update their archived status.
- Test authorization rules and verify that archiving and unarchiving work correctly.

**Validation:**

The suggestions were reviewed to understand how the archiving feature should work across the different parts of the application. The proposed steps helped identify important requirements, such as restricting access to recruiters and making sure archived jobs are hidden from job seekers.

The AI response was used as implementation guidance rather than ready-to-use code.

**Decision:**

Used as guidance. The AI response helped organize the implementation steps and identify the necessary changes to the existing job management functionality. No AI-generated application code was directly copied from this response.

**Reflection:**

The AI helped me understand how to implement job archiving without deleting existing data.

I learned that adding a simple boolean field is not enough by itself, since the archived status also needs to be considered in database queries, authorization checks, and application submissions.

The response was useful for breaking the feature into manageable steps and identifying testing scenarios, especially making sure that only the job owner can archive or unarchive a posting.

**Responsible Person:** Abdulla

## Appendix C – Sprint 3 Prompt and Response

### Prompt 1 – Job Archiving Implementation Structure

**Prompt:**

For a Job Archiving feature, where recruiters should be able to archive and unarchive their job postings without permanently deleting them, can you give me a simple step-by-step structure to help me implement this feature? Explain the database changes, business rules, endpoints, and testing.

**AI Response:**

1. **Add the flag to the data.** Give a job an “archived” true/false field that starts as false, so existing jobs stay active.
2. **Teach the model about it.** Wherever the code describes what a job looks like, include the archived field so it travels with the job everywhere.
3. **Add the business rules.**
   - Only recruiters can archive or view archived jobs.
   - A recruiter can only archive or unarchive their own jobs.
   - If the job doesn’t exist, report “not found”.
   - Job seekers can’t apply to an archived job.
4. **Update the database queries.**
   - Public listings like search and expired jobs skip archived jobs.
   - Add one query to get a recruiter’s archived jobs and one to set the flag.
   - Every place that loads a job also returns the flag.
5. **Expose two endpoints.**
   - One to list the logged-in recruiter’s archived jobs.
   - One to set a job’s archived status to true or false.
   - Both require login and return clear errors: bad input, not logged in, not allowed, not found.
6. **Test it.**
   - Small tests for the rules (own jobs only, recruiters only, missing job).
   - One full-flow test: archive a job, check it’s gone from search and can’t be applied to, then unarchive it and check it’s back.

**The key idea:** archiving doesn’t delete anything. It’s a flag that every part of the app respects, so the recruiter keeps the job and its applications, and job seekers just stop seeing it.
