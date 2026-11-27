import type { PublicUser } from '../../../domain/entities/PublicUser.js';

// One job the user was automatically applied to
export interface AutoAppliedJob {
    applicationId: number;
    jobId: number;
    title: string;
    companyName: string;
    score: number; // Match score from 0 to 100
    reason: string; // Short explanation from the AI
}

export interface AutoApplyResult {
    reviewedJobCount: number; // Number of open jobs compared with the resume
    appliedCount: number; // Number of applications that were created
    applied: AutoAppliedJob[];
}

export interface IAutoApplyService {
    //compare a job seeker's PDF resume with the open jobs and apply to the best matches
    autoApply(user: PublicUser, resumeId: number): Promise<AutoApplyResult>;
}