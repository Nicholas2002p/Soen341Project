import assert from 'node:assert/strict';
import { once } from 'node:events';
import type { Server } from 'node:http';
import test from 'node:test';
import { app } from '../../src/app.js';
import { prisma } from '../../src/infrastructure/prisma/prisma.js';

console.log('\n=== tests/integration/ProfileLifecycle.test.ts ===');

interface AuthResponse {
    user: { id: number; email: string };
    sessionToken: string;
}

let server: Server;
let baseUrl: string;

// Helper function to make HTTP requests to the test server
async function request(path: string, options?: RequestInit): Promise<Response> {
    return fetch(`${baseUrl}${path}`, options);
}

// Create a new user and obtain a session token for authentication.
test.before(async () => {
    server = app.listen(0);
    await once(server, 'listening');

    const address = server.address();
    assert(address && typeof address !== 'string');
    baseUrl = `http://127.0.0.1:${address.port}`;
});

// Delete the user and all associated data from the database.
test.after(async () => {
    server.close();
    await once(server, 'close');
    await prisma.$disconnect();
});

test('profile lifecycle persists and retrieves profile data through HTTP and Prisma', async () => {
    // Create a new user and obtain a session token for authentication.
    const email = `profile-${Date.now()}@example.com`;
    const password = 'CorrectHorseBatteryStaple1!';

    // Use a try-finally block to ensure cleanup of the created user and associated data
    try {
        const registerResponse = await request('/api/auth/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'X-Forwarded-Proto': 'https' },
            body: JSON.stringify({ email, password }),
        });

        // Assert that the user was created successfully and a session token was returned
        assert.equal(registerResponse.status, 201);

        // Parse the response to get the registered user and session token
        const registered = (await registerResponse.json()) as AuthResponse;

        // Assert that the session token is present in the response
        assert.ok(registered.sessionToken);

        // Use the session token to authenticate subsequent requests
        const headers = {
            Authorization: `Bearer ${registered.sessionToken}`,
            'Content-Type': 'application/json',
        };

        // Attempt to retrieve the profile for the newly registered user, expecting a 404 response since no profile has been created yet
        const missingProfileResponse = await request('/api/auth/profile', { headers });

        // Assert that the response indicates that no profile exists for the user
        assert.equal(missingProfileResponse.status, 404);

        // Assert that the response body contains the expected message indicating that no profile has been created
        assert.deepEqual(await missingProfileResponse.json(), {
            message: 'No profile has been created for this account.',
        });

        // Create a new profile for the user using the authenticated session token
        const createProfileResponse = await request('/api/auth/profile', {
            method: 'PUT',
            headers,
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

        // Assert that the profile was created successfully and the response contains the expected profile data
        assert.equal(createProfileResponse.status, 200);

        // Parse the response to get the created profile and assert that it matches the expected values
        const created = (await createProfileResponse.json()) as {
            profile: { userId: number; firstName: string; profileURL: string };
        };

        // Assert that the created profile has the expected userId, firstName, and profileURL
        assert.equal(created.profile.userId, registered.user.id);

        // Assert that the created profile has the expected firstName and profileURL
        assert.equal(created.profile.firstName, 'Ada');

        // Assert that the created profile has the expected profileURL
        assert.equal(created.profile.profileURL, 'https://example.com/ada');

        const publicProfileResponse = await request(`/api/profile/${registered.user.id}`);

        assert.equal(publicProfileResponse.status, 200);
        const publicProfile = (await publicProfileResponse.json()) as {
            profile: Record<string, unknown>;
        };
        assert.equal(publicProfile.profile.firstName, 'Ada');
        assert.equal(publicProfile.profile.location, 'London');
        assert.equal('phone' in publicProfile.profile, false);
        assert.equal('email' in publicProfile.profile, false);

        // Retrieve the profile again to ensure that the data persists and can be retrieved successfully
        const updateProfileResponse = await request('/api/auth/profile', {
            method: 'PUT',
            headers,
            body: JSON.stringify({ firstName: 'Augusta', lastName: 'King' }),
        });

        // Assert that the profile was updated successfully and the response contains the expected updated profile data
        assert.equal(updateProfileResponse.status, 200);

        // Parse the response to get the updated profile and assert that it matches the expected values
        const updated = (await updateProfileResponse.json()) as {
            profile: { firstName: string; lastName: string; middleName: string | null };
        };

        // Assert that the updated profile has the expected firstName, lastName, and middleName
        assert.equal(updated.profile.firstName, 'Augusta');
        // Assert that the updated profile has the expected lastName and middleName
        assert.equal(updated.profile.lastName, 'King');
        // Assert that the updated profile has the expected middleName
        assert.equal(updated.profile.middleName, 'Lovelace');

        // Retrieve the profile again to ensure that the updated data persists and can be retrieved successfully
        const profileResponse = await request('/api/auth/profile', { headers });

        // Assert that the profile was retrieved successfully and the response contains the expected profile data
        assert.equal(profileResponse.status, 200);
        const profile = (await profileResponse.json()) as {
            profile: { firstName: string; lastName: string; phone: string | null };
        };

        // Assert that the retrieved profile has the expected firstName, lastName, and phone
        assert.equal(profile.profile.firstName, 'Augusta');
        assert.equal(profile.profile.lastName, 'King');
        assert.equal(profile.profile.phone, '555-0100');
    } finally {
        // Clean up: Delete the user and all associated data from the database to ensure that the test environment is reset for future tests
        const user = await prisma.user.findUnique({ where: { email } });

        if (user) {
            await prisma.profile.deleteMany({ where: { userId: user.userId } });
            await prisma.session.deleteMany({ where: { userId: user.userId } });
            await prisma.salt.deleteMany({ where: { userId: user.userId } });
            await prisma.user.delete({ where: { userId: user.userId } });
        }
    }
});