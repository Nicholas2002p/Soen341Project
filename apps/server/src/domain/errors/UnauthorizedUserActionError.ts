export class UnauthorizedUserActionError extends Error {
    constructor(message = 'You are not authorized to modify this user.') {
        super(message);
        this.name = 'UnauthorizedUserActionError';
    }
}