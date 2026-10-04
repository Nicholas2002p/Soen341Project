import assert from 'node:assert/strict';
import { once } from 'node:events';
import type { Server } from 'node:http';
import test from 'node:test';
import { app } from '../../src/app.js';
import { prisma } from '../../src/infrastructure/prisma/prisma.js';

interface ApplicationResponse {
    id: number;
    userId: number;
    jobId: number;
    status: string;
    job?: { id: number; companyName: string };
    statusHistory?: { status: string }[];
}

let server: Server;
let baseUrl: string;

async function request(path: string, options?: RequestInit): Promise<Response> {
    return fetch(`${baseUrl}${path}`, options);
}

// Register a temporary user and return its id and session token
async function registerUser(email: string): Promise<{ id: number; token: string }> {
    const response = await request('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'X-Forwarded-Proto': 'https' },
        body: JSON.stringify({ email, password: 'CorrectHorseBatteryStaple1!' }),
    });

    assert.equal(response.status, 201);
    const body = (await response.json()) as { user: { id: number }; sessionToken: string };
    return { id: body.user.id, token: body.sessionToken };
}

function auth(token: string, json = false): Record<string, string> {
    return json
        ? { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }
        : { Authorization: `Bearer ${token}` };
}

test.before(async () => {
    // Start the real Express app on an ephemeral port.
    server = app.listen(0);
    await once(server, 'listening');

    const address = server.address();
    assert(address && typeof address !== 'string');
    baseUrl = `http://127.0.0.1:${address.port}`;
});

test.after(async () => {
    // Close the server and database connection after the integration test.
    server.close();
    await once(server, 'close');
    await prisma.$disconnect();
});

test('application lifecycle works through the HTTP API and database', async () => {
    const suffix = Date.now();
    const emails = [`app-seeker-${suffix}@example.com`, `app-other-${suffix}@example.com`, `app-recruiter-${suffix}@example.com`];
    let companyId: number | undefined;

    try {
        const seeker = await registerUser(emails[0]!);
        const otherSeeker = await registerUser(emails[1]!);
        const recruiter = await registerUser(emails[2]!);

        // Registration always creates job seekers for now, so the recruiter role is set directly
        await prisma.user.update({ where: { userId: recruiter.id }, data: { role: 'recruiter' } });

        // There is no job API yet, so the company and job are created directly
        const company = await prisma.company.create({ data: { name: `Test Company ${suffix}` } });
        companyId = company.companyId;
        const job = await prisma.job.create({
            data: { companyId, recruiterId: recruiter.id, salary: 60000, employmentType: 'hybrid', location: 'Montreal, QC' },
        });
        const resume = await prisma.resume.create({
            data: { userId: seeker.id, fileName: 'cv.pdf', fileURL: `integration-${suffix}.pdf` },
        });

        // The job seeker applies with their resume.
        const applyResponse = await request('/api/applications', {
            method: 'POST',
            headers: auth(seeker.token, true),
            body: JSON.stringify({ jobId: job.jobId, resumeId: resume.resumeId }),
        });

        assert.equal(applyResponse.status, 201);
        const { application } = (await applyResponse.json()) as { application: ApplicationResponse };
        assert.equal(application.status, 'onhold');

        // Applying twice to the same job is rejected.
        const duplicateResponse = await request('/api/applications', {
            method: 'POST',
            headers: auth(seeker.token, true),
            body: JSON.stringify({ jobId: job.jobId, resumeId: resume.resumeId }),
        });
        assert.equal(duplicateResponse.status, 409);

        // A request with ids that are not numbers is rejected.
        const invalidResponse = await request('/api/applications', {
            method: 'POST',
            headers: auth(seeker.token, true),
            body: JSON.stringify({ jobId: 'abc' }),
        });
        assert.equal(invalidResponse.status, 400);

        // Another job seeker cannot apply with someone else's resume.
        const otherResumeResponse = await request('/api/applications', {
            method: 'POST',
            headers: auth(otherSeeker.token, true),
            body: JSON.stringify({ jobId: job.jobId, resumeId: resume.resumeId }),
        });
        assert.equal(otherResumeResponse.status, 404);

        // A recruiter cannot apply to jobs.
        const recruiterApplyResponse = await request('/api/applications', {
            method: 'POST',
            headers: auth(recruiter.token, true),
            body: JSON.stringify({ jobId: job.jobId, resumeId: resume.resumeId }),
        });
        assert.equal(recruiterApplyResponse.status, 403);

        // The application appears in the job seeker's list with its job information.
        const listResponse = await request('/api/applications', { headers: auth(seeker.token) });
        const { applications } = (await listResponse.json()) as { applications: ApplicationResponse[] };
        assert.deepEqual(applications.map((listed) => listed.id), [application.id]);
        assert.equal(applications[0]?.job?.companyName, company.name);

        // The applicant and the recruiter can see the application and its status history.
        for (const token of [seeker.token, recruiter.token]) {
            const detailResponse = await request(`/api/applications/${application.id}`, { headers: auth(token) });
            assert.equal(detailResponse.status, 200);
            const detail = (await detailResponse.json()) as { application: ApplicationResponse };
            assert.deepEqual(detail.application.statusHistory?.map((entry) => entry.status), ['onhold']);
        }

        // Another job seeker cannot see or withdraw it.
        const otherDetailResponse = await request(`/api/applications/${application.id}`, { headers: auth(otherSeeker.token) });
        assert.equal(otherDetailResponse.status, 404);
        const otherWithdrawResponse = await request(`/api/applications/${application.id}`, { method: 'DELETE', headers: auth(otherSeeker.token) });
        assert.equal(otherWithdrawResponse.status, 404);

        // The recruiter sees the application in the job's list, other users are refused.
        const jobListResponse = await request(`/api/applications/jobs/${job.jobId}`, { headers: auth(recruiter.token) });
        assert.equal(jobListResponse.status, 200);
        const jobList = (await jobListResponse.json()) as { applications: ApplicationResponse[] };
        assert.deepEqual(jobList.applications.map((listed) => listed.id), [application.id]);

        const seekerJobListResponse = await request(`/api/applications/jobs/${job.jobId}`, { headers: auth(seeker.token) });
        assert.equal(seekerJobListResponse.status, 403);

        // An invalid id in the URL is rejected with a clear message.
        const invalidIdResponse = await request('/api/applications/abc', { headers: auth(seeker.token) });
        assert.equal(invalidIdResponse.status, 400);
        assert.deepEqual(await invalidIdResponse.json(), { message: 'The id must be a positive integer.' });

        // The job seeker withdraws the application and it is gone, along with its history.
        const withdrawResponse = await request(`/api/applications/${application.id}`, { method: 'DELETE', headers: auth(seeker.token) });
        assert.equal(withdrawResponse.status, 204);

        const goneResponse = await request(`/api/applications/${application.id}`, { headers: auth(seeker.token) });
        assert.equal(goneResponse.status, 404);
        assert.equal(await prisma.applicationStatusHistory.count({ where: { applicationId: application.id } }), 0);
    } finally {
        // Remove everything the test created, even if an assertion fails.
        const users = await prisma.user.findMany({ where: { email: { in: emails } } });
        const userIds = users.map((user) => user.userId);
        const jobs = companyId ? await prisma.job.findMany({ where: { companyId } }) : [];
        const jobIds = jobs.map((job) => job.jobId);

        await prisma.applicationStatusHistory.deleteMany({ where: { application: { jobId: { in: jobIds } } } });
        await prisma.application.deleteMany({ where: { OR: [{ jobId: { in: jobIds } }, { userId: { in: userIds } }] } });
        await prisma.resume.deleteMany({ where: { userId: { in: userIds } } });
        await prisma.job.deleteMany({ where: { jobId: { in: jobIds } } });
        if (companyId) {
            await prisma.company.delete({ where: { companyId } });
        }
        await prisma.profile.deleteMany({ where: { userId: { in: userIds } } });
        await prisma.session.deleteMany({ where: { userId: { in: userIds } } });
        await prisma.salt.deleteMany({ where: { userId: { in: userIds } } });
        await prisma.user.deleteMany({ where: { userId: { in: userIds } } });
    }
});
