import type { JobSummary } from '../../../domain/entities/Job.js';

export interface ISavedJobRepository {
    /**
     * get all the saved jobs by the logged in user
     * @param userId - Id of current logged in user
     * @returns a promise that will resolve to a list of job summaries
     */
    getByUserId(userId: number): Promise<JobSummary[]>;

    /**
     * saves a job by the given id for the current user
     * @param userId - Id of current logged in user
     * @param jobId - Id of job to save
     * @returns a promise that will resolve to a boolean
     */
    save(userId: number, jobId: number): Promise<boolean>;

    /**
     * removes a saved job of the user
     * @param userId - Id of current logged in user
     * @param jobId - Id of job to remove from save
     * @returns a promise that will resolve to a boolean
     */
    remove(userId: number, jobId: number): Promise<boolean>;

    /**
     * checks if the user already saved this job
     * @param userId - Id of current logged in user
     * @param jobId - Id of job to check if the user has saved
     * @returns a promise that will resolve to a boolean
     */
    exists(userId: number, jobId: number): Promise<boolean>;
}