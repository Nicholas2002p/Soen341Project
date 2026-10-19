import assert from 'node:assert/strict';
import { once } from 'node:events';
import type { Server } from 'node:http';
import test from 'node:test';

import { app } from '../../src/app.js';
import { prisma } from '../../src/infrastructure/prisma/prisma.js';

console.log('\n=== tests/api/JobApi.test.ts ===');

let server: Server;
let baseUrl: string;

let recruiterId: number;
let companyId: number;
let backendJobId: number;
let dataJobId: number;

async function request(path: string, options?: RequestInit): Promise<Response> {
    return fetch(`${baseUrl}${path}`, options);
}

//NOTE - setting up for testing
test.before(async () => {
    server = app.listen(0);
    await once(server, 'listening');

    const address = server.address();
    assert(address && typeof address !== 'string');

    baseUrl = `http://127.0.0.1:${address.port}`;

    const recruiter = await prisma.user.create({
        data: {
            email: `job-api-recruiter-${Date.now()}@example.com`,
            password: '$2b$10$abcdefghijklmnopqrstuuabcdefghijklmnopqrstuv',
            role: 'recruiter',
        },
    });

    recruiterId = recruiter.userId;

    const company = await prisma.company.create({
        data: {
            name: `Job API Company ${Date.now()}`,
            description: 'Company created for job API tests.',
        },
    });

    companyId = company.companyId;

    const backendJob = await prisma.job.create({
        data: {
            companyId,
            recruiterId,
            title: 'Backend Developer API Test',
            category: 'Software Development',
            location: 'Montreal, QC',
            description: 'Backend development using Node.js, TypeScript and PostgreSQL.',
            salary: 70000,
            employmentType: 'hybrid',
            deadline: new Date('2030-10-01T23:59:59Z'),
        },
    });

    backendJobId = backendJob.jobId;

    const dataJob = await prisma.job.create({
        data: {
            companyId,
            recruiterId,
            title: 'Data Analyst API Test',
            category: 'Data & Analytics',
            location: 'Toronto, ON',
            description: 'Data analysis using SQL and Python.',
            salary: 68000,
            employmentType: 'remote',
            deadline: new Date('2030-11-01T23:59:59Z'),
        },
    });

    dataJobId = dataJob.jobId;
});

test.after(async () => {
    await prisma.skillOnJob.deleteMany({
        where: {
            jobId: {
                in: [backendJobId, dataJobId],
            },
        },
    });

    await prisma.savedJob.deleteMany({
        where: {
            jobId: {
                in: [backendJobId, dataJobId],
            },
        },
    });

    await prisma.applicationStatusHistory.deleteMany({
        where: {
            application: {
                jobId: {
                    in: [backendJobId, dataJobId],
                },
            },
        },
    });

    await prisma.application.deleteMany({
        where: {
            jobId: {
                in: [backendJobId, dataJobId],
            },
        },
    });

    await prisma.job.deleteMany({
        where: {
            jobId: {
                in: [backendJobId, dataJobId],
            },
        },
    });

    await prisma.company.deleteMany({
        where: {
            companyId,
        },
    });

    await prisma.session.deleteMany({
        where: {
            userId: recruiterId,
        },
    });

    await prisma.salt.deleteMany({
        where: {
            userId: recruiterId,
        },
    });

    await prisma.profile.deleteMany({
        where: {
            userId: recruiterId,
        },
    });

    await prisma.user.deleteMany({
        where: {
            userId: recruiterId,
        },
    });

    server.close();
    await once(server, 'close');

    await prisma.$disconnect();
});

test('GET /api/jobs returns jobs', async () => {
    const response = await request('/api/jobs');

    assert.equal(response.status, 200);

    const body = (await response.json()) as {
        jobs: Array<{
            jobId: number;
            title: string;
            category: string;
            location: string | null;
        }>;
    };

    assert.ok(Array.isArray(body.jobs));

    const backendJob = body.jobs.find((job) => job.jobId === backendJobId);
    const dataJob = body.jobs.find((job) => job.jobId === dataJobId);

    assert.ok(backendJob);
    assert.ok(dataJob);

    assert.equal(backendJob.title, 'Backend Developer API Test');
    assert.equal(dataJob.title, 'Data Analyst API Test');
});

test('GET /api/jobs filters jobs by keyword', async () => {
    const response = await request('/api/jobs?keyword=Backend');

    assert.equal(response.status, 200);

    const body = (await response.json()) as {
        jobs: Array<{
            jobId: number;
            title: string;
        }>;
    };

    const backendJob = body.jobs.find((job) => job.jobId === backendJobId);
    const dataJob = body.jobs.find((job) => job.jobId === dataJobId);

    assert.ok(backendJob);
    assert.equal(dataJob, undefined);
});

test('GET /api/jobs keyword search is case insensitive', async () => {
    const response = await request('/api/jobs?keyword=backend');

    assert.equal(response.status, 200);

    const body = (await response.json()) as {
        jobs: Array<{
            jobId: number;
        }>;
    };

    assert.ok(body.jobs.some((job) => job.jobId === backendJobId));
});

test('GET /api/jobs filters jobs by location', async () => {
    const response = await request('/api/jobs?location=Montreal');

    assert.equal(response.status, 200);

    const body = (await response.json()) as {
        jobs: Array<{
            jobId: number;
            location: string | null;
        }>;
    };

    assert.ok(body.jobs.some((job) => job.jobId === backendJobId));
    assert.equal(body.jobs.some((job) => job.jobId === dataJobId), false);
});

test('GET /api/jobs filters jobs by category', async () => {
    const response = await request('/api/jobs?category=Data%20%26%20Analytics');

    assert.equal(response.status, 200);

    const body = (await response.json()) as {
        jobs: Array<{
            jobId: number;
            category: string;
        }>;
    };

    assert.ok(body.jobs.some((job) => job.jobId === dataJobId));
    assert.equal(body.jobs.some((job) => job.jobId === backendJobId), false);
});

test('GET /api/jobs supports combined filters', async () => {
    const response = await request('/api/jobs?keyword=Backend&location=Montreal&category=Software%20Development');

    assert.equal(response.status, 200);

    const body = (await response.json()) as {
        jobs: Array<{
            jobId: number;
        }>;
    };

    assert.ok(body.jobs.some((job) => job.jobId === backendJobId));
    assert.equal(body.jobs.some((job) => job.jobId === dataJobId), false);
});

test('GET /api/jobs returns an empty array when no jobs match', async () => {
    const response = await request('/api/jobs?keyword=DefinitelyDoesNotExist');

    assert.equal(response.status, 200);

    const body = (await response.json()) as {
        jobs: Array<{
            jobId: number;
        }>;
    };

    assert.deepEqual(body.jobs, []);
});

test('GET /api/jobs/:jobId returns full job details', async () => {
    const response = await request(`/api/jobs/${backendJobId}`);

    assert.equal(response.status, 200);

    const body = (await response.json()) as {
        job: {
            jobId: number;
            recruiterId: number;
            title: string;
            category: string;
            location: string | null;
            description: string | null;
            salary: number;
            employmentType: string;
            company: {
                companyId: number;
                name: string;
                description: string | null;
            };
            skills: string[];
        };
    };

    assert.equal(body.job.jobId, backendJobId);
    assert.equal(body.job.recruiterId, recruiterId);
    assert.equal(body.job.title, 'Backend Developer API Test');
    assert.equal(body.job.category, 'Software Development');
    assert.equal(body.job.location, 'Montreal, QC');
    assert.equal(body.job.description, 'Backend development using Node.js, TypeScript and PostgreSQL.');
    assert.equal(body.job.salary, 70000);
    assert.equal(body.job.employmentType, 'hybrid');

    assert.equal(body.job.company.companyId, companyId);
    assert.ok(body.job.company.name.startsWith('Job API Company'));

    assert.ok(Array.isArray(body.job.skills));
});

test('GET /api/jobs/:jobId rejects an invalid job id', async () => {
    const response = await request('/api/jobs/not-a-number');

    assert.equal(response.status, 400);

    assert.deepEqual(await response.json(), {
        message: 'A valid job id is required.',
    });
});

test('GET /api/jobs/:jobId rejects zero as a job id', async () => {
    const response = await request('/api/jobs/0');

    assert.equal(response.status, 400);

    assert.deepEqual(await response.json(), {
        message: 'A valid job id is required.',
    });
});

test('GET /api/jobs/:jobId rejects a negative job id', async () => {
    const response = await request('/api/jobs/-1');

    assert.equal(response.status, 400);

    assert.deepEqual(await response.json(), {
        message: 'A valid job id is required.',
    });
});

test('GET /api/jobs/:jobId returns 404 when job does not exist', async () => {
    const response = await request('/api/jobs/2147483647');

    assert.equal(response.status, 404);

    assert.deepEqual(await response.json(), {
        message: 'Job not found.',
    });
});

test('GET /api/jobs rejects rejects repeated keyword query parameters', async () => {
    const response = await request('/api/jobs?keyword=test&keyword=another');

    assert.equal(response.status, 400);

    assert.deepEqual(await response.json(), {
        message: 'keyword, location, and category must be text values.',
    });
});