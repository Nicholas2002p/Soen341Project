import path from 'node:path';
import type { IResumeService, ResumeFile, ResumeUpload } from '../interfaces/services/IResumeService.js';
import type { IResumeRepository } from '../interfaces/repositories/IResumeRepository.js';
import type { IFileStorage } from '../interfaces/infrastructure/IFileStorage.js';
import type { PublicResume, Resume } from '../../domain/entities/Resume.js';
import { detectResumeFileType, getResumeFileType, getResumeMimeType } from '../../domain/validation/ResumeFile.js';
import { InvalidResumeFileError } from '../../domain/errors/InvalidResumeFileError.js';
import { ResumeNotFoundError } from '../../domain/errors/ResumeNotFoundError.js';
import { ResumeInUseError } from '../../domain/errors/ResumeInUseError.js';

// Matches the VarChar(255) limit of Resume.fileName in the database
const MAX_FILE_NAME_LENGTH = 255;

export class ResumeService implements IResumeService {
    constructor(
        private readonly resumeRepository: IResumeRepository,
        private readonly fileStorage: IFileStorage,
    ) {}

    // Convert a Resume entity to a PublicResume by omitting the storage key
    private toPublicResume(resume: Resume): PublicResume {
        return {
            id: resume.id,
            fileName: resume.fileName,
            fileType: getResumeFileType(resume.storageKey),
            createdAt: resume.createdAt,
        };
    }

    // Find a resume that belongs to the user. Resumes of other users are reported as not found
    // so that the API does not reveal which resume ids exist.
    private async getOwnedResume(userId: number, resumeId: number): Promise<Resume> {
        const resume = await this.resumeRepository.getById(resumeId);

        if (!resume || resume.userId !== userId) {
            throw new ResumeNotFoundError();
        }

        return resume;
    }

    //upload a resume for a user, returns the created resume
    async upload(userId: number, file: ResumeUpload): Promise<PublicResume> {
        const fileName = path.basename(file.originalName).trim().slice(0, MAX_FILE_NAME_LENGTH);
        const fileType = detectResumeFileType(fileName, file.content);

        if (!fileType) {
            throw new InvalidResumeFileError();
        }

        const storageKey = await this.fileStorage.save(file.content, fileType);

        try {
            const resume = await this.resumeRepository.create({ userId, fileName, storageKey });
            return this.toPublicResume(resume);
        } catch (error) {
            // Remove the stored file so it is not left behind without a database record
            await this.fileStorage.delete(storageKey);
            throw error;
        }
    }

    //list all resumes of a user
    async list(userId: number): Promise<PublicResume[]> {
        const resumes = await this.resumeRepository.listByUserId(userId);
        return resumes.map((resume) => this.toPublicResume(resume));
    }

    //get a resume file owned by the user
    async getFile(userId: number, resumeId: number): Promise<ResumeFile> {
        const resume = await this.getOwnedResume(userId, resumeId);
        const content = await this.fileStorage.read(resume.storageKey);
        const publicResume = this.toPublicResume(resume);

        return {
            resume: publicResume,
            content,
            mimeType: getResumeMimeType(publicResume.fileType),
        };
    }

    //delete a resume owned by the user
    async delete(userId: number, resumeId: number): Promise<void> {
        const resume = await this.getOwnedResume(userId, resumeId);

        // Applications keep a reference to the resume that was submitted, so it cannot be removed
        if (await this.resumeRepository.isUsedInApplication(resumeId)) {
            throw new ResumeInUseError();
        }

        await this.resumeRepository.delete(resumeId);
        await this.fileStorage.delete(resume.storageKey);
    }
}
