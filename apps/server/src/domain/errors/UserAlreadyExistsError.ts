// This file defines a custom error class for handling cases where a user already exists in the system.
export class UserAlreadyExistsError extends Error {
    constructor(message = 'An account with this email address already exists.') {
        super(message);
        this.name = 'UserAlreadyExists';
    }
}