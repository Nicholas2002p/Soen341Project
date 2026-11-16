# Contribution Log 

---

## Sprint 1

**Commits:** https://github.com/Nicholas2002p/Soen341Project/commits/sprint-1/?author=A-Hareth

**Pull Requests:** https://github.com/Nicholas2002p/Soen341Project/pull/72

**Issues:** https://github.com/Nicholas2002p/Soen341Project/issues?q=is%3Aissue+assignee%3AA-Hareth+label%3A%22Sprint+1%22

### Activities
- **Resume file storage design:** files stored on the server under random names, outside public access, behind an `IFileStorage` interface so cloud storage can be added later (#12, PR #72) (1.5 hrs)
- **Resume API:** upload, list, download and delete resumes; only PDF, DOC and DOCX accepted (checked by file content, not just extension); 5 MB limit; resumes used in an application cannot be deleted (#13, PR #72) (5 hrs)
- **Testing:** unit, API and integration tests for the full upload/list/download/delete flow (2 hrs)
- **Review fixes:** answering reviewer questions on file signatures and MIME types, adding sources and fixing the DOCX check (1.5 hrs)

**Total: 10 hrs**

---

## Sprint 2

**Commits:** https://github.com/Nicholas2002p/Soen341Project/commits/sprint-2/?author=A-Hareth

**Pull Requests:** https://github.com/Nicholas2002p/Soen341Project/pulls?q=is%3Apr+author%3AA-Hareth+created%3A2026-10-01..2026-10-31

**Issues:** https://github.com/Nicholas2002p/Soen341Project/issues?q=is%3Aissue+assignee%3AA-Hareth+label%3A%22Sprint+2%22

### Activities
- **Application API:** apply to a job, view and withdraw applications, recruiter sees the applicants of their job (#37, PR #98) (3 hrs)
- **Application status updates:** recruiter moves applicants through Applied → Under_Review → Interview → Offered/Rejected; statuses only move forward and every change is saved in the history (#21, PR #98) (2 hrs)
- **Application history:** job seeker sees all their applications with the full status history, filterable by status (#49, PR #102) (1.5 hrs)
- **History by job:** application history for one job with `?jobId=` for the frontend (PR #110) (1 hr)
- **Resume info in applications:** resume file name included in application responses for the frontend (PR #114) (1 hr)
- **Testing:** unit, API and integration tests for all of the above (1 hr)
- **Review fixes:** addressing review comments and resolving merge conflicts on my PRs (1.5 hrs)
- **Code reviews:** #93 (HTTPS; found the migration order bug and the account deletion crash), #96 (Company API), #99, #100 (tested the resume frontend against the API) (3 hrs)

**Total: 14 hrs**

---

## Sprint 3

**Commits:** https://github.com/Nicholas2002p/Soen341Project/commits/sprint-3/?author=A-Hareth

**Pull Requests:** https://github.com/Nicholas2002p/Soen341Project/pulls?q=is%3Apr+author%3AA-Hareth+label%3A%22Sprint+3%22

**Issues:** https://github.com/Nicholas2002p/Soen341Project/issues?q=is%3Aissue+assignee%3AA-Hareth+label%3A%22Sprint+3%22

### Activities
- **Application analytics API:** job seeker dashboard data with total and pending applications, count per status, interview rate and applications submitted per week; recruiters are refused access (#41, PR #122) (3.5 hrs)
- **Job archive API:** recruiters archive and unarchive their own job postings; archived jobs are hidden from search, no longer accept applications, and are listed in the recruiter's archived jobs (#131, PR #130) (4 hrs)
- **Resume download API:** the recruiter who posted the job can download the resume an applicant submitted; other users get 404 (#158, PR #156) (2.5 hrs)
- **Testing:** unit and API tests for all of the above (2.5 hrs)
- **Review fixes:** addressing review comments and answering reviewer questions on my PRs (1.5 hrs)
- **Code review:** #155 (applications return the public user and resume; tested it together with the resume download route) (1 hr)
- **Planning:** writing acceptance tests and setting up my task issues (1 hr)

**Total: 16 hrs**
