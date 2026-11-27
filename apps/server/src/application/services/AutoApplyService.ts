import type { IApplicationService } from '../interfaces/services/IApplicationService.js';
import type { AutoAppliedJob, AutoApplyResult, IAutoApplyService } from '../interfaces/services/IAutoApplyService.js';
import type { IJobMatchingService } from '../interfaces/services/IJobMatchingService.js';
import type { IJobService } from '../interfaces/services/IJobService.js';
import type { IPdfTextExtractionService } from '../interfaces/services/IPdfTextExtractionService.js';
import type { IResumeAnalysisService } from '../interfaces/services/IResumeAnalysisService.js';
import type { IResumeService } from '../interfaces/services/IResumeService.js';
import type { PublicUser } from '../../domain/entities/PublicUser.js';
import { UserRole } from '../../domain/entities/User.js';
import {
    ApplicationNotAllowedError,
    DuplicateApplicationError,
    JobClosedError,
} from '../../domain/errors/ApplicationErrors.js';
import { InvalidResumeFileError } from '../../domain/errors/InvalidResumeFileError.js';

// Jobs with a score at or above this value are applied to automatically
export const AUTO_APPLY_MIN_SCORE = 70;

// Limits how many applications one click can send
export const AUTO_APPLY_MAX_APPLICATIONS = 10;

export class AutoApplyService implements IAutoApplyService {
    constructor(
        private readonly resumeService: IResumeService,
        private readonly pdfTextExtractionService: IPdfTextExtractionService,
        private readonly resumeAnalysisService: IResumeAnalysisService,
        private readonly jobService: IJobService,
        private readonly jobMatchingService: IJobMatchingService,
        private readonly applicationService: IApplicationService,
    ) { }

    async autoApply(user: PublicUser, resumeId: number): Promise<AutoApplyResult> {
        // Check the role first so no AI request is wasted
        if (user.role !== UserRole.JobSeeker) {
            throw new ApplicationNotAllowedError('Only job seekers can apply to jobs.');
        }

        // Throws ResumeNotFoundError if the resume does not belong to the user
        const file = await this.resumeService.getFile(user.id, resumeId);

        if (file.resume.fileType !== 'pdf') {
            throw new InvalidResumeFileError('Auto apply only works with PDF resumes.');
        }

        // Skip jobs the user already applied to
        const existingApplications = await this.applicationService.listMine(user);
        const appliedJobIds = new Set(existingApplications.map((application) => application.jobId));
        const openJobs = (await this.jobService.getAvailable()).filter((job) => !appliedJobIds.has(job.jobId));

        if (openJobs.length === 0) {
            return { reviewedJobCount: 0, appliedCount: 0, applied: [] };
        }

        const resumeText = await this.pdfTextExtractionService.extractText(file.content);
        const profile = await this.resumeAnalysisService.extractProfile(resumeText);
        const matches = await this.jobMatchingService.scoreJobs(profile, openJobs);

        const bestMatches = matches
            .filter((match) => match.score >= AUTO_APPLY_MIN_SCORE)
            .slice(0, AUTO_APPLY_MAX_APPLICATIONS);

        const jobsById = new Map(openJobs.map((job) => [job.jobId, job]));
        const applied: AutoAppliedJob[] = [];

        for (const match of bestMatches) {
            const job = jobsById.get(match.jobId);

            if (!job) {
                continue;
            }

            try {
                const application = await this.applicationService.apply(user, { jobId: job.jobId, resumeId });

                applied.push({
                    applicationId: application.id,
                    jobId: job.jobId,
                    title: job.title,
                    companyName: job.company.name,
                    score: match.score,
                    reason: match.reason,
                });
            } catch (error) {
                // The job may have closed or been applied to while the AI was working
                if (error instanceof DuplicateApplicationError || error instanceof JobClosedError) {
                    continue;
                }

                throw error;
            }
        }

        return { reviewedJobCount: openJobs.length, appliedCount: applied.length, applied };
    }
}