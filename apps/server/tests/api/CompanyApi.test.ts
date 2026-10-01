import assert from 'node:assert/strict';
import { once } from 'node:events';
import type { Server } from 'node:http';
import test from 'node:test';

import { app } from '../../src/app.js';
import { prisma } from '../../src/infrastructure/prisma/prisma.js';

console.log('\n=== tests/api/CompanyApi.test.ts ===');

let server: Server;
let baseUrl: string;

async function request(
    path: string,
    options?: RequestInit,
): Promise<Response> {
    return fetch(`${baseUrl}${path}`, options);
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
        data: {
            name: `API Test Company ${Date.now()}`,
            description: 'Company created for API testing.',
        },
    });

    try {
        const response = await request('/api/companies');

        assert.equal(response.status, 200);

        const body = await response.json() as {
            companies: Array<{
                companyId: number;
                name: string;
                description: string | null;
            }>;
        };

        assert.ok(Array.isArray(body.companies));

        const result = body.companies.find(
            (item) => item.companyId === company.companyId,
        );

        assert.ok(result);
        assert.equal(result.name, company.name);
        assert.equal(result.description, company.description);
    } finally {
        await prisma.company.delete({
            where: {
                companyId: company.companyId,
            },
        });
    }
});

test('GET /api/companies/:companyId returns a company', async () => {
    const company = await prisma.company.create({
        data: {
            name: `Single Company ${Date.now()}`,
            description: 'Company details test.',
        },
    });

    try {
        const response = await request(
            `/api/companies/${company.companyId}`,
        );

        assert.equal(response.status, 200);

        const body = await response.json() as {
            company: {
                companyId: number;
                name: string;
                description: string | null;
            };
        };

        assert.equal(body.company.companyId, company.companyId);
        assert.equal(body.company.name, company.name);
        assert.equal(
            body.company.description,
            company.description,
        );
    } finally {
        await prisma.company.delete({
            where: {
                companyId: company.companyId,
            },
        });
    }
});

test('GET /api/companies/:companyId rejects an invalid id', async () => {
    const response = await request(
        '/api/companies/not-a-number',
    );

    assert.equal(response.status, 400);

    assert.deepEqual(await response.json(), {
        message: 'A valid company id is required.',
    });
});

test('GET /api/companies/:companyId returns 404 when company does not exist', async () => {
    const response = await request(
        '/api/companies/2147483647',
    );

    assert.equal(response.status, 404);

    assert.deepEqual(await response.json(), {
        message: 'Company not found.',
    });
});