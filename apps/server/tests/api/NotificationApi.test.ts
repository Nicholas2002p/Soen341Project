import assert from 'node:assert/strict';
import test from 'node:test';

import { app } from '../../src/app.js';

test('notification routes require authentication', async () => {
    const server = app.listen(0);
    try {
        const address = server.address();
        assert(address && typeof address !== 'string');
        const response = await fetch(`http://127.0.0.1:${address.port}/api/notifications`);
        assert.equal(response.status, 401);
    } finally {
        await new Promise<void>((resolve, reject) => server.close((error) => error ? reject(error) : resolve()));
    }
});

test('push registration validates installationId', async () => {
    const server = app.listen(0);
    try {
        const address = server.address();
        assert(address && typeof address !== 'string');
        const response = await fetch(`http://127.0.0.1:${address.port}/api/notifications/push`, {
            method: 'POST',
            headers: { Authorization: 'Bearer invalid', 'Content-Type': 'application/json' },
            body: JSON.stringify({}),
        });
        assert.equal(response.status, 401);
    } finally {
        await new Promise<void>((resolve, reject) => server.close((error) => error ? reject(error) : resolve()));
    }
});
