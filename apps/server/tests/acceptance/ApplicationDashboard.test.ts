import assert from 'node:assert/strict';
import { once } from 'node:events';
import type { Server } from 'node:http';
import test from 'node:test';
import { app } from '../../src/app.js';
import { prisma } from '../../src/infrastructure/prisma/prisma.js';

// Acceptance test for the user story:
// "As a job seeker, I want a dashboard of my applications so I can track my progress."

interface AnalyticsResponse {
    total: number;
    pending: number;
    byStatus: Record<string, number>;
    interviewRate: number;
    submittedOverTime: { weekStart: string; count: number }[];
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
    // Close the server and database connection after the acceptance test.
    server.close();
    await once(server, 'close');
    await prisma.$disconnect();
});

test('a job seeker sees their status breakdown and applications per week on the dashboard', async () => {
    const suffix = Date.now();
    const emails = [`dashboard-seeker-${suffix}@example.com`, `dashboard-recruiter-${suffix}@example.com`];
    let companyId: number | undefined;

    try {
        // Given a job seeker who applied to three jobs, and a recruiter who invited them to one interview
        const seeker = await registerUser(emails[0]!);
        const recruiter = await registerUser(emails[1]!);
        await prisma.user.update({ where: { userId: recruiter.id }, data: { role: 'recruiter' } });

        const company = await prisma.company.create({ data: { name: `Dashboard Company ${suffix}` } });
        companyId = company.companyId;
        const resume = await prisma.resume.create({
            data: { userId: seeker.id, fileName: 'cv.pdf', fileURL: `dashboard-${suffix}.pdf` },
        });

        const applicationIds: number[] = [];
        for (const title of ['Junior Developer', 'QA Tester', 'Data Analyst']) {
            const job = await prisma.job.create({
                data: {
                    companyId,
                    recruiterId: recruiter.id,
                    title,
                    category: 'Software Development',
                    salary: 60000,
                    employmentType: 'hybrid',
                    deadline: new Date('2030-12-31T23:59:59Z'),
                },
            });

            const applyResponse = await request('/api/applications', {
                method: 'POST',
                headers: auth(seeker.token, true),
                body: JSON.stringify({ jobId: job.jobId, resumeId: resume.resumeId }),
            });
            assert.equal(applyResponse.status, 201);
            applicationIds.push(((await applyResponse.json()) as { application: { id: number } }).application.id);
        }

        const interviewResponse = await request(`/api/applications/${applicationIds[0]}/status`, {
            method: 'PATCH',
            headers: auth(recruiter.token, true),
            body: JSON.stringify({ status: 'Interview' }),
        });
        assert.equal(interviewResponse.status, 200);

        // When the job seeker opens their dashboard
        const response = await request('/api/applications/analytics', { headers: auth(seeker.token) });

        // Then they see 3 applications: 2 pending and 1 interview, and all 3 submitted this week
        assert.equal(response.status, 200);
        const { analytics } = (await response.json()) as { analytics: AnalyticsResponse };
        assert.equal(analytics.total, 3);
        assert.equal(analytics.pending, 2);
        assert.equal(analytics.byStatus.Applied, 2);
        assert.equal(analytics.byStatus.Interview, 1);
        assert.equal(analytics.byStatus.Rejected, 0);
        assert.equal(analytics.interviewRate, 0.33);
        assert.equal(analytics.submittedOverTime.length, 1);
        assert.equal(analytics.submittedOverTime[0]?.count, 3);

        // And a recruiter, who has no applications of their own, cannot open a job seeker dashboard
        const recruiterResponse = await request('/api/applications/analytics', { headers: auth(recruiter.token) });
        assert.equal(recruiterResponse.status, 403);
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
