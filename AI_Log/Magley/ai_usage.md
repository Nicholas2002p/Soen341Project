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
    Task ID/Title: Google Sign-In - Google client ID and backend connection (/api/auth/google)
    Purpose of AI Use: Coding, debugging and testing
    AI-Suggested Content: steps to create the Google OAuth client ID in Google Cloud, a POST /api/auth/google
    route (AuthRoutes, AuthController.googleLogin, AuthService.loginWithGoogle), a GoogleTokenVerifier with
    an IGoogleTokenVerifier interface wired in container.ts, GoogleOAuthProvider in main.jsx, env variables,
    local PostgreSQL setup, and 3 unit tests using a FakeGoogleTokenVerifier
    Validation: manual review, TypeScript check (0 problems), npm test (58/58 tests pass)
    Decision: Modified before use
    Reflection: Useful to understand how the auth flow goes through routes, controllers, services and the
    container. I adapted the code to our project (sessionToken, backend on port 3000), removed the Google
    button from Login since the UI is another teammate's task, and fixed the existing AuthService test
Log 2:
    Task ID/Title: Google Sign-In - review fixes (PR #88, Sprint 1)
    Purpose of AI Use: Coding and debugging
    AI-Suggested Content: guidance to connect the Google button to the login page, fix the logout, and move the
    profile creation to the server after the code review
    Validation: manual testing, npm test (all tests pass), peer review on PR #88
    Decision: Modified before use
    Reflection: The reviews from my team led to most of the final changes.
    Responsible Person: Magley Pierre

Log 3:
    Task ID/Title: Resume upload, list and preview - frontend (PR #100, #111, #115, Sprint 2)
    Purpose of AI Use: Coding
    AI-Suggested Content: guidance to call the existing resume API from the frontend and to display a PDF in
    the page
    Validation: manual testing in the browser, CI checks, peer review on each PR
    Decision: Modified before use (changed twice after the team's feedback: toggle, then preview)
    Reflection: Clarifying the requirement with the team was the most important step.
    Responsible Person: Magley Pierre

Log 4:
    Task ID/Title: Environment setup and documentation
    Purpose of AI Use: Troubleshooting and documentation
    AI-Suggested Content: help setting up PostgreSQL, HTTPS and Supabase on a new laptop, and drafts of PR
    descriptions
    Validation: the app runs locally; I rewrote the texts in my own words
    Decision: Modified before use
    Reflection: Useful for setup problems; the content of my PRs and logs comes from my own work.
    Responsible Person: Magley Pierre