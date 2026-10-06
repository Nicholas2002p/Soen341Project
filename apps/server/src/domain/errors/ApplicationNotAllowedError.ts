// This file defines a custom error class for actions the user's role or ownership does not allow (e.g. a recruiter applying to a job).
export class ApplicationNotAllowedError extends Error {
    constructor(message = 'You are not allowed to perform this action on applications.') {
        super(message);
        this.name = 'ApplicationNotAllowedError';
    }
}
