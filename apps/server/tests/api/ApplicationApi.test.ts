import assert from 'node:assert/strict';
import { once } from 'node:events';
import type { Server } from 'node:http';
import test from 'node:test';
import { app } from '../../src/app.js';

let server: Server;
let baseUrl: string;

async function request(path: string, options?: RequestInit): Promise<Response> {
  return fetch(`${baseUrl}${path}`, options);
}

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

test('every application route rejects requests without a bearer token', async () => {
  const routes: [string, string][] = [
    ['POST', '/api/applications'],
    ['GET', '/api/applications'],
    ['GET', '/api/applications/history'],
    ['GET', '/api/applications/1'],
    ['DELETE', '/api/applications/1'],
    ['PATCH', '/api/applications/1/status'],
    ['GET', '/api/applications/jobs/1'],
  ];

  for (const [method, path] of routes) {
    const response = await request(path, { method });

    assert.equal(response.status, 401, `${method} ${path}`);
    assert.deepEqual(await response.json(), { message: 'Authentication required' });
  }
});
