// This file defines a custom error class for application or job ids in the URL that are not positive integers.
export class InvalidApplicationIdError extends Error {
    constructor(message = 'The id must be a positive integer.') {
        super(message);
        this.name = 'InvalidApplicationIdError';
    }
}
