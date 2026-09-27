import type { Resume } from '../../../domain/entities/Resume.js';

export interface CreateResumeData {
    userId: number; // Owner of the resume
    fileName: string; // Original file name shown to the user
    storageKey: string; // Name of the stored file
}

export interface IResumeRepository {
    //create a new resume record, returns the created resume
    create(data: CreateResumeData): Promise<Resume>;

    //find a resume by its id, returns null if not found
    getById(id: number): Promise<Resume | null>;

    //list all resumes of a user, newest first
    listByUserId(userId: number): Promise<Resume[]>;

    //delete a resume record
    delete(id: number): Promise<void>;

    //check if a resume was used in at least one job application
    isUsedInApplication(id: number): Promise<boolean>;
}
