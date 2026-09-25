import type { PublicResume } from '../../../domain/entities/Resume.js';

export interface ResumeUpload {
    originalName: string; // File name sent by the client
    content: Buffer; // File content
}

export interface ResumeFile {
    resume: PublicResume;
    content: Buffer;
    mimeType: string;
}

export interface IResumeService {
    //upload a resume for a user, returns the created resume
    upload(userId: number, file: ResumeUpload): Promise<PublicResume>;

    //list all resumes of a user
    list(userId: number): Promise<PublicResume[]>;

    //get a resume file owned by the user
    getFile(userId: number, resumeId: number): Promise<ResumeFile>;

    //delete a resume owned by the user
    delete(userId: number, resumeId: number): Promise<void>;
}
