import type {
    Application,
    ApplicationDetails,
    ApplicationJob,
    ApplicationStatus,
    ApplicationStatusChange,
    ApplicationWithJob,
} from '../../../domain/entities/Application.js';

export interface CreateApplicationData {
    userId: number; // Job seeker who is applying
    jobId: number; // Job being applied to
    resumeId: number; // Resume submitted with the application
    status: ApplicationStatus; // Starting status, also saved as the first status history entry
}

export interface IApplicationRepository {
    //create an application and its first status history entry, throws DuplicateApplicationError if the user already applied
    create(data: CreateApplicationData): Promise<Application>;

    //find an application by its id, returns null if not found
    getById(id: number): Promise<ApplicationWithJob | null>;

    //find the application of a user for a job, returns null if they have not applied
    getByUserAndJob(userId: number, jobId: number): Promise<Application | null>;

    //list all applications of a job seeker, newest first
    listByUserId(userId: number): Promise<ApplicationWithJob[]>;

    //list the applications of a job seeker with their status history, newest first.
    //When statuses is given, only applications whose current status is in the list are returned.
    listHistoryByUserId(userId: number, statuses?: ApplicationStatus[]): Promise<ApplicationDetails[]>;

    //list all applications submitted to a job, newest first
    listByJobId(jobId: number): Promise<Application[]>;

    //change the status of an application and add the change to its status history, returns the updated application
    updateStatus(id: number, status: ApplicationStatus): Promise<Application>;

    //get the status history of an application, oldest first
    getStatusHistory(applicationId: number): Promise<ApplicationStatusChange[]>;

    //delete an application and its status history
    delete(id: number): Promise<void>;

    //find the job information needed to apply or review applications, returns null if the job does not exist
    getJob(jobId: number): Promise<ApplicationJob | null>;
}
