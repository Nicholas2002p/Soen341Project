import type { IFileStorage } from '../../src/application/interfaces/infrastructure/IFileStorage.js';
import type { CreateResumeData, IResumeRepository } from '../../src/application/interfaces/repositories/IResumeRepository.js';
import type { Resume } from '../../src/domain/entities/Resume.js';

// Minimal file contents that start with the signature of each file type
export const pdfContent = Buffer.from('%PDF-1.4 test resume');
export const docxContent = Buffer.from([0x50, 0x4b, 0x03, 0x04, 0x14, 0x00]);
export const textContent = Buffer.from('just some plain text');

export const resume: Resume = {
    id: 1,
    userId: 1,
    fileName: 'resume.pdf',
    storageKey: 'stored-resume.pdf',
    createdAt: new Date('2026-01-01'),
};

// In-memory resume repository used to isolate service tests from Prisma.
export class FakeResumeRepository implements IResumeRepository {
    resumes = new Map<number, Resume>();
    resumesUsedInApplications = new Set<number>();
    failOnCreate = false;
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

        const createdResume = { id: this.nextId++, createdAt: new Date(), ...data };
        this.resumes.set(createdResume.id, createdResume);
        return createdResume;
    }

    async getById(id: number): Promise<Resume | null> {
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
    private nextKey = 1;

    constructor(initialFiles: Record<string, Buffer> = {}) {
        for (const [storageKey, content] of Object.entries(initialFiles)) {
            this.files.set(storageKey, content);
        }
    }

    async save(content: Buffer, extension: string): Promise<string> {
        const storageKey = `file-${this.nextKey++}.${extension}`;
        this.files.set(storageKey, content);
        return storageKey;
    }

    async read(storageKey: string): Promise<Buffer> {
        const content = this.files.get(storageKey);
        if (!content) {
            throw new Error('File not found');
        }
        return content;
    }

    async delete(storageKey: string): Promise<void> {
        this.files.delete(storageKey);
    }
}
