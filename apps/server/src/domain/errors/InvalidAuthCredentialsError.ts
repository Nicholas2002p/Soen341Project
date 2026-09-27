// This file defines a custom error class for handling cases where authentication credentials are invalid.
export class InvalidAuthCredentialsError extends Error {
    constructor(message = 'The email address or password is incorrect.') {
        super(message);
        this.name = 'InvalidAuthCredentialsError';
    }
}