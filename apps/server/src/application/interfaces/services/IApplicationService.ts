import type { Application, ApplicationDetails, ApplicationStatus, ApplicationWithJob } from '../../../domain/entities/Application.js';
import type { PublicUser } from '../../../domain/entities/PublicUser.js';

export interface ApplyToJobData {
    jobId: number; // Job to apply to
    resumeId: number; // One of the user's resumes, submitted with the application
}

export interface IApplicationService {
    //apply to a job as a job seeker, returns the created application
    apply(user: PublicUser, data: ApplyToJobData): Promise<Application>;

    //list the applications of a job seeker
    listMine(userId: number): Promise<ApplicationWithJob[]>;

    //list the applications of a job seeker with their status history, optionally only those with one of the given statuses
    listHistory(userId: number, statuses?: ApplicationStatus[]): Promise<ApplicationDetails[]>;

    //get one application with its status history, for the applicant or the recruiter of the job
    getById(user: PublicUser, applicationId: number): Promise<ApplicationDetails>;

    //change the status of an application, only the recruiter who posted the job can do this
    updateStatus(user: PublicUser, applicationId: number, status: ApplicationStatus): Promise<Application>;

    //withdraw (delete) an application, only the applicant can do this
    withdraw(userId: number, applicationId: number): Promise<void>;

    //list the applications submitted to a job, only the recruiter who posted the job can do this
    listForJob(user: PublicUser, jobId: number): Promise<Application[]>;
}
