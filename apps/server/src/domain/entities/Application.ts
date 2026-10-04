// This file defines the Application entity, which represents a job seeker applying to a job with one of their resumes.

// Possible statuses of an application. These match the ApplicationStatus enum in the database.
export enum ApplicationStatus {
    OnHold = 'onhold',
    Rejected = 'rejected',
    Accepted = 'accepted',
}

// Status given to every new application
export const INITIAL_APPLICATION_STATUS = ApplicationStatus.OnHold;

export interface Application {
    id: number; // Unique identifier for the application
    userId: number; // Job seeker who applied
    jobId: number; // Job that was applied to
    resumeId: number; // Resume that was submitted with the application
    status: ApplicationStatus; // Current status of the application
    appliedAt: Date; // Timestamp of when the application was submitted
    updatedAt: Date | null; // Timestamp of the last status change
}

// One entry in the history of an application's status
export interface ApplicationStatusChange {
    status: ApplicationStatus;
    changedAt: Date;
}

// Short job information shown with an application so the client does not need a second request
export interface ApplicationJobSummary {
    id: number;
    companyName: string;
    location: string | null;
    employmentType: string;
}

// An application together with the job it was submitted to
export interface ApplicationWithJob extends Application {
    job: ApplicationJobSummary;
}

// An application together with its full status history
export interface ApplicationDetails extends ApplicationWithJob {
    statusHistory: ApplicationStatusChange[];
}

// The job information needed to check if someone can apply to it or view its applications
export interface ApplicationJob {
    id: number;
    recruiterId: number; // Recruiter who posted the job
    deadline: Date | null; // Last day to apply, null if there is no deadline
}
