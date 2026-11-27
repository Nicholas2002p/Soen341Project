import { getDocument } from 'pdfjs-dist/legacy/build/pdf.mjs';
import type { IPdfTextExtractionService } from '../interfaces/services/IPdfTextExtractionService.js';
import { PdfTextExtractionError } from '../../domain/errors/PdfTextExtractionError.js';

export class PdfTextExtractionService implements IPdfTextExtractionService {
    async extractText(content: Buffer): Promise<string> {
        if (content.length === 0) {
            throw new PdfTextExtractionError('A PDF file is required.');
        }

        const loadingTask = getDocument({
            data: new Uint8Array(content),
            useWorkerFetch: false,
        });
        try {
            const document = await loadingTask.promise;
            const pages: string[] = [];

            for (let pageNumber = 1; pageNumber <= document.numPages; pageNumber += 1) {
                const page = await document.getPage(pageNumber);
                const textContent = await page.getTextContent();
                const pageText = textContent.items
                    .map((item) => ('str' in item ? item.str : ''))
                    .join(' ')
                    .replace(/\s+/g, ' ')
                    .trim();

                if (pageText) {
                    pages.push(pageText);
                }
            }

            return pages.join('\n\n');
        } catch (error) {
            if (error instanceof PdfTextExtractionError) {
                throw error;
            }

            throw new PdfTextExtractionError(undefined, { cause: error });
        } finally {
            await loadingTask.destroy();
        }
    }
}
