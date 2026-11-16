Template:
    Task ID/Title: A short description of the task.
    Purpose of AI Use: Why AI was used ( brainstorming, requirements analysis, coding, debugging,
    testing, documentation, review).
    Chat Link or Prompt/Response: Link to the conversation or the full prompt and AI response.
    AI-Suggested Content: Summary of what the AI proposed or generated.
    Validation: How the output was verified (e.g., manual review, testing, peer review, static analysis,
    CI/CD checks, comparison with requirements).
    Decision: Indicate whether the AI output was:
    - Accepted
    - Modified before use
    - Rejected
    Reflection: Briefly describe what was learned from the interaction and whether the AI assistance was
    useful.
    Responsible Person: Team member who conducted the interaction and completed the task

Log 1:
    Task ID/Title: Local setup for Sprint 3 (Gemini key, test database)
    Purpose of AI Use: Debugging
    Chat Link or Prompt/Response: Prompt: the integration tests fail with a Prisma error after switching
    branches. Response: the local database is out of date, run prisma migrate reset then prisma generate.
    AI-Suggested Content: steps to create the Gemini API key and to reset the local database when the
    integration tests failed
    Validation: all server tests pass locally
    Decision: Accepted
    Reflection: Useful to find the cause quickly; the key is kept in .env and never committed.
    Responsible Person: Magley Pierre