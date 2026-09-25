import assert from 'node:assert/strict';
import { once } from 'node:events';
import type { Server } from 'node:http';
import test from 'node:test';
import { app } from '../../src/app.js';
import { prisma } from '../../src/infrastructure/prisma/prisma.js';

console.log('\n=== tests/integration/AuthLifecycle.test.ts ===');

interface AuthResponse {
    user: {
        id: number;
        email: string;
        passwordHash?: string;
    };
    sessionToken: string;
}

let server: Server;
let baseUrl: string;

async function request(path: string, options?: RequestInit): Promise<Response> {
    return fetch(`${baseUrl}${path}`, options);
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

test('authentication lifecycle works through the HTTP API and database', async () => {
    const email = `auth-${Date.now()}@example.com`;
    const password = 'CorrectHorseBatteryStaple1!';

    try {
        // Register a real user and verify a session token is returned.
        const registerResponse = await request('/api/auth/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'X-Forwarded-Proto': 'https' },
            body: JSON.stringify({ email, password }),
        });
      
        assert.equal(registerResponse.status, 201);
        const registered = (await registerResponse.json()) as AuthResponse;
        assert.equal(registered.user.email, email);
        assert.equal('passwordHash' in registered.user, false);
        assert.ok(registered.sessionToken);

        // Log in with the same credentials and use the new session token.
        const loginResponse = await request('/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'X-Forwarded-Proto': 'https' },
            body: JSON.stringify({ email, password }),
        });

        assert.equal(loginResponse.status, 200);
        const loggedIn = (await loginResponse.json()) as AuthResponse;
        assert.ok(loggedIn.sessionToken);

        // Confirm the protected endpoint resolves the authenticated user.
        const meResponse = await request('/api/auth/me', {
            headers: { Authorization: `Bearer ${loggedIn.sessionToken}` },
        });

        assert.equal(meResponse.status, 200);
        const currentUser = (await meResponse.json()) as { user: AuthResponse['user'] };
        assert.equal(currentUser.user.id, registered.user.id);
        assert.equal('passwordHash' in currentUser.user, false);

        const profileHeaders = {
            Authorization: `Bearer ${loggedIn.sessionToken}`,
            'Content-Type': 'application/json',
        };

        const missingProfileResponse = await request('/api/auth/profile', {
            headers: profileHeaders,
        });

        assert.equal(missingProfileResponse.status, 404);

        const updateProfileResponse = await request('/api/auth/profile', {
            method: 'PUT',
            headers: profileHeaders,
            body: JSON.stringify({
                firstName: 'Ada',
                middleName: 'Lovelace',
                lastName: 'Byron',
                phone: '555-0100',
                bio: 'Mathematician',
                location: 'London',
                profileURL: 'https://example.com/ada',
            }),
        });

        assert.equal(updateProfileResponse.status, 200);
        const updatedProfile = (await updateProfileResponse.json()) as {
            profile: { userId: number; firstName: string; profileURL: string };
        };
        assert.equal(updatedProfile.profile.userId, registered.user.id);
        assert.equal(updatedProfile.profile.firstName, 'Ada');
        assert.equal(updatedProfile.profile.profileURL, 'https://example.com/ada');

        const profileResponse = await request('/api/auth/profile', {
            headers: profileHeaders,
        });

        assert.equal(profileResponse.status, 200);
        const profile = (await profileResponse.json()) as {
            profile: { lastName: string; location: string };
        };
        assert.equal(profile.profile.lastName, 'Byron');
        assert.equal(profile.profile.location, 'London');

        // Log out and verify that the session can no longer authenticate requests.
        const logoutResponse = await request('/api/auth/logout', {
            method: 'POST',
            headers: { Authorization: `Bearer ${loggedIn.sessionToken}` },
        });

        assert.equal(logoutResponse.status, 200);

        const invalidatedSessionResponse = await request('/api/auth/me', {
            headers: { Authorization: `Bearer ${loggedIn.sessionToken}` },
        });

        assert.equal(invalidatedSessionResponse.status, 401);
    } finally {
        // Remove the temporary database user even if an assertion fails.
        const user = await prisma.user.findUnique({ where: { email } });

        if (user) {
            await prisma.profile.deleteMany({ where: { userId: user.userId } });
            await prisma.user.delete({ where: { userId: user.userId } });
        }
    }
});
