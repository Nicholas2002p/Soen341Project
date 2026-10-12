// This file defines the custom error classes used by the application API.
// Each error's message is written for users, so the controller can send it as it is.

// The application does not exist or the user is not allowed to see it
export class ApplicationNotFoundError extends Error {
    constructor(message = 'Application not found.') {
        super(message);
        this.name = 'ApplicationNotFoundError';
    }
}

// The user's role or ownership does not allow the action (e.g. a recruiter applying to a job)
export class ApplicationNotAllowedError extends Error {
    constructor(message = 'You are not allowed to perform this action on applications.') {
        super(message);
        this.name = 'ApplicationNotAllowedError';
    }
}

// A job seeker applied to the same job twice
export class DuplicateApplicationError extends Error {
    constructor(message = 'You have already applied to this job.') {
        super(message);
        this.name = 'DuplicateApplicationError';
    }
}

// An application or job id in the URL is not a positive integer
export class InvalidApplicationIdError extends Error {
    constructor(message = 'The id must be a positive integer.') {
        super(message);
        this.name = 'InvalidApplicationIdError';
    }
}

// The body of an application request is missing or invalid
export class InvalidApplicationRequestError extends Error {
    constructor(message = 'jobId and resumeId are required and must be positive integers.') {
        super(message);
        this.name = 'InvalidApplicationRequestError';
    }
}

// A status update has a missing, unknown or unchanged status
export class InvalidApplicationStatusError extends Error {
    constructor(message = 'status must be one of: Applied, Under_Review, Interview, Offered, Rejected.') {
        super(message);
        this.name = 'InvalidApplicationStatusError';
    }
}

// The deadline to apply to the job has passed
export class JobClosedError extends Error {
    constructor(message = 'The deadline to apply to this job has passed.') {
        super(message);
        this.name = 'JobClosedError';
    }
}

// The job does not exist
export class JobNotFoundError extends Error {
    constructor(message = 'Job not found.') {
        super(message);
        this.name = 'JobNotFoundError';
    }
}
