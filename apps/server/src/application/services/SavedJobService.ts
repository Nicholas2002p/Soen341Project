import type { ISavedJobRepository } from '../interfaces/repositories/ISavedJobRepository.js';
import type { ISavedJobService } from '../interfaces/services/ISavedJobService.js';
import type { IJobRepository } from '../interfaces/repositories/IJobRepository.js';
import type { JobSummary } from '../../domain/entities/Job.js';
import type { PublicUser } from '../../domain/entities/PublicUser.js';
import { UserRole } from '../../domain/entities/User.js';
import type { NotificationService } from './NotificationService.js';

export class SavedJobService implements ISavedJobService {
    constructor(
        private readonly savedJobRepository: ISavedJobRepository,
        private readonly jobRepository: Pick<IJobRepository, 'getById'>,
        private readonly notificationService?: Pick<NotificationService, 'create'>,
    ) { }

    /**
     * get the saved jobs of the logged in user
     * @param user - the current logged in user
     * @returns a promise that resolves to a list of job summaries
     */
    async getSavedJobs(user: PublicUser): Promise<JobSummary[]> {
        const jobs = await this.savedJobRepository.getByUserId(user.id);
        if (user.role !== UserRole.JobSeeker) {
            return jobs;
        }

        const reminderDays = this.getReminderDays();
        const now = Date.now();
        const reminderDeadline = now + reminderDays * 24 * 60 * 60 * 1000;

        await Promise.all(jobs
            .filter((job) => {
                const deadline = job.deadline.getTime();
                return deadline >= now && deadline <= reminderDeadline;
            })
            .map((job) => this.notificationService?.create(user.id, {
                type: 'deadline_reminder',
                title: 'Saved job deadline approaching',
                body: `${job.title} closes within ${reminderDays} day${reminderDays === 1 ? '' : 's'}.`,
                data: { jobId: String(job.jobId) },
            })));

        return jobs;
    }

    private getReminderDays(): number {
        const configuredDays = process.env.SAVED_JOB_DEADLINE_REMINDER_DAYS;
        if (configuredDays === undefined || configuredDays.trim() === '') {
            return 3;
        }

        const reminderDays = Number(configuredDays);
        if (!Number.isFinite(reminderDays) || reminderDays < 0) {
            throw new Error('SAVED_JOB_DEADLINE_REMINDER_DAYS must be a non-negative number.');
        }

        return reminderDays;
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