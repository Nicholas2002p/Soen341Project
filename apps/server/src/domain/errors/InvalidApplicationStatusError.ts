// This file defines a custom error class for status updates with a missing, unknown or unchanged status.
export class InvalidApplicationStatusError extends Error {
    constructor(message = 'status must be one of: Applied, Under_Review, Interview, Offered, Rejected.') {
        super(message);
        this.name = 'InvalidApplicationStatusError';
    }
}
