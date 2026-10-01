import type { ResumeFileType } from '../validation/ResumeFile.js';

// This file defines the Resume entity, which represents a resume file uploaded by a user.
export interface Resume {
    id: number; // Unique identifier for the resume
    userId: number; // Owner of the resume
    fileName: string; // Original file name shown to the user
    storageKey: string; // Name of the stored file, never sent to clients
    fileType: ResumeFileType; // pdf, doc or docx
    createdAt: Date; // Timestamp of when the resume was uploaded
}

// Resume information that is safe to return in API responses (everything except the owner and the storage key).
export interface PublicResume {
    id: number;
    fileName: string;
    fileType: ResumeFileType;
    createdAt: Date;
}
