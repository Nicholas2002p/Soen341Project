// This file defines a custom error class for resumes that cannot be deleted because they were used in an application.
export class ResumeInUseError extends Error {
    constructor(message = 'This resume was used in a job application and cannot be deleted.') {
        super(message);
        this.name = 'ResumeInUseError';
    }
}
