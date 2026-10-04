// This file defines a custom error class for jobs that do not exist.
export class JobNotFoundError extends Error {
    constructor(message = 'Job not found.') {
        super(message);
        this.name = 'JobNotFoundError';
    }
}
