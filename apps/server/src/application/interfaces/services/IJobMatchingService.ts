import type { JobSummary } from '../../../domain/entities/Job.js';
import type { JobMatch } from '../../../domain/entities/JobMatch.js';
import type { ResumeProfile } from '../../../domain/entities/ResumeProfile.js';

export interface IJobMatchingService {
    scoreJobs(profile: ResumeProfile, jobs: JobSummary[]): Promise<JobMatch[]>;
}