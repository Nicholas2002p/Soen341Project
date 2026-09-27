// This file defines a custom error class for resumes whose record exists but whose file is missing from storage.
export class ResumeFileMissingError extends Error {
    constructor(message = 'The resume file could not be found.', options?: ErrorOptions) {
        super(message, options);
        this.name = 'ResumeFileMissingError';
    }
}
