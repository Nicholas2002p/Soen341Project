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
let recruiterToken: string;
let companyId: number;
let backendJobId: number;
let dataJobId: number;
let otherCompanyId: number;
let expiredJobId: number;
let createdJobId: number | undefined;

async function request(path: string, options?: RequestInit): Promise<Response> {
    return fetch(`${baseUrl}${path}`, options);
}

async function createAuthenticatedRecruiter(): Promise<{
    id: number;
    token: string;
}> {
    const response = await request('/api/auth/register', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-Forwarded-Proto': 'https',
        },
        body: JSON.stringify({
            email: `job-api-recruiter-${Date.now()}@example.com`,
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

    await prisma.user.update({
        where: {
            userId: body.user.id,
        },
        data: {
            role: 'recruiter',
        },
    });

    return {
        id: body.user.id,
        token: body.sessionToken,
    };
}

function auth(token: string, json = false): Record<string, string> {
    return json
        ? {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
        }
        : {
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

    const recruiter = await createAuthenticatedRecruiter();

    recruiterId = recruiter.id;
    recruiterToken = recruiter.token;

    const company = await prisma.company.create({
        data: {
            name: `Job API Company ${Date.now()}`,
            description: 'Company created for job API tests.',
        },
    });

    companyId = company.companyId;

    const otherCompany = await prisma.company.create({
        data: {
            name: `Other Job API Company ${Date.now()}`,
        },
    });

    otherCompanyId = otherCompany.companyId;

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

    const expiredJob = await prisma.job.create({
        data: {
            companyId,
            recruiterId,
            title: 'Expired Developer API Test',
            category: 'Software Development',
            location: 'Montreal, QC',
            description: 'Expired job used for API testing.',
            salary: 50000,
            employmentType: 'on_site',
            deadline: new Date('2020-01-01T23:59:59Z'),
        },
    });

    expiredJobId = expiredJob.jobId;
});

test.after(async () => {
    const jobIds = [
        backendJobId,
        dataJobId,
        expiredJobId,
        ...(createdJobId ? [createdJobId] : []),
    ];

    await prisma.skillOnJob.deleteMany({
        where: {
            jobId: {
                in: jobIds,
            },
        },
    });

    await prisma.savedJob.deleteMany({
        where: {
            jobId: {
                in: jobIds,
            },
        },
    });

    await prisma.applicationStatusHistory.deleteMany({
        where: {
            application: {
                jobId: {
                    in: jobIds,
                },
            },
        },
    });

    await prisma.application.deleteMany({
        where: {
            jobId: {
                in: jobIds,
            },
        },
    });

    await prisma.job.deleteMany({
        where: {
            jobId: {
                in: jobIds,
            },
        },
    });

    await prisma.company.deleteMany({
        where: {
            companyId: {
                in: [companyId, otherCompanyId],
            },
        },
    });

    await prisma.profile.deleteMany({
        where: {
            userId: recruiterId,
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

    await prisma.user.deleteMany({
        where: {
            userId: recruiterId,
        },
    });

    server.close();
    await once(server, 'close');

    await prisma.$disconnect();
});

//NOTE - GET tests

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

test('GET /api/jobs/available returns only jobs that have not expired', async () => {
    const response = await request('/api/jobs/available');

    assert.equal(response.status, 200);

    const body = (await response.json()) as {
        jobs: Array<{
            jobId: number;
        }>;
    };

    assert.ok(body.jobs.some((job) => job.jobId === backendJobId));
    assert.ok(body.jobs.some((job) => job.jobId === dataJobId));
    assert.equal(body.jobs.some((job) => job.jobId === expiredJobId), false);
});

test('GET /api/jobs/expired returns only expired jobs', async () => {
    const response = await request('/api/jobs/expired');

    assert.equal(response.status, 200);

    const body = (await response.json()) as {
        jobs: Array<{
            jobId: number;
        }>;
    };

    assert.ok(body.jobs.some((job) => job.jobId === expiredJobId));
    assert.equal(body.jobs.some((job) => job.jobId === backendJobId), false);
    assert.equal(body.jobs.some((job) => job.jobId === dataJobId), false);
});

test('GET /api/jobs/mine rejects unauthenticated requests', async () => {
    const response = await request('/api/jobs/mine');

    assert.equal(response.status, 401);

    assert.deepEqual(await response.json(), {
        message: 'Authentication required',
    });
});

test('GET /api/jobs/mine returns jobs posted by the authenticated recruiter', async () => {
    const response = await request('/api/jobs/mine', {
        headers: auth(recruiterToken),
    });

    assert.equal(response.status, 200);

    const body = (await response.json()) as {
        jobs: Array<{
            jobId: number;
        }>;
    };

    assert.ok(body.jobs.some((job) => job.jobId === backendJobId));
    assert.ok(body.jobs.some((job) => job.jobId === dataJobId));
    assert.ok(body.jobs.some((job) => job.jobId === expiredJobId));
});

test('GET /api/jobs filters available jobs', async () => {
    const response = await request('/api/jobs?available=true');

    assert.equal(response.status, 200);

    const body = (await response.json()) as {
        jobs: Array<{
            jobId: number;
        }>;
    };

    assert.ok(body.jobs.some((job) => job.jobId === backendJobId));
    assert.ok(body.jobs.some((job) => job.jobId === dataJobId));
    assert.equal(body.jobs.some((job) => job.jobId === expiredJobId), false);
});

test('GET /api/jobs filters expired jobs', async () => {
    const response = await request('/api/jobs?available=false');

    assert.equal(response.status, 200);

    const body = (await response.json()) as {
        jobs: Array<{
            jobId: number;
        }>;
    };

    assert.ok(body.jobs.some((job) => job.jobId === expiredJobId));
    assert.equal(body.jobs.some((job) => job.jobId === backendJobId), false);
    assert.equal(body.jobs.some((job) => job.jobId === dataJobId), false);
});

test('GET /api/jobs combines available filter with other search filters', async () => {
    const response = await request(
        '/api/jobs?keyword=Backend&location=Montreal&available=true',
    );

    assert.equal(response.status, 200);

    const body = (await response.json()) as {
        jobs: Array<{
            jobId: number;
        }>;
    };

    assert.ok(body.jobs.some((job) => job.jobId === backendJobId));
    assert.equal(body.jobs.some((job) => job.jobId === dataJobId), false);
    assert.equal(body.jobs.some((job) => job.jobId === expiredJobId), false);
});

test('GET /api/jobs rejects invalid available filter', async () => {
    const response = await request('/api/jobs?available=yes');

    assert.equal(response.status, 400);

    assert.deepEqual(await response.json(), {
        message: 'available must be true or false.',
    });
});


//NOTE - POST Tests
test('POST /api/jobs allows a recruiter to create a job', async () => {
    const response = await request('/api/jobs', {
        method: 'POST',
        headers: auth(recruiterToken, true),
        body: JSON.stringify({
            companyId,
            title: 'New Backend Developer API Test',
            category: 'Software Development',
            location: 'Montreal, QC',
            description: 'Created through the POST endpoint.',
            salary: 80000,
            employmentType: 'hybrid',
            deadline: '2031-12-31T23:59:59Z',
        }),
    });

    assert.equal(response.status, 201);

    const body = (await response.json()) as {
        job: {
            jobId: number;
            recruiterId: number;
            title: string;
            company: {
                companyId: number;
            };
        };
    };

    createdJobId = body.job.jobId;

    assert.equal(body.job.recruiterId, recruiterId);
    assert.equal(body.job.title, 'New Backend Developer API Test');
    assert.equal(body.job.company.companyId, companyId);
});

test('POST /api/jobs rejects unauthenticated requests', async () => {
    const response = await request('/api/jobs', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            companyId,
            title: 'Unauthorized Job',
            category: 'Software Development',
            salary: 70000,
            employmentType: 'remote',
            deadline: '2031-12-31T23:59:59Z',
        }),
    });

    assert.equal(response.status, 401);
});

test('POST /api/jobs rejects invalid job data', async () => {
    const response = await request('/api/jobs', {
        method: 'POST',
        headers: auth(recruiterToken, true),
        body: JSON.stringify({
            companyId,
            title: '',
            category: 'Software Development',
            salary: -100,
            employmentType: 'invalid',
            deadline: 'not-a-date',
        }),
    });

    assert.equal(response.status, 400);
});



//NOTE - PUT tests
test('PUT /api/jobs/:jobId allows a recruiter to update their own job', async () => {
    assert.ok(createdJobId);

    const response = await request(`/api/jobs/${createdJobId}`, {
        method: 'PUT',
        headers: auth(recruiterToken, true),
        body: JSON.stringify({
            title: 'Updated Backend Developer API Test',
            category: 'Software Development',
            location: 'Toronto, ON',
            description: 'Updated through the PUT endpoint.',
            salary: 90000,
            employmentType: 'remote',
            deadline: '2032-01-31T23:59:59Z',
        }),
    });

    assert.equal(response.status, 200);

    const body = (await response.json()) as {
        job: {
            jobId: number;
            recruiterId: number;
            title: string;
            salary: number;
            employmentType: string;
            company: {
                companyId: number;
            };
        };
    };

    assert.equal(body.job.jobId, createdJobId);
    assert.equal(body.job.title, 'Updated Backend Developer API Test');
    assert.equal(body.job.salary, 90000);
    assert.equal(body.job.employmentType, 'remote');

    assert.equal(body.job.recruiterId, recruiterId);
    assert.equal(body.job.company.companyId, companyId);
});

test('PUT /api/jobs/:jobId rejects an invalid job id', async () => {
    const response = await request('/api/jobs/not-a-number', {
        method: 'PUT',
        headers: auth(recruiterToken, true),
        body: JSON.stringify({
            title: 'Updated Job',
            category: 'Software Development',
            location: 'Montreal, QC',
            description: 'Updated description.',
            salary: 80000,
            employmentType: 'hybrid',
            deadline: '2032-12-31T23:59:59Z',
        }),
    });

    assert.equal(response.status, 400);
});



//NOTE - DELETE tests
test('DELETE /api/jobs/:jobId rejects unauthenticated requests', async () => {
    assert.ok(createdJobId);

    const response = await request(`/api/jobs/${createdJobId}`, {
        method: 'DELETE',
    });

    assert.equal(response.status, 401);
});

test('DELETE /api/jobs/:jobId returns 404 when the job does not exist', async () => {
    const response = await request('/api/jobs/2147483647', {
        method: 'DELETE',
        headers: auth(recruiterToken),
    });

    assert.equal(response.status, 404);
});

test('DELETE /api/jobs/:jobId allows the recruiter to delete their own job', async () => {
    assert.ok(createdJobId);

    const response = await request(`/api/jobs/${createdJobId}`, {
        method: 'DELETE',
        headers: auth(recruiterToken),
    });

    assert.equal(response.status, 204);

    const job = await prisma.job.findUnique({
        where: {
            jobId: createdJobId,
        },
    });

    assert.equal(job, null);

    createdJobId = undefined;
});