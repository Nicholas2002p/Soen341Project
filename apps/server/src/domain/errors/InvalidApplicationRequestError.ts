// This file defines a custom error class for application requests with a missing or invalid body.
export class InvalidApplicationRequestError extends Error {
    constructor(message = 'jobId and resumeId are required and must be positive integers.') {
        super(message);
        this.name = 'InvalidApplicationRequestError';
    }
}
