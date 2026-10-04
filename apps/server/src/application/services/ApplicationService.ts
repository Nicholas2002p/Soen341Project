import type { ApplyToJobData, IApplicationService } from '../interfaces/services/IApplicationService.js';
import type { IApplicationRepository } from '../interfaces/repositories/IApplicationRepository.js';
import type { IResumeRepository } from '../interfaces/repositories/IResumeRepository.js';
import type { Application, ApplicationDetails, ApplicationJob, ApplicationStatus, ApplicationWithJob } from '../../domain/entities/Application.js';
import { INITIAL_APPLICATION_STATUS } from '../../domain/entities/Application.js';
import type { PublicUser } from '../../domain/entities/PublicUser.js';
import { UserRole } from '../../domain/entities/User.js';
import { ApplicationNotFoundError } from '../../domain/errors/ApplicationNotFoundError.js';
import { ApplicationNotAllowedError } from '../../domain/errors/ApplicationNotAllowedError.js';
import { DuplicateApplicationError } from '../../domain/errors/DuplicateApplicationError.js';
import { InvalidApplicationStatusError } from '../../domain/errors/InvalidApplicationStatusError.js';
import { JobClosedError } from '../../domain/errors/JobClosedError.js';
import { JobNotFoundError } from '../../domain/errors/JobNotFoundError.js';
import { ResumeNotFoundError } from '../../domain/errors/ResumeNotFoundError.js';

export class ApplicationService implements IApplicationService {
    constructor(
        private readonly applicationRepository: IApplicationRepository,
        private readonly resumeRepository: IResumeRepository,
    ) {}

    // Retrieve a job, throws JobNotFoundError ("Job not found.") if it does not exist
    private async getJob(jobId: number): Promise<ApplicationJob> {
        const job = await this.applicationRepository.getJob(jobId);

        if (!job) {
            throw new JobNotFoundError();
        }

        return job;
    }

    //apply to a job as a job seeker, returns the created application
    async apply(user: PublicUser, data: ApplyToJobData): Promise<Application> {
        // Only job seekers apply to jobs, recruiters and admins review them
        if (user.role !== UserRole.JobSeeker) {
            throw new ApplicationNotAllowedError('Only job seekers can apply to jobs.');
        }

        const job = await this.getJob(data.jobId);

        // A job without a deadline stays open
        if (job.deadline && job.deadline.getTime() < Date.now()) {
            throw new JobClosedError();
        }

        // The resume must be one of the applicant's own resumes
        const resume = await this.resumeRepository.getById(data.resumeId);
        if (!resume || resume.userId !== user.id) {
            throw new ResumeNotFoundError();
        }

        // Give a clear error before hitting the database's one-application-per-job rule
        if (await this.applicationRepository.getByUserAndJob(user.id, data.jobId)) {
            throw new DuplicateApplicationError();
        }

        return this.applicationRepository.create({
            userId: user.id,
            jobId: data.jobId,
            resumeId: data.resumeId,
            status: INITIAL_APPLICATION_STATUS,
        });
    }

    //list the applications of a job seeker
    async listMine(userId: number): Promise<ApplicationWithJob[]> {
        return this.applicationRepository.listByUserId(userId);
    }

    //get one application with its status history, for the applicant or the recruiter of the job.
    //Anyone else gets ApplicationNotFoundError so the API does not reveal which application ids exist.
    async getById(user: PublicUser, applicationId: number): Promise<ApplicationDetails> {
        const application = await this.applicationRepository.getById(applicationId);

        if (!application) {
            throw new ApplicationNotFoundError();
        }

        if (application.userId !== user.id) {
            const job = await this.applicationRepository.getJob(application.jobId);

            if (!job || job.recruiterId !== user.id) {
                throw new ApplicationNotFoundError();
            }
        }

        const statusHistory = await this.applicationRepository.getStatusHistory(applicationId);
        return { ...application, statusHistory };
    }

    //change the status of an application, only the recruiter who posted the job can do this.
    //The applicant gets ApplicationNotAllowedError (they can see the application but not change it),
    //anyone else gets ApplicationNotFoundError.
    async updateStatus(user: PublicUser, applicationId: number, status: ApplicationStatus): Promise<Application> {
        const application = await this.applicationRepository.getById(applicationId);

        if (!application) {
            throw new ApplicationNotFoundError();
        }

        const job = await this.applicationRepository.getJob(application.jobId);

        if (!job || job.recruiterId !== user.id) {
            if (application.userId === user.id) {
                throw new ApplicationNotAllowedError('Only the recruiter who posted this job can change the status of an application.');
            }
            throw new ApplicationNotFoundError();
        }

        // Saving the same status again would only add a duplicate entry to the history
        if (application.status === status) {
            throw new InvalidApplicationStatusError('The application already has this status.');
        }

        return this.applicationRepository.updateStatus(applicationId, status);
    }

    //withdraw (delete) an application, only the applicant can do this
    async withdraw(userId: number, applicationId: number): Promise<void> {
        const application = await this.applicationRepository.getById(applicationId);

        if (!application || application.userId !== userId) {
            throw new ApplicationNotFoundError();
        }

        await this.applicationRepository.delete(applicationId);
    }

    //list the applications submitted to a job, only the recruiter who posted the job can do this
    async listForJob(user: PublicUser, jobId: number): Promise<Application[]> {
        const job = await this.getJob(jobId);

        // Jobs are public, so saying the job exists is fine, but its applicants are only for its recruiter
        if (job.recruiterId !== user.id) {
            throw new ApplicationNotAllowedError('Only the recruiter who posted this job can view its applications.');
        }

        return this.applicationRepository.listByJobId(jobId);
    }
}
