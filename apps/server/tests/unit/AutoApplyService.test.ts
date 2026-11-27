import assert from 'node:assert/strict';
import test from 'node:test';
import type { IApplicationService } from '../../src/application/interfaces/services/IApplicationService.js';
import type { IJobMatchingService } from '../../src/application/interfaces/services/IJobMatchingService.js';
import type { IJobService } from '../../src/application/interfaces/services/IJobService.js';
import type { IPdfTextExtractionService } from '../../src/application/interfaces/services/IPdfTextExtractionService.js';
import type { IResumeAnalysisService } from '../../src/application/interfaces/services/IResumeAnalysisService.js';
import type { IResumeService } from '../../src/application/interfaces/services/IResumeService.js';
import { AutoApplyService } from '../../src/application/services/AutoApplyService.js';
import { ApplicationStatus } from '../../src/domain/entities/Application.js';
import { EmploymentType } from '../../src/domain/entities/EmploymentType.js';
import type { JobSummary } from '../../src/domain/entities/Job.js';
import type { JobMatch } from '../../src/domain/entities/JobMatch.js';
import type { PublicUser } from '../../src/domain/entities/PublicUser.js';
import { UserRole } from '../../src/domain/entities/User.js';
import { ApplicationNotAllowedError, JobClosedError } from '../../src/domain/errors/ApplicationErrors.js';
import { InvalidResumeFileError } from '../../src/domain/errors/InvalidResumeFileError.js';
import type { ResumeFileType } from '../../src/domain/validation/ResumeFile.js';

const jobSeeker: PublicUser = {
    id: 1,
    email: 'seeker@example.com',
    role: UserRole.JobSeeker,
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date('2026-01-01'),
};

function job(jobId: number): JobSummary {
    return {
        jobId,
        title: `Job ${jobId}`,
        category: 'Software',
        location: 'Montreal',
        salary: 60000,
        employmentType: EmploymentType.Remote,
        deadline: new Date('2030-01-01'),
        createdAt: new Date('2026-01-01'),
        description: null,
        archive: false,
        company: { companyId: 1, name: 'Acme' },
        skills: ['React'],
    };
}

interface SetupOptions {
    jobs?: JobSummary[];
    matches?: JobMatch[];
    alreadyAppliedJobIds?: number[];
    closedJobIds?: number[];
    fileType?: ResumeFileType;
}

// Builds the service with fake dependencies and records what they were asked to do
function setup(options: SetupOptions = {}) {
    const calls = {
        getFile: 0,
        extractProfile: 0,
        scoredJobIds: [] as number[],
        appliedJobIds: [] as number[],
    };

    const resumeService = {
        async getFile(_userId: number, resumeId: number) {
            calls.getFile += 1;
            return {
                resume: { id: resumeId, fileName: 'resume', fileType: options.fileType ?? 'pdf', createdAt: new Date('2026-01-01') },
                content: Buffer.from('%PDF-1.4'),
                mimeType: 'application/pdf',
            };
        },
    } as unknown as IResumeService;

    const pdfTextExtractionService: IPdfTextExtractionService = {
        async extractText() {
            return 'React developer';
        },
    };

    const resumeAnalysisService: IResumeAnalysisService = {
        async extractProfile() {
            calls.extractProfile += 1;
            return { skills: ['React'], certifications: [], experience: [] };
        },
    };

    const jobService = {
        async getAvailable() {
            return options.jobs ?? [];
        },
    } as unknown as IJobService;

    const jobMatchingService: IJobMatchingService = {
        async scoreJobs(_profile, jobs) {
            calls.scoredJobIds = jobs.map((scoredJob) => scoredJob.jobId);
            return options.matches ?? [];
        },
    };

    const applicationService = {
        async listMine() {
            return (options.alreadyAppliedJobIds ?? []).map((jobId) => ({ jobId }));
        },
        async apply(_user: PublicUser, data: { jobId: number; resumeId: number }) {
            if (options.closedJobIds?.includes(data.jobId)) {
                throw new JobClosedError();
            }

            calls.appliedJobIds.push(data.jobId);
            return {
                id: 100 + data.jobId,
                userId: jobSeeker.id,
                jobId: data.jobId,
                resumeId: data.resumeId,
                status: ApplicationStatus.Applied,
                appliedAt: new Date('2026-01-01'),
                updatedAt: null,
            };
        },
    } as unknown as IApplicationService;

    const service = new AutoApplyService(
        resumeService,
        pdfTextExtractionService,
        resumeAnalysisService,
        jobService,
        jobMatchingService,
        applicationService,
    );

    return { service, calls };
}

test('autoApply applies only to jobs with a score of 70 or more', async () => {
    const { service, calls } = setup({
        jobs: [job(1), job(2), job(3)],
        matches: [
            { jobId: 2, score: 95, reason: 'Strong React experience.' },
            { jobId: 1, score: 70, reason: 'Good fit.' },
            { jobId: 3, score: 69, reason: 'Missing skills.' },
        ],
    });

    const result = await service.autoApply(jobSeeker, 7);

    assert.deepEqual(calls.appliedJobIds, [2, 1]);
    assert.equal(result.reviewedJobCount, 3);
    assert.equal(result.appliedCount, 2);
    assert.deepEqual(result.applied[0], {
        applicationId: 102,
        jobId: 2,
        title: 'Job 2',
        companyName: 'Acme',
        score: 95,
        reason: 'Strong React experience.',
    });
});

test('autoApply does not send jobs the user already applied to', async () => {
    const { service, calls } = setup({
        jobs: [job(1), job(2)],
        alreadyAppliedJobIds: [1],
        matches: [{ jobId: 2, score: 80, reason: 'Good fit.' }],
    });

    const result = await service.autoApply(jobSeeker, 7);

    assert.deepEqual(calls.scoredJobIds, [2]);
    assert.deepEqual(calls.appliedJobIds, [2]);
    assert.equal(result.reviewedJobCount, 1);
});

test('autoApply sends at most 10 applications', async () => {
    const jobs = Array.from({ length: 12 }, (_value, index) => job(index + 1));
    const matches = jobs.map((matchedJob) => ({ jobId: matchedJob.jobId, score: 90, reason: 'Good fit.' }));
    const { service, calls } = setup({ jobs, matches });

    const result = await service.autoApply(jobSeeker, 7);

    assert.equal(calls.appliedJobIds.length, 10);
    assert.equal(result.appliedCount, 10);
});

test('autoApply skips a job that closed while the AI was working', async () => {
    const { service, calls } = setup({
        jobs: [job(1), job(2)],
        closedJobIds: [1],
        matches: [
            { jobId: 1, score: 90, reason: 'Good fit.' },
            { jobId: 2, score: 85, reason: 'Good fit.' },
        ],
    });

    const result = await service.autoApply(jobSeeker, 7);

    assert.deepEqual(calls.appliedJobIds, [2]);
    assert.equal(result.appliedCount, 1);
});

test('autoApply returns an empty result without calling the AI when no job is open', async () => {
    const { service, calls } = setup({ jobs: [] });

    const result = await service.autoApply(jobSeeker, 7);

    assert.deepEqual(result, { reviewedJobCount: 0, appliedCount: 0, applied: [] });
    assert.equal(calls.extractProfile, 0);
});

test('autoApply refuses recruiters before reading the resume', async () => {
    const { service, calls } = setup({ jobs: [job(1)] });
    const recruiter: PublicUser = { ...jobSeeker, role: UserRole.Recruiter };

    await assert.rejects(() => service.autoApply(recruiter, 7), ApplicationNotAllowedError);
    assert.equal(calls.getFile, 0);
    assert.equal(calls.extractProfile, 0);
});

test('autoApply refuses resumes that are not PDF files', async () => {
    const { service, calls } = setup({ jobs: [job(1)], fileType: 'docx' });

    await assert.rejects(() => service.autoApply(jobSeeker, 7), InvalidResumeFileError);
    assert.equal(calls.extractProfile, 0);
});