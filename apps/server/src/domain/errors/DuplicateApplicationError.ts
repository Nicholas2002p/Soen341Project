// This file defines a custom error class for a job seeker applying to the same job twice.
export class DuplicateApplicationError extends Error {
    constructor(message = 'You have already applied to this job.') {
        super(message);
        this.name = 'DuplicateApplicationError';
    }
}
