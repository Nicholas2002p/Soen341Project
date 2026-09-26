import path from 'node:path';
import type { IResumeService, ResumeFile, ResumeUpload } from '../interfaces/services/IResumeService.js';
import type { IResumeRepository } from '../interfaces/repositories/IResumeRepository.js';
import type { IFileStorage } from '../interfaces/infrastructure/IFileStorage.js';
import type { PublicResume, Resume } from '../../domain/entities/Resume.js';
import { detectResumeFileType, getResumeMimeType } from '../../domain/validation/ResumeFile.js';
import { InvalidResumeFileError } from '../../domain/errors/InvalidResumeFileError.js';
import { ResumeNotFoundError } from '../../domain/errors/ResumeNotFoundError.js';
import { ResumeInUseError } from '../../domain/errors/ResumeInUseError.js';
import { ResumeUploadError } from '../../domain/errors/ResumeUploadError.js';
import { ResumeFileMissingError } from '../../domain/errors/ResumeFileMissingError.js';

// Matches the VarChar(255) limit of Resume.fileName in the database
const MAX_FILE_NAME_LENGTH = 255;

export class ResumeService implements IResumeService {
    constructor(
        private readonly resumeRepository: IResumeRepository,
        private readonly fileStorage: IFileStorage,
    ) {}

    // Build the version of a resume that is sent back in API responses.
    // "Public" means safe to return to the client (like PublicUser): the owner id and the storage key
    // (the name of the file on the server) are left out.
    private toPublicResume(resume: Resume): PublicResume {
        return {
            id: resume.id,
            fileName: resume.fileName,
            fileType: resume.fileType,
            createdAt: resume.createdAt,
        };
    }

    // Retrieve the specific resume owned by a user.
    // Throws ResumeNotFoundError ("Resume not found.") if the resume does not exist or belongs to someone else.
    // Both cases give the same error so the API does not reveal which resume ids exist.
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

        let storageKey: string;

        try {
            storageKey = await this.fileStorage.save(file.content, fileType);
        } catch (error) {
            throw new ResumeUploadError(undefined, { cause: error });
        }

        try {
            const resume = await this.resumeRepository.create({ userId, fileName, storageKey });
            return this.toPublicResume(resume);
        } catch (error) {
            // Remove the stored file so it is not left behind without a database record
            await this.deleteStoredFile(storageKey);
            throw new ResumeUploadError(undefined, { cause: error });
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
        let content: Buffer;

        try {
            content = await this.fileStorage.read(resume.storageKey);
        } catch (error) {
            // The database record exists but the file is gone from storage
            if (isFileNotFound(error)) {
                throw new ResumeFileMissingError(undefined, { cause: error });
            }
            throw error;
        }

        return {
            resume: this.toPublicResume(resume),
            content,
            mimeType: getResumeMimeType(resume.fileType),
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
        await this.deleteStoredFile(resume.storageKey);
    }

    // Delete a stored file without failing the request. The file is only cleaned up after the
    // database record is gone, so a failure here is logged instead of returned to the user.
    private async deleteStoredFile(storageKey: string): Promise<void> {
        try {
            await this.fileStorage.delete(storageKey);
        } catch (error) {
            console.error(`Could not delete resume file "${storageKey}"`, error);
        }
    }
}

// Check if an error means the file does not exist (Node uses the ENOENT code for this)
function isFileNotFound(error: unknown): boolean {
    return error instanceof Error && (error as NodeJS.ErrnoException).code === 'ENOENT';
}
