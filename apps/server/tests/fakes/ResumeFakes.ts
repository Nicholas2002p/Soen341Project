import type { IFileStorage } from '../../src/application/interfaces/infrastructure/IFileStorage.js';
import type { CreateResumeData, IResumeRepository } from '../../src/application/interfaces/repositories/IResumeRepository.js';
import type { Resume } from '../../src/domain/entities/Resume.js';
import { getResumeFileType } from '../../src/domain/validation/ResumeFile.js';

const zipSignature = Buffer.from([0x50, 0x4b, 0x03, 0x04]);
const oleSignature = Buffer.from([0xd0, 0xcf, 0x11, 0xe0, 0xa1, 0xb1, 0x1a, 0xe1]);

// Minimal file contents that look like each file type
export const pdfContent = Buffer.from('%PDF-1.4 test resume');
export const docxContent = Buffer.concat([zipSignature, Buffer.from('[Content_Types].xml ... word/document.xml')]);
export const docContent = Buffer.concat([oleSignature, Buffer.from('WordDocument', 'utf16le')]);
export const textContent = Buffer.from('just some plain text');

// Files that have a valid signature but are not Word documents
export const zipContent = Buffer.concat([zipSignature, Buffer.from('notes.txt photo.png')]); // plain .zip
export const excelContent = Buffer.concat([oleSignature, Buffer.from('Workbook', 'utf16le')]); // old .xls

export const resume: Resume = {
    id: 1,
    userId: 1,
    fileName: 'resume.pdf',
    storageKey: 'stored-resume.pdf',
    fileType: 'pdf',
    createdAt: new Date('2026-01-01'),
};

// In-memory resume repository used to isolate service tests from Prisma.
export class FakeResumeRepository implements IResumeRepository {
    resumes = new Map<number, Resume>();
    resumesUsedInApplications = new Set<number>();
    failOnCreate = false;
    failOnGetById = false;
    private nextId = 1;

    constructor(initialResumes: Resume[] = []) {
        for (const initialResume of initialResumes) {
            this.resumes.set(initialResume.id, initialResume);
            this.nextId = Math.max(this.nextId, initialResume.id + 1);
        }
    }

    async create(data: CreateResumeData): Promise<Resume> {
        if (this.failOnCreate) {
            throw new Error('Database unavailable');
        }

        const fileType = getResumeFileType(data.storageKey);
        if (!fileType) {
            throw new Error('Invalid storage key');
        }

        const createdResume = { id: this.nextId++, createdAt: new Date(), fileType, ...data };
        this.resumes.set(createdResume.id, createdResume);
        return createdResume;
    }

    async getById(id: number): Promise<Resume | null> {
        if (this.failOnGetById) {
            throw new Error('Database unavailable');
        }
        return this.resumes.get(id) ?? null;
    }

    async listByUserId(userId: number): Promise<Resume[]> {
        return [...this.resumes.values()].filter((storedResume) => storedResume.userId === userId);
    }

    async delete(id: number): Promise<void> {
        this.resumes.delete(id);
    }

    async isUsedInApplication(id: number): Promise<boolean> {
        return this.resumesUsedInApplications.has(id);
    }
}

// In-memory file storage used to verify which files are saved and deleted.
export class FakeFileStorage implements IFileStorage {
    files = new Map<string, Buffer>();
    failOnSave = false;
    private nextKey = 1;

    constructor(initialFiles: Record<string, Buffer> = {}) {
        for (const [storageKey, content] of Object.entries(initialFiles)) {
            this.files.set(storageKey, content);
        }
    }

    async save(content: Buffer, extension: string): Promise<string> {
        if (this.failOnSave) {
            throw new Error('Disk full');
        }

        const storageKey = `file-${this.nextKey++}.${extension}`;
        this.files.set(storageKey, content);
        return storageKey;
    }

    async read(storageKey: string): Promise<Buffer> {
        const content = this.files.get(storageKey);
        if (!content) {
            // Same error code Node uses when a file does not exist
            throw Object.assign(new Error('File not found'), { code: 'ENOENT' });
        }
        return content;
    }

    async delete(storageKey: string): Promise<void> {
        this.files.delete(storageKey);
    }
}
