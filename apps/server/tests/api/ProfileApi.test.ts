import assert from 'node:assert/strict';
import { once } from 'node:events';
import type { Server } from 'node:http';
import test from 'node:test';
import { app } from '../../src/app.js';
import { prisma } from '../../src/infrastructure/prisma/prisma.js';

console.log('\n=== tests/api/ProfileApi.test.ts ===');

interface AuthResponse {
    user: { id: number; email: string };
    sessionToken: string;
}

let server: Server;
let baseUrl: string;

async function request(path: string, options?: RequestInit): Promise<Response> {
    return fetch(`${baseUrl}${path}`, options);
}

async function createAuthenticatedUser(): Promise<{ userId: number; token: string }> {
    // Create a new user and obtain a session token for authentication.
    const email = `profile-api-${Date.now()}-${Math.random().toString(36).slice(2)}@example.com`;
    const response = await request('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'X-Forwarded-Proto': 'https' },
        body: JSON.stringify({ email, password: 'CorrectHorseBatteryStaple1!' }),
    });

    // Ensure the user was created successfully and a session token was returned.
    assert.equal(response.status, 201);
    const registered = (await response.json()) as AuthResponse;
    return { userId: registered.user.id, token: registered.sessionToken };
}

// Delete the user and all associated data from the database.
async function deleteUser(userId: number): Promise<void> {
    await prisma.profile.deleteMany({ where: { userId } });
    await prisma.session.deleteMany({ where: { userId } });
    await prisma.user.delete({ where: { userId } });
}

// Set up the server before running tests and tear it down afterward.
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

// Test cases for the Profile API endpoints.
test('profile get rejects requests without a bearer token', async () => {
    const response = await request('/api/auth/profile');

    // Ensure the response indicates that authentication is required.
    assert.equal(response.status, 401);
    assert.deepEqual(await response.json(), {
        message: 'Authentication required',
    });
});

test('profile update rejects requests without a bearer token', async () => {
    const response = await request('/api/auth/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ firstName: 'Ada', lastName: 'Lovelace' }),
    });

    // Ensure the response indicates that authentication is required.
    assert.equal(response.status, 401);
    assert.deepEqual(await response.json(), {
        message: 'Authentication required',
    });
});

test('public profile rejects an invalid user id', async () => {
    const response = await request('/api/profile/not-a-user-id');

    assert.equal(response.status, 400);
    assert.deepEqual(await response.json(), {
        message: 'A valid user id is required.',
    });
});

test('profile update rejects a payload without required names', async () => {
    // Create an authenticated user to test profile update.
    const account = await createAuthenticatedUser();

    try {
        // Attempt to update the profile with a payload missing required fields.
        const response = await request('/api/auth/profile', {
            method: 'PUT',
            headers: {
                Authorization: `Bearer ${account.token}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ firstName: 'Ada' }),
        });
      
        // Ensure the response indicates that the required fields are missing.
        assert.equal(response.status, 400);
        assert.deepEqual(await response.json(), {
            message: 'A profile requires firstName and lastName, with optional text fields.',
        });
    } finally {
        // Clean up by deleting the user after the test.
        await deleteUser(account.userId);
    }
});

test('profile update rejects non-text optional fields', async () => {
    // Create an authenticated user to test profile update.
    const account = await createAuthenticatedUser();

    try {
        // Attempt to update the profile with a payload containing non-text optional fields.
        const response = await request('/api/auth/profile', {
            method: 'PUT',
            headers: {
                Authorization: `Bearer ${account.token}`,
                'Content-Type': 'application/json',
          },
          body: JSON.stringify({ firstName: 'Ada', lastName: 'Lovelace', phone: 5550100 }),
        });

        // Ensure the response indicates that the optional fields must be text.
        assert.equal(response.status, 400);
        assert.deepEqual(await response.json(), {
            message: 'A profile requires firstName and lastName, with optional text fields.',
        });
    } finally {
        // Clean up by deleting the user after the test.
        await deleteUser(account.userId);
    }
});