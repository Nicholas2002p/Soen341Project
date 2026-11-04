import type { CreateJobData, IJobRepository, JobSearchFilters, UpdateJobData } from '../interfaces/repositories/IJobRepository.js';
import type { IJobService } from '../interfaces/services/IJobService.js';
import type { JobDetails, JobSummary } from '../../domain/entities/Job.js';
import type { PublicUser } from '../../domain/entities/PublicUser.js';
import { UserRole } from '../../domain/entities/User.js';

export class JobService implements IJobService {
    constructor(private readonly jobRepository: IJobRepository) { }
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
        available: filters.available,
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

    /**
     * searches for available jobs 
     * @returns a promise that resolves to a job array
     */
    async getAvailable(): Promise<JobSummary[]> {
        return this.jobRepository.getAvailable();
    }

    /**
     * searches for expired jobs
     * @returns a promise that resolves to a job array
     */
    async getExpired(): Promise<JobSummary[]> {
        return this.jobRepository.getExpired();
    }

    /**
     * retrieves all of the current recruiter's jobs
     * @param user - the current logged in recruiter
     * @returns a promise that resolves to a job array
     */
    async getMine(user: PublicUser): Promise<JobSummary[]> {
        this.requireRecruiter(user);
        return this.jobRepository.getByRecruiterId(user.id);
    }

    /**
     * creates a new job
     * @param user - the current logged in recruiter
     * @param data - data to create a new promise
     * @returns a promise that resolves to a job
     */
    async create(
        user: PublicUser,
        data: Omit<CreateJobData, 'recruiterId'>,
    ): Promise<JobDetails> {
        this.requireRecruiter(user);

        return this.jobRepository.create({
            ...data,
            recruiterId: user.id,
        });
    }

    /**
     * updates an existing job
     * @param user - the current logged in recruiter
     * @param jobId - the id of the job to update
     * @param data - the data for update
     * @returns a promise that resolves to a job or null
     */
    async update(
        user: PublicUser,
        jobId: number,
        data: UpdateJobData,
    ): Promise<JobDetails | null> {
        this.requireRecruiter(user);

        const job = await this.jobRepository.getById(jobId);

        if (!job) {
            return null;
        }

        if (job.recruiterId !== user.id) {
            throw new Error('You can only update your own job postings.');
        }

        return this.jobRepository.update(jobId, data);
    }

    /**
     * deletes an existing job
     * @param user - the current logged in recruiter
     * @param jobId - the id of the job to delete
     * @returns a promise that resolves to a boolean
     */
    async delete(user: PublicUser, jobId: number): Promise<boolean> {
        this.requireRecruiter(user);

        const job = await this.jobRepository.getById(jobId);

        if (!job) {
            return false;
        }

        if (job.recruiterId !== user.id) {
            throw new Error('You can only delete your own job postings.');
        }

        return this.jobRepository.delete(jobId);
    }

    //NOTE - helper method to clean up inputs
    private normalize(value?: string): string | undefined {
        const trimmed = value?.trim();
        return trimmed || undefined;
    }

    //NOTE - helper method to check for recruiter
    private requireRecruiter(user: PublicUser): void {
        if (user.role !== UserRole.Recruiter) {
            throw new Error('Only recruiters can manage job postings.');
        }
    }
}