export class InvalidAuthCredentialsError extends Error {
    constructor(message: string = 'Invalid email or password') {
        super(message);
        this.name = 'InvalidAuthCredentialsError';
    }
}