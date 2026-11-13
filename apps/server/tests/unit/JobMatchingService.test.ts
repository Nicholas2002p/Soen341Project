import assert from 'node:assert/strict';
import test from 'node:test';
import type { AiGenerationOptions, IAiService } from '../../src/application/interfaces/services/IAiService.js';
import { JobMatchingService } from '../../src/application/services/JobMatchingService.js';
import type { JobSummary } from '../../src/domain/entities/Job.js';
import { EmploymentType } from '../../src/domain/entities/EmploymentType.js';
import type { ResumeProfile } from '../../src/domain/entities/ResumeProfile.js';
import { AiServiceError } from '../../src/domain/errors/AiServiceError.js';

class FakeAiService implements IAiService {
    readonly calls: { prompt: string; options?: AiGenerationOptions }[] = [];

    constructor(private readonly response: string) {}

    async generateText(prompt: string, options?: AiGenerationOptions): Promise<string> {
        this.calls.push({ prompt, options });
        return this.response;
    }
}

const profile: ResumeProfile = {
    skills: ['React', 'TypeScript'],
    certifications: [],
    experience: ['Frontend developer intern at Acme, 2024'],
};

function job(jobId: number, title: string, skills: string[]): JobSummary {
    return {
        jobId,
        title,
        category: 'Software',
        location: 'Montreal',
        salary: 60000,
        employmentType: EmploymentType.Remote,
        deadline: new Date('2030-01-01'),
        createdAt: new Date('2026-01-01'),
        company: { companyId: 1, name: 'Acme' },
        skills,
    };
}

test('scoreJobs sends the profile and jobs, then returns matches sorted by score', async () => {
    const aiService = new FakeAiService(JSON.stringify([
        { jobId: 1, score: 40, reason: 'Some skills match.' },
        { jobId: 2, score: 92, reason: 'Strong React experience.' },
    ]));
    const service = new JobMatchingService(aiService);

    const matches = await service.scoreJobs(profile, [
        job(1, 'Backend Developer', ['Java']),
        job(2, 'Frontend Developer', ['React']),
    ]);

    assert.deepEqual(matches, [
        { jobId: 2, score: 92, reason: 'Strong React experience.' },
        { jobId: 1, score: 40, reason: 'Some skills match.' },
    ]);
    assert.equal(aiService.calls.length, 1);
    assert.match(aiService.calls[0]!.prompt, /Frontend Developer/);
    assert.match(aiService.calls[0]!.prompt, /TypeScript/);
    assert.equal(aiService.calls[0]!.options?.responseMimeType, 'application/json');
});

test('scoreJobs ignores unknown jobs, duplicates and missing scores, and keeps scores between 0 and 100', async () => {
    const aiService = new FakeAiService(JSON.stringify([
        { jobId: 1, score: 150, reason: 'Perfect fit.' },
        { jobId: 1, score: 10, reason: 'Duplicate entry.' },
        { jobId: 2, score: 'high', reason: 'Not a number.' },
        { jobId: 99, score: 80, reason: 'This job was never sent.' },
    ]));
    const service = new JobMatchingService(aiService);

    const matches = await service.scoreJobs(profile, [
        job(1, 'Frontend Developer', ['React']),
        job(2, 'Data Analyst', ['SQL']),
    ]);

    assert.deepEqual(matches, [{ jobId: 1, score: 100, reason: 'Perfect fit.' }]);
});

test('scoreJobs returns an empty list without calling the AI service when there are no jobs', async () => {
    const aiService = new FakeAiService('[]');
    const service = new JobMatchingService(aiService);

    const matches = await service.scoreJobs(profile, []);

    assert.deepEqual(matches, []);
    assert.equal(aiService.calls.length, 0);
});

test('scoreJobs rejects a response that is not a JSON list', async () => {
    const service = new JobMatchingService(new FakeAiService('{"jobId": 1}'));

    await assert.rejects(() => service.scoreJobs(profile, [job(1, 'Frontend Developer', ['React'])]), AiServiceError);
});