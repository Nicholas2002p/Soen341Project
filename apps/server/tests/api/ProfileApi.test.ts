import assert from 'node:assert/strict';
import { once } from 'node:events';
import { unlink } from 'node:fs/promises';
import type { Server } from 'node:http';
import path from 'node:path';
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
    await prisma.salt.deleteMany({ where: { userId } });
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

test('profile picture upload stores and serves the picture path', async () => {
    const account = await createAuthenticatedUser();
    let uploadedPath: string | undefined;

    // Test the profile picture upload functionality for an authenticated user.
    try {
        const profileResponse = await request('/api/auth/profile', {
            method: 'PUT',
            headers: {
                Authorization: `Bearer ${account.token}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ firstName: 'Ada', lastName: 'Lovelace' }),
        });
        assert.equal(profileResponse.status, 200); // Ensure the profile was created successfully.

        // Prepare a FormData object with a sample profile picture for upload.
        const formData = new FormData();
        formData.append('profilePicture', new Blob(['profile picture'], { type: 'image/png' }), 'avatar.png');

        // Upload the profile picture and verify the response.
        const uploadResponse = await request('/api/auth/profile/picture', {
            method: 'POST',
            headers: { Authorization: `Bearer ${account.token}` },
            body: formData,
        });

        // Ensure the upload was successful and the response contains the expected profile picture URL.
        assert.equal(uploadResponse.status, 200);
        const uploaded = (await uploadResponse.json()) as { profile: { profileURL: string } };
        uploadedPath = uploaded.profile.profileURL;
        assert.match(uploadedPath, /^\/uploads\/profile-pictures\/[^/]+\.png$/);

        // Verify that the public profile endpoint returns the correct profile picture URL.
        const publicResponse = await request(`/api/profile/${account.userId}`);
        assert.equal(publicResponse.status, 200);
        const publicProfile = (await publicResponse.json()) as { profile: { profileURL: string } };
        assert.equal(publicProfile.profile.profileURL, uploadedPath);

        // Verify that the uploaded profile picture can be accessed and served correctly.
        const pictureResponse = await request(uploadedPath);
        assert.equal(pictureResponse.status, 200);
        assert.equal(await pictureResponse.text(), 'profile picture');
    } finally {
        // Clean up by deleting the uploaded profile picture and the user after the test.
        if (uploadedPath) {
            await unlink(path.join(process.cwd(), uploadedPath.slice(1))).catch(() => undefined);
        }
        await deleteUser(account.userId);
    }
});