import assert from 'node:assert/strict';
import { once } from 'node:events';
import type { Server } from 'node:http';
import test from 'node:test';

import { app } from '../../src/app.js';
import { prisma } from '../../src/infrastructure/prisma/prisma.js';

console.log('\n=== tests/api/JobArchiveApi.test.ts ===');

let server: Server;
let baseUrl: string;

const suffix = Date.now();
const emails = [`archive-recruiter-${suffix}@example.com`, `archive-other-${suffix}@example.com`, `archive-seeker-${suffix}@example.com`];
const jobTitle = `Archive Test Developer ${suffix}`;

let recruiter: { id: number; token: string };
let otherRecruiter: { id: number; token: string };
let seeker: { id: number; token: string };
let companyId: number;
let jobId: number;
let resumeId: number;

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

function archive(token: string, id: number | string, body: unknown): Promise<Response> {
    return request(`/api/jobs/${id}/archive`, { method: 'PATCH', headers: auth(token, true), body: JSON.stringify(body) });
}

// Ids of the jobs returned by a job list route
async function jobIds(response: Response): Promise<number[]> {
    assert.equal(response.status, 200);
    const body = (await response.json()) as { jobs: { jobId: number }[] };
    return body.jobs.map((listed) => listed.jobId);
}

test.before(async () => {
    server = app.listen(0);
    await once(server, 'listening');

    const address = server.address();
    assert(address && typeof address !== 'string');
    baseUrl = `http://127.0.0.1:${address.port}`;

    recruiter = await registerUser(emails[0]!, 'recruiter');
    otherRecruiter = await registerUser(emails[1]!, 'recruiter');
    seeker = await registerUser(emails[2]!);

    const company = await prisma.company.create({ data: { name: `Archive Company ${suffix}` } });
    companyId = company.companyId;

    const job = await prisma.job.create({
        data: {
            companyId,
            recruiterId: recruiter.id,
            title: jobTitle,
            category: 'Software Development',
            location: 'Montreal, QC',
            salary: 60000,
            employmentType: 'hybrid',
            deadline: new Date('2030-12-31T23:59:59Z'),
        },
    });
    jobId = job.jobId;

    const resume = await prisma.resume.create({ data: { userId: seeker.id, fileName: 'cv.pdf', fileURL: `archive-${suffix}.pdf` } });
    resumeId = resume.resumeId;
});

test.after(async () => {
    // Remove everything the tests created
    const users = await prisma.user.findMany({ where: { email: { in: emails } } });
    const userIds = users.map((user) => user.userId);

    await prisma.applicationStatusHistory.deleteMany({ where: { application: { jobId } } });
    await prisma.application.deleteMany({ where: { jobId } });
    await prisma.resume.deleteMany({ where: { userId: { in: userIds } } });
    await prisma.job.deleteMany({ where: { companyId } });
    await prisma.company.deleteMany({ where: { companyId } });
    await prisma.profile.deleteMany({ where: { userId: { in: userIds } } });
    await prisma.session.deleteMany({ where: { userId: { in: userIds } } });
    await prisma.salt.deleteMany({ where: { userId: { in: userIds } } });
    await prisma.user.deleteMany({ where: { userId: { in: userIds } } });

    server.close();
    await once(server, 'close');
    await prisma.$disconnect();
});

test('archive routes reject requests without a bearer token', async () => {
    const archivedResponse = await request('/api/jobs/archived');
    assert.equal(archivedResponse.status, 401);

    const archiveResponse = await request(`/api/jobs/${jobId}/archive`, { method: 'PATCH' });
    assert.equal(archiveResponse.status, 401);
});

test('PATCH /api/jobs/:jobId/archive rejects an invalid body or job id', async () => {
    assert.equal((await archive(recruiter.token, jobId, { archive: 'yes' })).status, 400);
    assert.equal((await archive(recruiter.token, jobId, {})).status, 400);
    assert.equal((await archive(recruiter.token, 'abc', { archive: true })).status, 400);
});

test('PATCH /api/jobs/:jobId/archive returns 404 when the job does not exist', async () => {
    assert.equal((await archive(recruiter.token, 999999999, { archive: true })).status, 404);
});

test('PATCH /api/jobs/:jobId/archive only lets the recruiter who posted the job change it', async () => {
    assert.equal((await archive(otherRecruiter.token, jobId, { archive: true })).status, 403);
    assert.equal((await archive(seeker.token, jobId, { archive: true })).status, 403);
});

test('GET /api/jobs/archived rejects job seekers', async () => {
    const response = await request('/api/jobs/archived', { headers: auth(seeker.token) });
    assert.equal(response.status, 403);
});

test('an archived job is hidden from job seekers and cannot be applied to, until it is unarchived', async () => {
    const search = `/api/jobs?keyword=${encodeURIComponent(jobTitle)}`;

    // Before archiving, the job shows up in search and not in the archived list
    assert.deepEqual(await jobIds(await request(search)), [jobId]);
    assert.deepEqual(await jobIds(await request('/api/jobs/archived', { headers: auth(recruiter.token) })), []);

    // The recruiter archives the job
    const archiveResponse = await archive(recruiter.token, jobId, { archive: true });
    assert.equal(archiveResponse.status, 200);
    const { job } = (await archiveResponse.json()) as { job: { jobId: number; archive: boolean } };
    assert.equal(job.archive, true);

    // It is now in the recruiter's archived list, and hidden from search and the available jobs
    assert.deepEqual(await jobIds(await request('/api/jobs/archived', { headers: auth(recruiter.token) })), [jobId]);
    assert.deepEqual(await jobIds(await request(search)), []);
    assert.ok(!(await jobIds(await request('/api/jobs/available'))).includes(jobId));

    // Another recruiter does not see it in their archived list
    assert.deepEqual(await jobIds(await request('/api/jobs/archived', { headers: auth(otherRecruiter.token) })), []);

    // Job seekers can no longer apply to it
    const applyResponse = await request('/api/applications', {
        method: 'POST',
        headers: auth(seeker.token, true),
        body: JSON.stringify({ jobId, resumeId }),
    });
    assert.equal(applyResponse.status, 400);
    assert.deepEqual(await applyResponse.json(), { message: 'This job is no longer accepting applications.' });

    // The recruiter unarchives the job and it is back in search
    const unarchiveResponse = await archive(recruiter.token, jobId, { archive: false });
    assert.equal(unarchiveResponse.status, 200);
    assert.deepEqual(await jobIds(await request(search)), [jobId]);
    assert.deepEqual(await jobIds(await request('/api/jobs/archived', { headers: auth(recruiter.token) })), []);
});
