import assert from 'node:assert/strict';
import { once } from 'node:events';
import type { Server } from 'node:http';
import test from 'node:test';
import { app } from '../../src/app.js';
import { prisma } from '../../src/infrastructure/prisma/prisma.js';

interface ResumeResponse {
    id: number;
    fileName: string;
    fileType: string;
    storageKey?: string;
}

let server: Server;
let baseUrl: string;

async function request(path: string, options?: RequestInit): Promise<Response> {
    return fetch(`${baseUrl}${path}`, options);
}

// Register a temporary user and return its session token
async function registerUser(email: string): Promise<string> {
    const response = await request('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'X-Forwarded-Proto': 'https' },
        body: JSON.stringify({ email, password: 'CorrectHorseBatteryStaple1!' }),
    });

    assert.equal(response.status, 201);
    const body = (await response.json()) as { sessionToken: string };
    return body.sessionToken;
}

// Build a multipart form with a file in the "resume" field
function resumeForm(content: string, fileName: string, type: string): FormData {
    const form = new FormData();
    form.append('resume', new Blob([content], { type }), fileName);
    return form;
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

test('resume lifecycle works through the HTTP API, database and file storage', async () => {
    const ownerEmail = `resume-owner-${Date.now()}@example.com`;
    const otherEmail = `resume-other-${Date.now()}@example.com`;
    const pdf = '%PDF-1.4 integration test resume';

    try {
        const ownerToken = await registerUser(ownerEmail);
        const otherToken = await registerUser(otherEmail);
        const ownerAuth = { Authorization: `Bearer ${ownerToken}` };

        // Upload a valid PDF resume.
        const uploadResponse = await request('/api/resumes', {
            method: 'POST',
            headers: ownerAuth,
            body: resumeForm(pdf, 'Jane Doe CV.pdf', 'application/pdf'),
        });

        assert.equal(uploadResponse.status, 201);
        const { resume } = (await uploadResponse.json()) as { resume: ResumeResponse };
        assert.equal(resume.fileName, 'Jane Doe CV.pdf');
        assert.equal(resume.fileType, 'pdf');
        assert.equal('storageKey' in resume, false);

        // A text file is rejected even when it is named .pdf.
        const invalidResponse = await request('/api/resumes', {
            method: 'POST',
            headers: ownerAuth,
            body: resumeForm('not a pdf', 'fake.pdf', 'application/pdf'),
        });

        assert.equal(invalidResponse.status, 400);

        // A request without a file is rejected.
        const missingFileResponse = await request('/api/resumes', {
            method: 'POST',
            headers: ownerAuth,
            body: new FormData(),
        });

        assert.equal(missingFileResponse.status, 400);

        // The uploaded resume appears in the owner's list.
        const listResponse = await request('/api/resumes', { headers: ownerAuth });

        assert.equal(listResponse.status, 200);
        const { resumes } = (await listResponse.json()) as { resumes: ResumeResponse[] };
        assert.deepEqual(resumes.map((listed) => listed.id), [resume.id]);

        // The owner can download the exact file that was uploaded.
        const downloadResponse = await request(`/api/resumes/${resume.id}/file`, { headers: ownerAuth });

        assert.equal(downloadResponse.status, 200);
        assert.equal(downloadResponse.headers.get('content-type'), 'application/pdf');
        assert.equal(await downloadResponse.text(), pdf);

        // Another user cannot see, download or delete the resume.
        const otherAuth = { Authorization: `Bearer ${otherToken}` };
        const otherListResponse = await request('/api/resumes', { headers: otherAuth });
        const otherList = (await otherListResponse.json()) as { resumes: ResumeResponse[] };
        assert.equal(otherList.resumes.length, 0);

        const otherDownloadResponse = await request(`/api/resumes/${resume.id}/file`, { headers: otherAuth });
        assert.equal(otherDownloadResponse.status, 404);

        const otherDeleteResponse = await request(`/api/resumes/${resume.id}`, { method: 'DELETE', headers: otherAuth });
        assert.equal(otherDeleteResponse.status, 404);

        // The owner deletes the resume and it is gone.
        const deleteResponse = await request(`/api/resumes/${resume.id}`, { method: 'DELETE', headers: ownerAuth });
        assert.equal(deleteResponse.status, 204);

        const deletedDownloadResponse = await request(`/api/resumes/${resume.id}/file`, { headers: ownerAuth });
        assert.equal(deletedDownloadResponse.status, 404);
    } finally {
        // Remove the temporary users and any resumes left behind, even if an assertion fails.
        const users = await prisma.user.findMany({ where: { email: { in: [ownerEmail, otherEmail] } } });
        const userIds = users.map((user) => user.userId);

        await prisma.resume.deleteMany({ where: { userId: { in: userIds } } });
        await prisma.salt.deleteMany({ where: { userId: { in: userIds } } });
        await prisma.user.deleteMany({ where: { userId: { in: userIds } } });
    }
});
