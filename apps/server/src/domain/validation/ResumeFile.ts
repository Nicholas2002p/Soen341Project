import path from 'node:path';

export type ResumeFileType = 'pdf' | 'doc' | 'docx';

// Maximum size of an uploaded resume (5 MB)
export const MAX_RESUME_SIZE_BYTES = 5 * 1024 * 1024;

// MIME type sent in the Content-Type header when a resume is downloaded
// Source: https://developer.mozilla.org/en-US/docs/Web/HTTP/Guides/MIME_types/Common_types
const MIME_TYPES: Record<ResumeFileType, string> = {
    pdf: 'application/pdf',
    doc: 'application/msword',
    docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
};

// The first bytes of each file type. Checking them stops files that are only renamed (e.g. a .txt saved as .pdf).
// Sources: https://en.wikipedia.org/wiki/List_of_file_signatures
//          https://www.garykessler.net/library/file_sigs.html
const SIGNATURES: Record<ResumeFileType, number[]> = {
    pdf: [0x25, 0x50, 0x44, 0x46], // %PDF
    doc: [0xd0, 0xcf, 0x11, 0xe0], // Legacy Word document
    docx: [0x50, 0x4b, 0x03, 0x04], // ZIP archive used by .docx
};

// Text that must also appear inside the file. The signatures above are shared with other formats
// (.docx uses the ZIP signature, .doc uses the same signature as old Excel/PowerPoint files),
// so this makes sure the file is actually a Word document.
const REQUIRED_CONTENT: Record<ResumeFileType, Buffer[]> = {
    pdf: [],
    // Every .docx contains these entries. ZIP stores entry names as plain text, so they can be searched directly.
    docx: [Buffer.from('[Content_Types].xml'), Buffer.from('word/document.xml')],
    // Word .doc files contain a "WordDocument" stream. Stream names are stored as UTF-16LE.
    doc: [Buffer.from('WordDocument', 'utf16le')],
};

function isResumeFileType(value: string): value is ResumeFileType {
    return value in SIGNATURES;
}

// Returns the file type when both the extension and the file content match an allowed type, otherwise null.
export function detectResumeFileType(fileName: string, content: Buffer): ResumeFileType | null {
    const extension = path.extname(fileName).slice(1).toLowerCase();

    if (!isResumeFileType(extension)) {
        return null;
    }

    const signature = SIGNATURES[extension];
    const hasSignature = signature.every((byte, index) => content[index] === byte);
    const hasRequiredContent = REQUIRED_CONTENT[extension].every((text) => content.includes(text));

    return hasSignature && hasRequiredContent ? extension : null;
}

// Returns the file type of a stored resume based on its storage key, or null if the extension is not an allowed type.
export function getResumeFileType(storageKey: string): ResumeFileType | null {
    const extension = path.extname(storageKey).slice(1).toLowerCase();
    return isResumeFileType(extension) ? extension : null;
}

export function getResumeMimeType(fileType: ResumeFileType): string {
    return MIME_TYPES[fileType];
}
