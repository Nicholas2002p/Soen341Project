import { ApplicationStatus } from '../entities/Application.js';

// The statuses an application can move to from each status.
// Applications only move forward through the hiring process, and Offered and Rejected are final.
// Under_Review and Interview can be skipped (e.g. a recruiter can reject or make an offer right away).
const ALLOWED_STATUS_CHANGES: Record<ApplicationStatus, ApplicationStatus[]> = {
    [ApplicationStatus.Applied]: [
        ApplicationStatus.UnderReview,
        ApplicationStatus.Interview,
        ApplicationStatus.Offered,
        ApplicationStatus.Rejected,
    ],
    [ApplicationStatus.UnderReview]: [ApplicationStatus.Interview, ApplicationStatus.Offered, ApplicationStatus.Rejected],
    [ApplicationStatus.Interview]: [ApplicationStatus.Offered, ApplicationStatus.Rejected],
    [ApplicationStatus.Offered]: [],
    [ApplicationStatus.Rejected]: [],
};

// Check if an application can move from one status to another
export function canChangeStatus(from: ApplicationStatus, to: ApplicationStatus): boolean {
    return ALLOWED_STATUS_CHANGES[from].includes(to);
}
