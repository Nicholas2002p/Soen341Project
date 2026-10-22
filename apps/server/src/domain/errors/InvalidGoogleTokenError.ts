export class InvalidGoogleTokenError extends Error {
    constructor(message = 'The Google token is invalid.') {
        super(message);
        this.name = 'InvalidGoogleTokenError';
    }
}
