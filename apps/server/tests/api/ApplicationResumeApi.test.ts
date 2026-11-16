import assert from 'node:assert/strict';
import { once } from 'node:events';
import type { Server } from 'node:http';
import test from 'node:test';
import { app } from '../../src/app.js';
import { prisma } from '../../src/infrastructure/prisma/prisma.js';

console.log('\n=== tests/api/ApplicationResumeApi.test.ts ===');

let server: Server;
let baseUrl: string;

async function request(path: string, options?: RequestInit): Promise<Response> {
    return fetch(`${baseUrl}${path}`, options);
}

// Register a temporary user and return its id and session token
async function registerUser(email: string, role?: 'recruiter'): Promise<{ id: number; token: string }> {
    const response = await request('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'X-Forwarded-Proto': 'https' },
        body: JSON.stringify({ email, password: 'CorrectHorseBatteryStaple1!' }),
    });

    assert.equal(response.status, 201);
    const body = (await response.json()) as { user: { id: number }; sessionToken: string };

    if (role) {
        await prisma.user.update({ where: { userId: body.user.id }, data: { role } });
    }

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
    server.close();
    await once(server, 'close');
    await prisma.$disconnect();
});

test('GET /api/applications/:id/resume rejects requests without a bearer token', async () => {
    const response = await request('/api/applications/1/resume');

    assert.equal(response.status, 401);
});

test('the recruiter of a job can download the resume submitted with an application', async () => {
    const suffix = Date.now();
    const emails = [`resume-seeker-${suffix}@example.com`, `resume-recruiter-${suffix}@example.com`, `resume-other-${suffix}@example.com`];
    let companyId: number | undefined;
    let resumeId: number | undefined;
    let seekerToken: string | undefined;

    try {
        const seeker = await registerUser(emails[0]!);
        const recruiter = await registerUser(emails[1]!, 'recruiter');
        const otherRecruiter = await registerUser(emails[2]!, 'recruiter');
        seekerToken = seeker.token;

        const company = await prisma.company.create({ data: { name: `Resume Company ${suffix}` } });
        companyId = company.companyId;
        const job = await prisma.job.create({
            data: {
                companyId,
                recruiterId: recruiter.id,
                title: 'Junior Developer',
                category: 'Software Development',
                salary: 60000,
                employmentType: 'hybrid',
                deadline: new Date('2030-12-31T23:59:59Z'),
            },
        });

        // The job seeker uploads a resume and applies with it
        const pdf = '%PDF-1.4 resume submitted with an application';
        const form = new FormData();
        form.append('resume', new Blob([pdf], { type: 'application/pdf' }), 'Jane Doe CV.pdf');
        const uploadResponse = await request('/api/resumes', { method: 'POST', headers: auth(seeker.token), body: form });
        assert.equal(uploadResponse.status, 201);
        resumeId = ((await uploadResponse.json()) as { resume: { id: number } }).resume.id;

        const applyResponse = await request('/api/applications', {
            method: 'POST',
            headers: auth(seeker.token, true),
            body: JSON.stringify({ jobId: job.jobId, resumeId }),
        });
        assert.equal(applyResponse.status, 201);
        const applicationId = ((await applyResponse.json()) as { application: { id: number } }).application.id;

        // The recruiter who posted the job downloads the resume with its original name
        const recruiterResponse = await request(`/api/applications/${applicationId}/resume`, { headers: auth(recruiter.token) });
        assert.equal(recruiterResponse.status, 200);
        assert.equal(recruiterResponse.headers.get('content-type'), 'application/pdf');
        assert.match(recruiterResponse.headers.get('content-disposition') ?? '', /Jane Doe CV\.pdf/);
        assert.equal(await recruiterResponse.text(), pdf);

        // The applicant can download it too
        const seekerResponse = await request(`/api/applications/${applicationId}/resume`, { headers: auth(seeker.token) });
        assert.equal(seekerResponse.status, 200);
        assert.equal(await seekerResponse.text(), pdf);

        // A recruiter who did not post the job cannot see it
        const otherResponse = await request(`/api/applications/${applicationId}/resume`, { headers: auth(otherRecruiter.token) });
        assert.equal(otherResponse.status, 404);

        // Unknown and invalid application ids are rejected
        const missingResponse = await request('/api/applications/999999999/resume', { headers: auth(recruiter.token) });
        assert.equal(missingResponse.status, 404);
        const invalidResponse = await request('/api/applications/abc/resume', { headers: auth(recruiter.token) });
        assert.equal(invalidResponse.status, 400);
    } finally {
        // Remove everything the test created, even if an assertion fails.
        const users = await prisma.user.findMany({ where: { email: { in: emails } } });
        const userIds = users.map((user) => user.userId);
        const jobs = companyId ? await prisma.job.findMany({ where: { companyId } }) : [];
        const jobIds = jobs.map((job) => job.jobId);

        await prisma.applicationStatusHistory.deleteMany({ where: { application: { jobId: { in: jobIds } } } });
        await prisma.application.deleteMany({ where: { OR: [{ jobId: { in: jobIds } }, { userId: { in: userIds } }] } });

        // Deleting the resume through the API also removes the stored file
        if (resumeId && seekerToken) {
            await request(`/api/resumes/${resumeId}`, { method: 'DELETE', headers: auth(seekerToken) });
        }

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
