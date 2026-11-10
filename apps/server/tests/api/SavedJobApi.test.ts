import assert from 'node:assert/strict';
import { once } from 'node:events';
import type { Server } from 'node:http';
import test from 'node:test';

import { app } from '../../src/app.js';
import { prisma } from '../../src/infrastructure/prisma/prisma.js';

console.log('\n=== tests/api/SavedJobApi.test.ts ===');

let server: Server;
let baseUrl: string;

let userId: number;
let userToken: string;

let otherUserId: number;
let otherUserToken: string;

let recruiterId: number;
let companyId: number;
let firstJobId: number;
let secondJobId: number;

async function request(path: string, options?: RequestInit): Promise<Response> {
    return fetch(`${baseUrl}${path}`, options);
}

async function registerUser(email: string): Promise<{ id: number; token: string }> {
    const response = await request('/api/auth/register', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-Forwarded-Proto': 'https',
        },
        body: JSON.stringify({
            email,
            password: 'CorrectHorseBatteryStaple1!',
        }),
    });

    assert.equal(response.status, 201);

    const body = (await response.json()) as {
        user: {
            id: number;
        };
        sessionToken: string;
    };

    return {
        id: body.user.id,
        token: body.sessionToken,
    };
}

function auth(token: string): Record<string, string> {
    return {
        Authorization: `Bearer ${token}`,
    };
}

//NOTE - setting up for testing
test.before(async () => {
    server = app.listen(0);
    await once(server, 'listening');

    const address = server.address();
    assert(address && typeof address !== 'string');

    baseUrl = `http://127.0.0.1:${address.port}`;

    const suffix = Date.now();

    const user = await registerUser(`saved-job-user-${suffix}@example.com`);
    userId = user.id;
    userToken = user.token;

    const otherUser = await registerUser(`saved-job-other-${suffix}@example.com`);
    otherUserId = otherUser.id;
    otherUserToken = otherUser.token;

    const recruiter = await prisma.user.create({
        data: {
            email: `saved-job-recruiter-${suffix}@example.com`,
            password: '$2b$10$abcdefghijklmnopqrstuuabcdefghijklmnopqrstuv',
            role: 'recruiter',
        },
    });

    recruiterId = recruiter.userId;

    const company = await prisma.company.create({
        data: {
            name: `Saved Job Test Company ${suffix}`,
            description: 'Company created for saved job API tests.',
        },
    });

    companyId = company.companyId;

    const firstJob = await prisma.job.create({
        data: {
            companyId,
            recruiterId,
            title: 'Saved Backend Developer Test',
            category: 'Software Development',
            location: 'Montreal, QC',
            description: 'First job used for saved job API testing.',
            salary: 75000,
            employmentType: 'hybrid',
            deadline: new Date('2031-12-31T23:59:59Z'),
        },
    });

    firstJobId = firstJob.jobId;

    const secondJob = await prisma.job.create({
        data: {
            companyId,
            recruiterId,
            title: 'Saved Data Analyst Test',
            category: 'Data & Analytics',
            location: 'Toronto, ON',
            description: 'Second job used for saved job API testing.',
            salary: 70000,
            employmentType: 'remote',
            deadline: new Date('2031-12-31T23:59:59Z'),
        },
    });

    secondJobId = secondJob.jobId;
});

test.after(async () => {
    await prisma.savedJob.deleteMany({
        where: {
            OR: [
                {
                    userId: {
                        in: [userId, otherUserId],
                    },
                },
                {
                    jobId: {
                        in: [firstJobId, secondJobId],
                    },
                },
            ],
        },
    });

    await prisma.skillOnJob.deleteMany({
        where: {
            jobId: {
                in: [firstJobId, secondJobId],
            },
        },
    });

    await prisma.applicationStatusHistory.deleteMany({
        where: {
            application: {
                jobId: {
                    in: [firstJobId, secondJobId],
                },
            },
        },
    });

    await prisma.application.deleteMany({
        where: {
            jobId: {
                in: [firstJobId, secondJobId],
            },
        },
    });

    await prisma.job.deleteMany({
        where: {
            jobId: {
                in: [firstJobId, secondJobId],
            },
        },
    });

    await prisma.company.deleteMany({
        where: {
            companyId,
        },
    });

    const registeredUserIds = [userId, otherUserId];

    await prisma.profile.deleteMany({
        where: {
            userId: {
                in: registeredUserIds,
            },
        },
    });

    await prisma.session.deleteMany({
        where: {
            userId: {
                in: registeredUserIds,
            },
        },
    });

    await prisma.salt.deleteMany({
        where: {
            userId: {
                in: registeredUserIds,
            },
        },
    });

    await prisma.user.deleteMany({
        where: {
            userId: {
                in: [...registeredUserIds, recruiterId],
            },
        },
    });

    server.close();
    await once(server, 'close');

    await prisma.$disconnect();
});

test('GET /api/saved-jobs rejects unauthenticated requests', async () => {
    const response = await request('/api/saved-jobs');

    assert.equal(response.status, 401);

    assert.deepEqual(await response.json(), {
        message: 'Authentication required',
    });
});

test('POST /api/saved-jobs/:jobId rejects unauthenticated requests', async () => {
    const response = await request(`/api/saved-jobs/${firstJobId}`, {
        method: 'POST',
    });

    assert.equal(response.status, 401);
});

test('DELETE /api/saved-jobs/:jobId rejects unauthenticated requests', async () => {
    const response = await request(`/api/saved-jobs/${firstJobId}`, {
        method: 'DELETE',
    });

    assert.equal(response.status, 401);
});

test('GET /api/saved-jobs returns an empty list when the user has no saved jobs', async () => {
    const response = await request('/api/saved-jobs', {
        headers: auth(userToken),
    });

    assert.equal(response.status, 200);

    const body = (await response.json()) as {
        jobs: Array<{
            jobId: number;
        }>;
    };

    assert.deepEqual(body.jobs, []);
});

test('POST /api/saved-jobs/:jobId saves a job for the authenticated user', async () => {
    const response = await request(`/api/saved-jobs/${firstJobId}`, {
        method: 'POST',
        headers: auth(userToken),
    });

    assert.equal(response.status, 201);

    assert.deepEqual(await response.json(), {
        message: 'Job saved successfully.',
    });

    const savedJob = await prisma.savedJob.findUnique({
        where: {
            userId_jobId: {
                userId,
                jobId: firstJobId,
            },
        },
    });

    assert.ok(savedJob);
});

test('GET /api/saved-jobs returns jobs saved by the authenticated user', async () => {
    const response = await request('/api/saved-jobs', {
        headers: auth(userToken),
    });

    assert.equal(response.status, 200);

    const body = (await response.json()) as {
        jobs: Array<{
            jobId: number;
            title: string;
            category: string;
            location: string | null;
            salary: number;
            employmentType: string;
            company: {
                companyId: number;
                name: string;
            };
            skills: string[];
        }>;
    };

    const savedJob = body.jobs.find((job) => job.jobId === firstJobId);

    assert.ok(savedJob);
    assert.equal(savedJob.title, 'Saved Backend Developer Test');
    assert.equal(savedJob.category, 'Software Development');
    assert.equal(savedJob.location, 'Montreal, QC');
    assert.equal(savedJob.salary, 75000);
    assert.equal(savedJob.employmentType, 'hybrid');
    assert.equal(savedJob.company.companyId, companyId);
    assert.ok(Array.isArray(savedJob.skills));
});

test('POST /api/saved-jobs/:jobId rejects saving the same job twice', async () => {
    const response = await request(`/api/saved-jobs/${firstJobId}`, {
        method: 'POST',
        headers: auth(userToken),
    });

    assert.equal(response.status, 409);

    assert.deepEqual(await response.json(), {
        message: 'Job is already saved.',
    });
});

test('POST /api/saved-jobs/:jobId returns 404 when the job does not exist', async () => {
    const response = await request('/api/saved-jobs/2147483647', {
        method: 'POST',
        headers: auth(userToken),
    });

    assert.equal(response.status, 404);

    assert.deepEqual(await response.json(), {
        message: 'Job not found.',
    });
});

test('POST /api/saved-jobs/:jobId rejects an invalid job id', async () => {
    const response = await request('/api/saved-jobs/not-a-number', {
        method: 'POST',
        headers: auth(userToken),
    });

    assert.equal(response.status, 400);

    assert.deepEqual(await response.json(), {
        message: 'A valid job id is required.',
    });
});

test('saved jobs are private to each authenticated user', async () => {
    const response = await request('/api/saved-jobs', {
        headers: auth(otherUserToken),
    });

    assert.equal(response.status, 200);

    const body = (await response.json()) as {
        jobs: Array<{
            jobId: number;
        }>;
    };

    assert.equal(body.jobs.some((job) => job.jobId === firstJobId), false);
});

test('different users can save the same job', async () => {
    const response = await request(`/api/saved-jobs/${firstJobId}`, {
        method: 'POST',
        headers: auth(otherUserToken),
    });

    assert.equal(response.status, 201);

    const savedJob = await prisma.savedJob.findUnique({
        where: {
            userId_jobId: {
                userId: otherUserId,
                jobId: firstJobId,
            },
        },
    });

    assert.ok(savedJob);
});

test('authenticated user can save multiple jobs', async () => {
    const response = await request(`/api/saved-jobs/${secondJobId}`, {
        method: 'POST',
        headers: auth(userToken),
    });

    assert.equal(response.status, 201);

    const listResponse = await request('/api/saved-jobs', {
        headers: auth(userToken),
    });

    assert.equal(listResponse.status, 200);

    const body = (await listResponse.json()) as {
        jobs: Array<{
            jobId: number;
        }>;
    };

    assert.ok(body.jobs.some((job) => job.jobId === firstJobId));
    assert.ok(body.jobs.some((job) => job.jobId === secondJobId));
});

test('DELETE /api/saved-jobs/:jobId removes a saved job', async () => {
    const response = await request(`/api/saved-jobs/${firstJobId}`, {
        method: 'DELETE',
        headers: auth(userToken),
    });

    assert.equal(response.status, 204);

    const savedJob = await prisma.savedJob.findUnique({
        where: {
            userId_jobId: {
                userId,
                jobId: firstJobId,
            },
        },
    });

    assert.equal(savedJob, null);
});

test('DELETE /api/saved-jobs/:jobId only removes the authenticated user saved job', async () => {
    const otherUserSavedJob = await prisma.savedJob.findUnique({
        where: {
            userId_jobId: {
                userId: otherUserId,
                jobId: firstJobId,
            },
        },
    });

    assert.ok(otherUserSavedJob);
});

test('DELETE /api/saved-jobs/:jobId returns 404 when the job is not saved by the user', async () => {
    const response = await request(`/api/saved-jobs/${firstJobId}`, {
        method: 'DELETE',
        headers: auth(userToken),
    });

    assert.equal(response.status, 404);

    assert.deepEqual(await response.json(), {
        message: 'Saved job not found.',
    });
});

test('DELETE /api/saved-jobs/:jobId rejects an invalid job id', async () => {
    const response = await request('/api/saved-jobs/0', {
        method: 'DELETE',
        headers: auth(userToken),
    });

    assert.equal(response.status, 400);

    assert.deepEqual(await response.json(), {
        message: 'A valid job id is required.',
    });
});