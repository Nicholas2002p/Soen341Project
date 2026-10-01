import assert from 'node:assert/strict';
import { once } from 'node:events';
import type { Server } from 'node:http';
import test from 'node:test';
import { app } from '../../src/app.js';

console.log('\n=== tests/api/AuthApi.test.ts ===');

let server: Server;
let baseUrl: string;

async function request(path: string, options?: RequestInit): Promise<Response> {
  return fetch(`${baseUrl}${path}`, options);
}

const httpsHeaders = { 'X-Forwarded-Proto': 'https' };

test.before(async () => {
  // Start the Express app on an ephemeral port for isolated HTTP tests.
  server = app.listen(0);
  await once(server, 'listening');

  const address = server.address();
  assert(address && typeof address !== 'string');
  baseUrl = `http://127.0.0.1:${address.port}`;
});

test.after(async () => {
  // Close the temporary HTTP server after all API assertions complete.
  server.close();
  await once(server, 'close');
});

test('register rejects a request without credentials', async () => {
  // Verify the controller rejects incomplete registration payloads.
  const response = await request('/api/auth/register', {
    method: 'POST',
    headers: { ...httpsHeaders, 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'missing-password@example.com' }),
  });

  assert.equal(response.status, 400);
  assert.deepEqual(await response.json(), {
    message: 'Registration requires both an email address and a password.',
  });
});

test('register rejects an invalid email format', async () => {
  // Verify malformed email input is rejected before authentication logic runs.
  const response = await request('/api/auth/register', {
    method: 'POST',
    headers: { ...httpsHeaders, 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'not-an-email', password: 'secret-password' }),
  });

  assert.equal(response.status, 400);
  assert.deepEqual(await response.json(), {
    message: 'The registration email address is not valid.',
  });
});

test('login rejects a request without credentials', async () => {
  // Verify login requires both email and password.
  const response = await request('/api/auth/login', {
    method: 'POST',
    headers: { ...httpsHeaders, 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'missing-password@example.com' }),
  });

  assert.equal(response.status, 400);
});

test('login validates credentials over HTTP', async () => {
  const response = await request('/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'person@example.com', password: 'secret-password' }),
  });

  assert.equal(response.status, 401);
  assert.deepEqual(await response.json(), {
	message: 'The email address or password is incorrect.',
  });
});

test('me rejects requests without a bearer token', async () => {
  // Verify protected routes reject unauthenticated requests at the middleware boundary.
  const response = await request('/api/auth/me');

  assert.equal(response.status, 401);
  assert.deepEqual(await response.json(), {
    message: 'Authentication required',
  });
});
