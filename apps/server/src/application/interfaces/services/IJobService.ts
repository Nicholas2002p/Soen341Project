import type { JobSearchFilters } from '../repositories/IJobRepository.js';
import type { JobDetails, JobSummary } from '../../../domain/entities/Job.js';

export interface IJobService {
    /**
     * searches for jobs based on the provided filtering criteria.
     * @param filters - The raw search criteria provided by the client.
     * @returns a promise that resolves to an array of matching job summaries.
     */
    search(filters: JobSearchFilters): Promise<JobSummary[]>;
    /**
     * searches for a certain job
     * @param jobId - identifier for job
     * @returns a promise that resolves to a job or null
     */
    getById(jobId: number): Promise<JobDetails | null>;
}