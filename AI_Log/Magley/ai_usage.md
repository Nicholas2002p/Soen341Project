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
