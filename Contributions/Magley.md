# Contribution Log

All commits
- Sprint 1: https://github.com/Nicholas2002p/Soen341Project/commits/sprint-1/?author=mags-2121
- Sprint 2: https://github.com/Nicholas2002p/Soen341Project/commits/sprint-2/?author=mags-2121

All PRs
https://github.com/Nicholas2002p/Soen341Project/pulls?q=is%3Apr+author%3Amags-2121

Issues
https://github.com/Nicholas2002p/Soen341Project/issues?q=is%3Aissue+assignee%3Amags-2121

## Sprint 1
- Google sign-in backend: POST /api/auth/google route, AuthController, AuthService, GoogleTokenVerifier with its interface, wired in container.ts (PR #88) (5 hrs)
- Unit tests for Google sign-in with a fake token verifier, and fixed the existing AuthService test setup (PR #88) (1 hr)
- Google sign-in frontend: Google button on the login page, GoogleLogInApi, logout with Google and the backend logout, English error messages (PR #88) (2 hrs)
- Fixing review comments: profile created on the server for first-time Google users, checking the server response on logout, README section for the Google Client ID (PR #88) (3 hrs)
- AI usage log for Google sign-in (30 min)

Sprint 1 total: 11.5 hrs

## Sprint 2
- Resume frontend: upload, list, download and delete resumes on the Profile page, using the existing /api/resumes routes, testing and fixing review comments (PR #100) (2 hrs)
- Merged the HTTPS changes into my branch, fixed the conflicts and moved the resume calls to getApiUrl (PR #100) (1.5 hrs)
- Toggle to show or hide the resume list, after Nick's feedback (PR #111) (1 hr)
- Reusable ResumePreview component: click on a resume to see the actual CV under it, so it can be reused on the job application page, after clarifying the requirement with the team (PR #115) (1.5 hrs)
- Removed .DS_Store from the repo and added it to .gitignore, changed the PR base and fixed the conflict (PR #99) (30 min)
- Set up the project on a new laptop: PostgreSQL, HTTPS certificates, Supabase keys, migrations (2.5 hrs)
- Helped teammates debug: 409 on register, Google client ID origins and ports, toggle not showing after pull (1 hr)
- Testing sprint-2 after merges (pulling, running the app, checking that everything still works) (1 hr)
- Demo preparation (1 hr)
- Documentation: AI usage log and contribution log (1 hr)

Sprint 2 total: 13 hrs

Overall total: 24.5 hrs