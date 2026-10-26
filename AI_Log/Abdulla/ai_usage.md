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
