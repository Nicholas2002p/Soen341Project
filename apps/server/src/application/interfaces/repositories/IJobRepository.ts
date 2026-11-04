import type { JobDetails, JobSummary } from '../../../domain/entities/Job.js';
import type { EmploymentType } from '../../../domain/entities/EmploymentType.js';

export interface JobSearchFilters {
    keyword?: string;
    location?: string;
    category?: string;
    available?: boolean;
}

export interface CreateJobData {
    companyId: number;
    recruiterId: number;
    title: string;
    category: string;
    location?: string | null;
    description?: string | null;
    salary: number;
    employmentType: EmploymentType;
    deadline: Date;
}

export interface UpdateJobData {
    title: string;
    category: string;
    location?: string | null;
    description?: string | null;
    salary: number;
    employmentType: EmploymentType;
    deadline: Date;
}


export interface IJobRepository {
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
     * 
     * @param recruiterId - the recruiter that creates the job
     * @returns a promise that resolves to a job
     */
    getByRecruiterId(recruiterId: number): Promise<JobSummary[]>;

    /**
     * creates a new job entity
     * @param data - necessary data for the creation of a job entity
     * @returns a promise that resolves to a job
     */
    create(data: CreateJobData): Promise<JobDetails>;

    /**
     * updates an existing job
     * @param jobId - the job id to update
     * @param data - necessary data for updating a job entity
     * @returns a promise that resolves to a job or null
     */
    update(jobId: number, data: UpdateJobData): Promise<JobDetails | null>;

    /**
     * deletes a job
     * @param jobId - the job id to delete
     * @returns a promise that resolves to a boolean
     */
    delete(jobId: number): Promise<boolean>;
}