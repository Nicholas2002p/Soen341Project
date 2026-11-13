import type { IAiService } from '../interfaces/services/IAiService.js';
import type { IJobMatchingService } from '../interfaces/services/IJobMatchingService.js';
import type { JobSummary } from '../../domain/entities/Job.js';
import type { JobMatch } from '../../domain/entities/JobMatch.js';
import type { ResumeProfile } from '../../domain/entities/ResumeProfile.js';
import { AiServiceError } from '../../domain/errors/AiServiceError.js';

// All jobs are scored in a single request to respect the free Gemini tier limits.
const MAX_JOBS_PER_REQUEST = 50;

const JOB_MATCHES_SCHEMA = {
    type: 'ARRAY',
    items: {
        type: 'OBJECT',
        properties: {
            jobId: { type: 'INTEGER' },
            score: { type: 'INTEGER' },
            reason: { type: 'STRING' },
        },
        required: ['jobId', 'score', 'reason'],
    },
};

export class JobMatchingService implements IJobMatchingService {
    constructor(private readonly aiService: IAiService) {}

    async scoreJobs(profile: ResumeProfile, jobs: JobSummary[]): Promise<JobMatch[]> {
        const jobsToScore = jobs.slice(0, MAX_JOBS_PER_REQUEST);

        if (jobsToScore.length === 0) {
            return [];
        }

        const response = await this.aiService.generateText(buildPrompt(profile, jobsToScore), {
            temperature: 0,
            responseMimeType: 'application/json',
            responseSchema: JOB_MATCHES_SCHEMA,
        });

        const knownJobIds = new Set(jobsToScore.map((job) => job.jobId));

        return parseJobMatches(response, knownJobIds);
    }
}

function buildPrompt(profile: ResumeProfile, jobs: JobSummary[]): string {
    const jobList = jobs.map((job) => ({
        jobId: job.jobId,
        title: job.title,
        category: job.category,
        skills: job.skills,
    }));

    return [
        'You match candidates with job offers on a job platform.',
        'Compare the candidate profile with each job and give every job a score from 0 to 100.',
        '100 means the candidate fits the job perfectly. 0 means there is no fit at all.',
        'Base the score on the skills, certifications and experience of the candidate.',
        'Give one short sentence explaining each score.',
        'Return one entry for every job and keep the same jobId.',
        '',
        'Candidate profile:',
        JSON.stringify(profile),
        '',
        'Jobs:',
        JSON.stringify(jobList),
    ].join('\n');
}

function parseJobMatches(response: string, knownJobIds: Set<number>): JobMatch[] {
    let data: unknown;

    try {
        data = JSON.parse(response);
    } catch (error) {
        throw new AiServiceError('The AI service returned invalid job matches.', { cause: error });
    }

    if (!Array.isArray(data)) {
        throw new AiServiceError('The AI service returned invalid job matches.');
    }

    const matches = new Map<number, JobMatch>();

    for (const item of data) {
        if (typeof item !== 'object' || item === null) {
            continue;
        }

        const { jobId, score, reason } = item as Record<string, unknown>;

        // Ignore jobs that were not sent, duplicates, and missing scores.
        if (typeof jobId !== 'number' || !knownJobIds.has(jobId) || matches.has(jobId)) {
            continue;
        }

        if (typeof score !== 'number' || !Number.isFinite(score)) {
            continue;
        }

        matches.set(jobId, {
            jobId,
            score: Math.min(100, Math.max(0, Math.round(score))),
            reason: typeof reason === 'string' ? reason.trim() : '',
        });
    }

    return [...matches.values()].sort((first, second) => second.score - first.score);
}