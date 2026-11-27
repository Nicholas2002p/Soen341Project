export interface IPdfTextExtractionService {
    extractText(content: Buffer): Promise<string>;
}
