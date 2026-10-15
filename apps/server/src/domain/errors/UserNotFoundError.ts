export class UserNotFoundError extends Error {
    constructor(message = 'User not found.') {
        super(message);
        this.name = 'UserNotFoundError';
    }
}