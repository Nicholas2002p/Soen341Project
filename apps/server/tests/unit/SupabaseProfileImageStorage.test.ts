import assert from 'node:assert/strict';
import test from 'node:test';
import type { SupabaseProfileImageStorageClient } from '../../src/infrastructure/storage/SupabaseProfileImageStorage.js';
import { SupabaseProfileImageStorage } from '../../src/infrastructure/storage/SupabaseProfileImageStorage.js';

console.log('\n=== tests/unit/SupabaseProfileImageStorage.test.ts ===');

interface UploadCall {
    path: string;
    content: Buffer;
    options: { contentType: string; upsert: boolean };
}

function createClient(overrides: {
    uploadError?: Error | null;
    removeError?: Error | null;
} = {}): {
    client: SupabaseProfileImageStorageClient;
    uploadCalls: UploadCall[];
    removedPaths: string[][];
} {
    const uploadCalls: UploadCall[] = [];
    const removedPaths: string[][] = [];
    const client: SupabaseProfileImageStorageClient = {
        storage: {
            from(bucket: string) {
                assert.equal(bucket, 'profile-images');
                return {
                    async upload(path, content, options) {
                        uploadCalls.push({ path, content, options });
                        return { error: overrides.uploadError ?? null };
                    },
                    getPublicUrl(path) {
                        return { data: { publicUrl: `https://storage.example/${path}` } };
                    },
                    async remove(paths) {
                        removedPaths.push(paths);
                        return { error: overrides.removeError ?? null };
                    },
                };
            },
        },
    };

    return { client, uploadCalls, removedPaths };
}

test('save uploads a profile image and returns its public URL', async () => {
    const { client, uploadCalls } = createClient();
    const storage = new SupabaseProfileImageStorage(client);
    const content = Buffer.from('profile image');

    const publicUrl = await storage.save(content, 'image/png', 'png');

    assert.match(publicUrl, /^https:\/\/storage\.example\/[0-9a-f-]+\.png$/);
    assert.deepEqual(uploadCalls[0]?.content, content);
    assert.equal(uploadCalls[0]?.options.contentType, 'image/png');
    assert.equal(uploadCalls[0]?.options.upsert, false);
});

test('save surfaces a Supabase upload error', async () => {
    const uploadError = new Error('upload failed');
    const { client } = createClient({ uploadError });
    const storage = new SupabaseProfileImageStorage(client);

    await assert.rejects(
        storage.save(Buffer.from('profile image'), 'image/jpeg', 'jpg'),
        uploadError,
    );
});

test('delete removes the encoded storage key from a profile image URL', async () => {
    const { client, removedPaths } = createClient();
    const storage = new SupabaseProfileImageStorage(client);

    await storage.delete('https://storage.example/storage/v1/object/public/profile-images/avatar%20one.png');

    assert.deepEqual(removedPaths, [['avatar one.png']]);
});

test('delete ignores URLs outside the profile image bucket', async () => {
    const { client, removedPaths } = createClient();
    const storage = new SupabaseProfileImageStorage(client);

    await storage.delete('/uploads/profile-pictures/profile_default.jpg');

    assert.deepEqual(removedPaths, []);
});

test('delete surfaces a Supabase removal error', async () => {
    const removeError = new Error('remove failed');
    const { client } = createClient({ removeError });
    const storage = new SupabaseProfileImageStorage(client);

    await assert.rejects(
        storage.delete('https://storage.example/storage/v1/object/public/profile-images/avatar.png'),
        removeError,
    );
});
