// This file defines a custom error class for resumes that do not exist or belong to another user.
export class ResumeNotFoundError extends Error {
    constructor(message = 'Resume not found.') {
        super(message);
        this.name = 'ResumeNotFoundError';
    }
}
