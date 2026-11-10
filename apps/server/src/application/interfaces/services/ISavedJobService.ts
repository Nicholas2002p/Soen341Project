import type { JobSummary } from '../../../domain/entities/Job.js';
import type { PublicUser } from '../../../domain/entities/PublicUser.js';

export interface ISavedJobService {
    /**
     * get the saved jobs of the logged in user
     * @param user - the current logged in user
     * @returns a promise that resolves to a list of job summaries
     */
    getSavedJobs(user: PublicUser): Promise<JobSummary[]>;

    /**
     * saves a job for the logged in user
     * @param user - the current logged in user
     * @param jobId - id of a job to save
     * @returns a promise that will resolve to a boolean
     */
    saveJob(user: PublicUser, jobId: number): Promise<boolean>;

    /**
     * removes a saved job for the logged in user
     * @param user - the current logged in user
     * @param jobId - id of a job to remove
     * @returns a promise that will resolve to a boolean
     */
    removeSavedJob(user: PublicUser, jobId: number): Promise<boolean>;
}