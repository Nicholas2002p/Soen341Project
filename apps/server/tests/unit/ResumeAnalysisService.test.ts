import assert from 'node:assert/strict';
import test from 'node:test';
import type { AiGenerationOptions, IAiService } from '../../src/application/interfaces/services/IAiService.js';
import { ResumeAnalysisService } from '../../src/application/services/ResumeAnalysisService.js';
import { AiServiceError } from '../../src/domain/errors/AiServiceError.js';

class FakeAiService implements IAiService {
    readonly calls: { prompt: string; options?: AiGenerationOptions }[] = [];

    constructor(private readonly response: string) {}

    async generateText(prompt: string, options?: AiGenerationOptions): Promise<string> {
        this.calls.push({ prompt, options });
        return this.response;
    }
}

test('extractProfile asks for JSON and returns the parsed resume profile', async () => {
    const aiService = new FakeAiService(JSON.stringify({
        skills: ['React', ' SQL '],
        certifications: ['AWS Cloud Practitioner'],
        experience: ['Software developer intern at Acme, 2024'],
    }));
    const service = new ResumeAnalysisService(aiService);

    const profile = await service.extractProfile('  Jane Doe. React and SQL developer.  ');

    assert.deepEqual(profile, {
        skills: ['React', 'SQL'],
        certifications: ['AWS Cloud Practitioner'],
        experience: ['Software developer intern at Acme, 2024'],
    });
    assert.equal(aiService.calls.length, 1);
    assert.match(aiService.calls[0]!.prompt, /Jane Doe\. React and SQL developer\./);
    assert.equal(aiService.calls[0]!.options?.responseMimeType, 'application/json');
    assert.equal(aiService.calls[0]!.options?.temperature, 0);
});

test('extractProfile ignores values that are not lists of text', async () => {
    const aiService = new FakeAiService(JSON.stringify({
        skills: ['TypeScript', 42, '', null],
        certifications: 'none',
    }));
    const service = new ResumeAnalysisService(aiService);

    const profile = await service.extractProfile('Resume text');

    assert.deepEqual(profile, {
        skills: ['TypeScript'],
        certifications: [],
        experience: [],
    });
});

test('extractProfile rejects an empty resume without calling the AI service', async () => {
    const aiService = new FakeAiService('{}');
    const service = new ResumeAnalysisService(aiService);

    await assert.rejects(() => service.extractProfile('   '), AiServiceError);
    assert.equal(aiService.calls.length, 0);
});

test('extractProfile rejects a response that is not valid JSON', async () => {
    const service = new ResumeAnalysisService(new FakeAiService('not json'));

    await assert.rejects(() => service.extractProfile('Resume text'), AiServiceError);
});