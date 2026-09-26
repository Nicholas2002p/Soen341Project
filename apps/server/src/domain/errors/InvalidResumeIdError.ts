// This file defines a custom error class for resume ids in the URL that are not positive integers.
export class InvalidResumeIdError extends Error {
    constructor(message = 'The resume id must be a positive integer.') {
        super(message);
        this.name = 'InvalidResumeIdError';
    }
}
