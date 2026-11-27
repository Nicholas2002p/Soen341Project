import assert from 'node:assert/strict';
import test from 'node:test';
import { GeminiAiService } from '../../src/infrastructure/ai/GeminiAiService.js';
import { AiServiceError } from '../../src/domain/errors/AiServiceError.js';

type FetchCall = [string, RequestInit | undefined];

function response(body: unknown, status = 200): Response {
    return new Response(JSON.stringify(body), {
        status,
        headers: { 'Content-Type': 'application/json' },
    });
}

test('sends a prompt and returns Gemini text', async () => {
    const calls: FetchCall[] = [];
    const service = new GeminiAiService('test-key', 'gemini-test', async (...args) => {
        calls.push(args);
        return response({
            candidates: [
                { content: { parts: [{ text: 'Generated ' }, { text: 'answer' }] } },
            ],
        });
    });

    const result = await service.generateText('  Summarize this resume.  ', {
        temperature: 0.2,
        maxOutputTokens: 200,
    });

    assert.equal(result, 'Generated answer');
    assert.equal(calls.length, 1);
    assert.equal(calls[0]?.[0], 'https://generativelanguage.googleapis.com/v1beta/models/gemini-test:generateContent?key=test-key');
    assert.deepEqual(JSON.parse(String(calls[0]?.[1]?.body)), {
        contents: [{ parts: [{ text: 'Summarize this resume.' }] }],
        generationConfig: { temperature: 0.2, maxOutputTokens: 200 },
    });
});

test('rejects missing configuration, empty prompts, and Gemini errors', async () => {
    const service = new GeminiAiService('', 'gemini-test');

    await assert.rejects(service.generateText('prompt'), (error: unknown) => (
        error instanceof AiServiceError && error.message === 'GEMINI_API_KEY must be configured.'
    ));

    const configuredService = new GeminiAiService('test-key', 'gemini-test', async () => (
        response({ error: { message: 'Quota exceeded' } }, 429)
    ));

    await assert.rejects(configuredService.generateText('   '), /A prompt is required/);
    await assert.rejects(configuredService.generateText('prompt'), /Quota exceeded/);
});

test('rejects empty and invalid Gemini responses', async () => {
    const emptyService = new GeminiAiService('test-key', 'gemini-test', async () => (
        response({ candidates: [] })
    ));
    await assert.rejects(emptyService.generateText('prompt'), /empty response/);

    const invalidService = new GeminiAiService('test-key', 'gemini-test', async () => (
        new Response('not json', { status: 200 })
    ));
    await assert.rejects(invalidService.generateText('prompt'), /invalid response/);
});
