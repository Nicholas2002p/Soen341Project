import assert from 'node:assert/strict';
import test from 'node:test';
import { PdfTextExtractionService } from '../../src/application/services/PdfTextExtractionService.js';
import { PdfTextExtractionError } from '../../src/domain/errors/PdfTextExtractionError.js';

function createPdf(content: string): Buffer {
    const objects = [
        '1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj',
        '2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj',
        '3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Resources << /Font << /F1 4 0 R >> >> /Contents 5 0 R >>\nendobj',
        '4 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>\nendobj',
        `5 0 obj\n<< /Length ${content.length} >>\nstream\n${content}\nendstream\nendobj`,
    ];
    const header = '%PDF-1.4\n';
    const body = objects.map((object) => `${object}\n`).join('');
    const objectOffsets: number[] = [];
    let offset = header.length;

    for (const object of objects) {
        objectOffsets.push(offset);
        offset += object.length + 1;
    }

    const xrefOffset = offset;
    const xref = [
        'xref',
        `0 ${objects.length + 1}`,
        '0000000000 65535 f ',
        ...objectOffsets.map((objectOffset) => `${objectOffset.toString().padStart(10, '0')} 00000 n `),
        'trailer',
        `<< /Size ${objects.length + 1} /Root 1 0 R >>`,
        'startxref',
        `${xrefOffset}`,
        '%%EOF',
    ].join('\n');

    return Buffer.from(`${header}${body}${xref}\n`);
}

test('extracts text from a PDF in page order', async () => {
    const service = new PdfTextExtractionService();
    const pdf = createPdf('BT /F1 12 Tf 72 720 Td (Hello PDF) Tj ET');

    await assert.doesNotReject(async () => {
        assert.equal(await service.extractText(pdf), 'Hello PDF');
    });
});

test('reports invalid PDF content as a text extraction error', async () => {
    const service = new PdfTextExtractionService();

    await assert.rejects(service.extractText(Buffer.from('not a PDF')), PdfTextExtractionError);
});

test('rejects empty PDF content', async () => {
    const service = new PdfTextExtractionService();

    await assert.rejects(service.extractText(Buffer.alloc(0)), (error: unknown) => (
        error instanceof PdfTextExtractionError && error.message === 'A PDF file is required.'
    ));
});
