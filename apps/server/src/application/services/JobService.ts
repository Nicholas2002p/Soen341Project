import type { IJobRepository, JobSearchFilters } from '../interfaces/repositories/IJobRepository.js';
import type { IJobService } from '../interfaces/services/IJobService.js';
import type { JobDetails, JobSummary } from '../../domain/entities/Job.js';

export class JobService implements IJobService {
    constructor(private readonly jobRepository: IJobRepository) {}
    /**
     * searches for jobs based on the provided filtering criteria.
     * @param filters - The raw search criteria provided by the client.
     * @returns a promise that resolves to an array of matching job summaries.
     */
    async search(filters: JobSearchFilters): Promise<JobSummary[]> {
        return this.jobRepository.search({
            keyword: this.normalize(filters.keyword),
            location: this.normalize(filters.location),
            category: this.normalize(filters.category),
        });
    }

    /**
     * searches for a certain job
     * @param jobId - identifier for job
     * @returns a promise that resolves to a job or null
     */
    async getById(jobId: number): Promise<JobDetails | null> {
        return this.jobRepository.getById(jobId);
    }

    //NOTE - helper method to clean up inputs
    private normalize(value?: string): string | undefined {
        const trimmed = value?.trim();
        return trimmed || undefined;
    }
}