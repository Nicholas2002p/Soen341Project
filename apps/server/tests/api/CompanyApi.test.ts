import assert from 'node:assert/strict';
import { once } from 'node:events';
import type { Server } from 'node:http';
import test from 'node:test';

import { app } from '../../src/app.js';
import { prisma } from '../../src/infrastructure/prisma/prisma.js';

console.log('\n=== tests/api/CompanyApi.test.ts ===');

interface AuthResponse {
    user: {
        id: number;
        email: string;
    };
    sessionToken: string;
}

let server: Server;
let baseUrl: string;

async function request(path: string, options?: RequestInit): Promise<Response> {
    return fetch(`${baseUrl}${path}`, options);
}

async function createAuthenticatedUser(): Promise<{ userId: number; token: string }> {
    const email = `company-api-${Date.now()}-${Math.random().toString(36).slice(2)}@example.com`;

    const response = await request('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'X-Forwarded-Proto': 'https' },
        body: JSON.stringify({ email, password: 'CorrectHorseBatteryStaple1!' }),
    });

    assert.equal(response.status, 201);

    const registered = (await response.json()) as AuthResponse;

    return { userId: registered.user.id, token: registered.sessionToken };
}

async function deleteUser(userId: number): Promise<void> {
    await prisma.session.deleteMany({ where: { userId } });
    await prisma.salt.deleteMany({ where: { userId } });
    await prisma.profile.deleteMany({ where: { userId } });
    await prisma.user.deleteMany({ where: { userId } });
}

test.before(async () => {
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

test('GET /api/companies returns companies', async () => {
    const company = await prisma.company.create({
        data: { name: `Company List Test ${Date.now()}`, description: 'Company used to test listing.' },
    });

    try {
        const response = await request('/api/companies');
        assert.equal(response.status, 200);

        const body = (await response.json()) as {
            companies: Array<{ companyId: number; name: string; description: string | null }>;
        };

        assert.ok(Array.isArray(body.companies));

        const result = body.companies.find((item) => item.companyId === company.companyId);

        assert.ok(result);
        assert.equal(result.name, company.name);
        assert.equal(result.description, company.description);
    } finally {
        await prisma.company.deleteMany({ where: { companyId: company.companyId } });
    }
});

test('GET /api/companies/:companyId returns a company', async () => {
    const company = await prisma.company.create({
        data: { name: `Company Details Test ${Date.now()}`, description: 'Company used to test details.' },
    });

    try {
        const response = await request(`/api/companies/${company.companyId}`);
        assert.equal(response.status, 200);

        const body = (await response.json()) as {
            company: { companyId: number; name: string; description: string | null };
        };

        assert.equal(body.company.companyId, company.companyId);
        assert.equal(body.company.name, company.name);
        assert.equal(body.company.description, company.description);
    } finally {
        await prisma.company.deleteMany({ where: { companyId: company.companyId } });
    }
});

test('GET /api/companies/:companyId rejects an invalid id', async () => {
    const response = await request('/api/companies/not-a-number');

    assert.equal(response.status, 400);
    assert.deepEqual(await response.json(), { message: 'A valid company id is required.' });
});

test('GET /api/companies/:companyId returns 404 when company does not exist', async () => {
    const response = await request('/api/companies/2147483647');

    assert.equal(response.status, 404);
    assert.deepEqual(await response.json(), { message: 'Company not found.' });
});

test('POST /api/companies rejects unauthenticated requests', async () => {
    const response = await request('/api/companies', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: 'Unauthorized Company', description: 'Should not be created.' }),
    });

    assert.equal(response.status, 401);
    assert.deepEqual(await response.json(), { message: 'Authentication required' });
});

test('POST /api/companies creates a company', async () => {
    const account = await createAuthenticatedUser();
    let companyId: number | undefined;

    try {
        const response = await request('/api/companies', {
            method: 'POST',
            headers: { Authorization: `Bearer ${account.token}`, 'Content-Type': 'application/json' },
            body: JSON.stringify({ name: 'CareerConnect Test Corp', description: 'Created through the company API.' }),
        });

        assert.equal(response.status, 201);

        const body = (await response.json()) as {
            company: { companyId: number; name: string; description: string | null };
        };

        companyId = body.company.companyId;

        assert.equal(body.company.name, 'CareerConnect Test Corp');
        assert.equal(body.company.description, 'Created through the company API.');

        const stored = await prisma.company.findUnique({ where: { companyId } });

        assert.ok(stored);
        assert.equal(stored.name, 'CareerConnect Test Corp');
    } finally {
        if (companyId) {
            await prisma.company.deleteMany({ where: { companyId } });
        }

        await deleteUser(account.userId);
    }
});

test('POST /api/companies rejects an invalid payload', async () => {
    const account = await createAuthenticatedUser();

    try {
        const response = await request('/api/companies', {
            method: 'POST',
            headers: { Authorization: `Bearer ${account.token}`, 'Content-Type': 'application/json' },
            body: JSON.stringify({ description: 'Missing company name.' }),
        });

        assert.equal(response.status, 400);
        assert.deepEqual(await response.json(), { message: 'A company requires a name and an optional text description.' });
    } finally {
        await deleteUser(account.userId);
    }
});

test('PUT /api/companies/:companyId rejects unauthenticated requests', async () => {
    const company = await prisma.company.create({
        data: { name: 'Protected Update Test', description: 'Should remain unchanged.' },
    });

    try {
        const response = await request(`/api/companies/${company.companyId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name: 'Unauthorized Update', description: 'Should not happen.' }),
        });

        assert.equal(response.status, 401);
        assert.deepEqual(await response.json(), { message: 'Authentication required' });
    } finally {
        await prisma.company.deleteMany({ where: { companyId: company.companyId } });
    }
});

test('PUT /api/companies/:companyId updates a company', async () => {
    const account = await createAuthenticatedUser();

    const company = await prisma.company.create({
        data: { name: 'Original Company', description: 'Original description.' },
    });

    try {
        const response = await request(`/api/companies/${company.companyId}`, {
            method: 'PUT',
            headers: { Authorization: `Bearer ${account.token}`, 'Content-Type': 'application/json' },
            body: JSON.stringify({ name: 'Updated Company', description: 'Updated description.' }),
        });

        assert.equal(response.status, 200);

        const body = (await response.json()) as {
            company: { companyId: number; name: string; description: string | null };
        };

        assert.equal(body.company.companyId, company.companyId);
        assert.equal(body.company.name, 'Updated Company');
        assert.equal(body.company.description, 'Updated description.');

        const stored = await prisma.company.findUnique({ where: { companyId: company.companyId } });

        assert.ok(stored);
        assert.equal(stored.name, 'Updated Company');
    } finally {
        await prisma.company.deleteMany({ where: { companyId: company.companyId } });
        await deleteUser(account.userId);
    }
});

test('PUT /api/companies/:companyId rejects an invalid payload', async () => {
    const account = await createAuthenticatedUser();

    const company = await prisma.company.create({
        data: { name: 'Invalid Update Test', description: 'Used for validation test.' },
    });

    try {
        const response = await request(`/api/companies/${company.companyId}`, {
            method: 'PUT',
            headers: { Authorization: `Bearer ${account.token}`, 'Content-Type': 'application/json' },
            body: JSON.stringify({ name: '' }),
        });

        assert.equal(response.status, 400);
        assert.deepEqual(await response.json(), { message: 'A company requires a name and an optional text description.' });
    } finally {
        await prisma.company.deleteMany({ where: { companyId: company.companyId } });
        await deleteUser(account.userId);
    }
});

test('PUT /api/companies/:companyId returns 404 for a missing company', async () => {
    const account = await createAuthenticatedUser();

    try {
        const response = await request('/api/companies/2147483647', {
            method: 'PUT',
            headers: { Authorization: `Bearer ${account.token}`, 'Content-Type': 'application/json' },
            body: JSON.stringify({ name: 'Missing Company', description: 'Does not exist.' }),
        });

        assert.equal(response.status, 404);
        assert.deepEqual(await response.json(), { message: 'Company not found.' });
    } finally {
        await deleteUser(account.userId);
    }
});

test('DELETE /api/companies/:companyId rejects unauthenticated requests', async () => {
    const company = await prisma.company.create({
        data: { name: 'Protected Delete Test', description: 'Should not be deleted.' },
    });

    try {
        const response = await request(`/api/companies/${company.companyId}`, {
            method: 'DELETE',
        });

        assert.equal(response.status, 401);
        assert.deepEqual(await response.json(), { message: 'Authentication required' });

        const stored = await prisma.company.findUnique({ where: { companyId: company.companyId } });
        assert.ok(stored);
    } finally {
        await prisma.company.deleteMany({ where: { companyId: company.companyId } });
    }
});

test('DELETE /api/companies/:companyId deletes a company', async () => {
    const account = await createAuthenticatedUser();

    const company = await prisma.company.create({
        data: { name: 'Delete Company', description: 'Will be deleted.' },
    });

    try {
        const response = await request(`/api/companies/${company.companyId}`, {
            method: 'DELETE',
            headers: { Authorization: `Bearer ${account.token}` },
        });

        assert.equal(response.status, 204);

        const stored = await prisma.company.findUnique({ where: { companyId: company.companyId } });
        assert.equal(stored, null);
    } finally {
        await prisma.company.deleteMany({ where: { companyId: company.companyId } });
        await deleteUser(account.userId);
    }
});

test('DELETE /api/companies/:companyId returns 404 for a missing company', async () => {
    const account = await createAuthenticatedUser();

    try {
        const response = await request('/api/companies/2147483647', {
            method: 'DELETE',
            headers: { Authorization: `Bearer ${account.token}` },
        });

        assert.equal(response.status, 404);
        assert.deepEqual(await response.json(), { message: 'Company not found.' });
    } finally {
        await deleteUser(account.userId);
    }
});