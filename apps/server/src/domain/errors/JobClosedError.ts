// This file defines a custom error class for applying to a job after its deadline.
export class JobClosedError extends Error {
    constructor(message = 'The deadline to apply to this job has passed.') {
        super(message);
        this.name = 'JobClosedError';
    }
}
