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

test('resume upload rejects requests without a bearer token', async () => {
  const form = new FormData();
  form.append('resume', new Blob(['%PDF-1.4'], { type: 'application/pdf' }), 'resume.pdf');

  const response = await request('/api/resumes', { method: 'POST', body: form });

  assert.equal(response.status, 401);
  assert.deepEqual(await response.json(), { message: 'Authentication required' });
});

test('resume list rejects requests without a bearer token', async () => {
  const response = await request('/api/resumes');

  assert.equal(response.status, 401);
});

test('resume download rejects requests without a bearer token', async () => {
  const response = await request('/api/resumes/1/file');

  assert.equal(response.status, 401);
});

test('resume delete rejects requests without a bearer token', async () => {
  const response = await request('/api/resumes/1', { method: 'DELETE' });

  assert.equal(response.status, 401);
});
