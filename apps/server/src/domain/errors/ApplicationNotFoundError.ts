// This file defines a custom error class for applications that do not exist or that the user is not allowed to see.
export class ApplicationNotFoundError extends Error {
    constructor(message = 'Application not found.') {
        super(message);
        this.name = 'ApplicationNotFoundError';
    }
}
