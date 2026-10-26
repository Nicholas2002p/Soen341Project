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
