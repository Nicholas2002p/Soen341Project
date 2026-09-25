import path from 'node:path';

export type ResumeFileType = 'pdf' | 'doc' | 'docx';

// Maximum size of an uploaded resume (5 MB)
export const MAX_RESUME_SIZE_BYTES = 5 * 1024 * 1024;

const MIME_TYPES: Record<ResumeFileType, string> = {
    pdf: 'application/pdf',
    doc: 'application/msword',
    docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
};

// The first bytes of each file type. Checking them stops files that are only renamed (e.g. a .txt saved as .pdf).
const SIGNATURES: Record<ResumeFileType, number[]> = {
    pdf: [0x25, 0x50, 0x44, 0x46], // %PDF
    doc: [0xd0, 0xcf, 0x11, 0xe0], // Legacy Word document
    docx: [0x50, 0x4b, 0x03, 0x04], // ZIP archive used by .docx
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
    const matches = signature.every((byte, index) => content[index] === byte);

    return matches ? extension : null;
}

// Returns the file type of a stored resume based on its storage key.
export function getResumeFileType(storageKey: string): ResumeFileType {
    const extension = path.extname(storageKey).slice(1).toLowerCase();
    return isResumeFileType(extension) ? extension : 'pdf';
}

export function getResumeMimeType(fileType: ResumeFileType): string {
    return MIME_TYPES[fileType];
}
