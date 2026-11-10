import type { ISavedJobRepository } from '../interfaces/repositories/ISavedJobRepository.js';
import type { ISavedJobService } from '../interfaces/services/ISavedJobService.js';
import type { IJobRepository } from '../interfaces/repositories/IJobRepository.js';
import type { JobSummary } from '../../domain/entities/Job.js';
import type { PublicUser } from '../../domain/entities/PublicUser.js';

export class SavedJobService implements ISavedJobService {
    constructor(
        private readonly savedJobRepository: ISavedJobRepository,
        private readonly jobRepository: IJobRepository,
    ) { }

    /**
     * get the saved jobs of the logged in user
     * @param user - the current logged in user
     * @returns a promise that resolves to a list of job summaries
     */
    async getSavedJobs(user: PublicUser): Promise<JobSummary[]> {
        return this.savedJobRepository.getByUserId(user.id);
    }

    /**
     * saves a job for the logged in user
     * @param user - the current logged in user
     * @param jobId - id of a job to save
     * @returns a promise that will resolve to a boolean
     */
    async saveJob(user: PublicUser, jobId: number): Promise<boolean> {
        const job = await this.jobRepository.getById(jobId);

        if (!job) {
            return false;
        }

        const alreadySaved = await this.savedJobRepository.exists(user.id, jobId);

        if (alreadySaved) {
            throw new Error('Job is already saved.');
        }

        return this.savedJobRepository.save(user.id, jobId);
    }

    /**
     * removes a saved job for the logged in user
     * @param user - the current logged in user
     * @param jobId - id of a job to remove
     * @returns a promise that will resolve to a boolean
     */
    async removeSavedJob(user: PublicUser, jobId: number): Promise<boolean> {
        return this.savedJobRepository.remove(user.id, jobId);
    }
}