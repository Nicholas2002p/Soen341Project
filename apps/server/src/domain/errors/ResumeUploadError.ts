// This file defines a custom error class for uploads that could not be saved (storage or database failure).
// The original error is kept as the cause so it can be logged on the server without being sent to the client.
export class ResumeUploadError extends Error {
    constructor(message = 'The resume could not be saved. Please try again.', options?: ErrorOptions) {
        super(message, options);
        this.name = 'ResumeUploadError';
    }
}
