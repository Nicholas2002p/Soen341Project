// This file defines a custom error class for uploaded files that are not an accepted resume format.
export class InvalidResumeFileError extends Error {
    constructor(message = 'Resumes must be a PDF, DOC or DOCX file.') {
        super(message);
        this.name = 'InvalidResumeFileError';
    }
}
