// This file defines a custom error class for handling cases where authentication credentials are invalid.
export class InvalidAuthCredentialsError extends Error {
    constructor(message = 'Invalid email or password') {
        super(message);
        this.name = 'InvalidAuthCredentialsError';
    }
}