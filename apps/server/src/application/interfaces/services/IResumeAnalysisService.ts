import type { ResumeProfile } from '../../../domain/entities/ResumeProfile.js';

export interface IResumeAnalysisService {
    extractProfile(resumeText: string): Promise<ResumeProfile>;
}