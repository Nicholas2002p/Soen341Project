import type {
    CreateJobData,
    JobSearchFilters,
    UpdateJobData,
} from '../repositories/IJobRepository.js';
import type { JobDetails, JobSummary } from '../../../domain/entities/Job.js';
import type { PublicUser } from '../../../domain/entities/PublicUser.js';

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

    /**
     * searches for available jobs 
     * @returns a promise that resolves to a job array
     */
    getAvailable(): Promise<JobSummary[]>;

    /**
     * searches for expired jobs
     * @returns a promise that resolves to a job array
     */
    getExpired(): Promise<JobSummary[]>;

    /**
     * retrieves all of the current recruiter's jobs
     * @param user - the current logged in recruiter
     * @returns a promise that resolves to a job array
     */
    getMine(user: PublicUser): Promise<JobSummary[]>;

    /**
     * creates a new job
     * @param user - the current logged in recruiter
     * @param data - data to create a new promise
     * @returns a promise that resolves to a job
     */
    create(user: PublicUser, data: Omit<CreateJobData, 'recruiterId'>): Promise<JobDetails>;

    /**
     * updates an existing job
     * @param user - the current logged in recruiter
     * @param jobId - the id of the job to update
     * @param data - the data for update
     * @returns a promise that resolves to a job or null
     */
    update(user: PublicUser, jobId: number, data: UpdateJobData): Promise<JobDetails | null>;

    /**
     * deletes an existing job
     * @param user - the current logged in recruiter
     * @param jobId - the id of the job to delete
     * @returns a promise that resolves to a boolean
     */
    delete(user: PublicUser, jobId: number): Promise<boolean>;
}