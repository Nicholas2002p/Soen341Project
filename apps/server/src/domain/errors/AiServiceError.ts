export class AiServiceError extends Error {
    constructor(message = 'The AI service could not generate a response.', options?: ErrorOptions) {
        super(message, options);
        this.name = 'AiServiceError';
    }
}
