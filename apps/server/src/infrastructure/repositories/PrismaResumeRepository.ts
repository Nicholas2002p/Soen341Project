import type { PrismaClient } from '../../generated/prisma/client.js';
import type { Resume as PrismaResume } from '../../generated/prisma/client.js';
import type { CreateResumeData, IResumeRepository } from '../../application/interfaces/repositories/IResumeRepository.js';
import type { Resume } from '../../domain/entities/Resume.js';
import { getResumeFileType } from '../../domain/validation/ResumeFile.js';

export class PrismaResumeRepository implements IResumeRepository {
    constructor(private readonly prisma: PrismaClient) {}

    // Convert a Prisma Resume record to a domain Resume entity.
    // The fileURL column holds the storage key of the file.
    private toDomainResume(record: PrismaResume): Resume {
        const storageKey = record.fileURL ?? '';
        const fileType = getResumeFileType(storageKey);

        // Every stored resume is saved with a pdf, doc or docx extension, so anything else means the record is corrupted
        if (!fileType) {
            throw new Error(`Resume ${record.resumeId} has an invalid storage key: "${storageKey}"`);
        }

        return {
            id: record.resumeId,
            userId: record.userId,
            fileName: record.fileName,
            storageKey,
            fileType,
            createdAt: record.createdAt,
        };
    }

    // Create a new resume record
    async create(data: CreateResumeData): Promise<Resume> {
        const resume = await this.prisma.resume.create({
            data: {
                userId: data.userId,
                fileName: data.fileName,
                fileURL: data.storageKey,
            },
        });

        return this.toDomainResume(resume);
    }

    // Find a resume by its ID, returns null if not found
    async getById(id: number): Promise<Resume | null> {
        const resume = await this.prisma.resume.findUnique({
            where: { resumeId: id },
        });

        return resume ? this.toDomainResume(resume) : null;
    }

    // List all resumes of a user, newest first
    async listByUserId(userId: number): Promise<Resume[]> {
        const resumes = await this.prisma.resume.findMany({
            where: { userId },
            orderBy: { createdAt: 'desc' },
        });

        return resumes.map((resume) => this.toDomainResume(resume));
    }

    // Delete a resume record
    async delete(id: number): Promise<void> {
        await this.prisma.resume.delete({
            where: { resumeId: id },
        });
    }

    // Check if a resume was used in at least one job application
    async isUsedInApplication(id: number): Promise<boolean> {
        const applications = await this.prisma.application.count({
            where: { resumeId: id },
        });

        return applications > 0;
    }
}
