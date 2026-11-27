export class PdfTextExtractionError extends Error {
    constructor(message = 'The PDF text could not be extracted.', options?: ErrorOptions) {
        super(message, options);
        this.name = 'PdfTextExtractionError';
    }
}
