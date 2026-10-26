import type { PrismaClient } from '../../generated/prisma/client.js';
import type { Application as PrismaApplication } from '../../generated/prisma/client.js';
import type {
    CreateApplicationData,
    IApplicationRepository,
} from '../../application/interfaces/repositories/IApplicationRepository.js';
import type {
    Application,
    ApplicationDetails,
    ApplicationJob,
    ApplicationStatus,
    ApplicationStatusChange,
    ApplicationWithJob,
} from '../../domain/entities/Application.js';
import type { EmploymentType } from '../../domain/entities/EmploymentType.js';
import { getResumeFileType } from '../../domain/validation/ResumeFile.js';
import { DuplicateApplicationError } from '../../domain/errors/ApplicationErrors.js';

// Job fields loaded with an application
const jobSummarySelect = {
    jobId: true,
    title: true,
    location: true,
    employmentType: true,
    company: { select: { name: true } },
} as const;

// Resume fields loaded with an application (fileURL is only used to work out the file type, it is never returned)
const resumeSummarySelect = {
    resumeId: true,
    fileName: true,
    fileURL: true,
} as const;

// Job and resume loaded with every application that is returned to the client
const applicationRelationsInclude = {
    job: { select: jobSummarySelect },
    resume: { select: resumeSummarySelect },
} as const;

type PrismaApplicationWithJob = PrismaApplication & {
    job: { jobId: number; title: string; location: string | null; employmentType: string; company: { name: string } };
    resume: { resumeId: number; fileName: string; fileURL: string | null };
};

// Prisma error code for a unique constraint violation (here: the same user applying to the same job twice)
const UNIQUE_CONSTRAINT_FAILED = 'P2002';

export class PrismaApplicationRepository implements IApplicationRepository {
    constructor(private readonly prisma: PrismaClient) {}

    // Convert a Prisma Application record to a domain Application entity
    private toDomainApplication(record: PrismaApplication): Application {
        return {
            id: record.applicationId,
            userId: record.userId,
            jobId: record.jobId,
            resumeId: record.resumeId,
            status: record.status as ApplicationStatus,
            appliedAt: record.appliedAt,
            updatedAt: record.updatedAt,
        };
    }

    // Convert a Prisma Application record with its job to a domain ApplicationWithJob
    private toDomainApplicationWithJob(record: PrismaApplicationWithJob): ApplicationWithJob {
        return {
            ...this.toDomainApplication(record),
            job: {
                id: record.job.jobId,
                title: record.job.title,
                companyName: record.job.company.name,
                location: record.job.location,
                employmentType: record.job.employmentType as EmploymentType,
            },
            resume: {
                id: record.resume.resumeId,
                fileName: record.resume.fileName,
                fileType: getResumeFileType(record.resume.fileURL ?? ''),
            },
        };
    }

    // Create an application and its first status history entry in one transaction
    async create(data: CreateApplicationData): Promise<Application> {
        try {
            const application = await this.prisma.application.create({
                data: {
                    userId: data.userId,
                    jobId: data.jobId,
                    resumeId: data.resumeId,
                    status: data.status,
                    statusHistory: { create: { status: data.status } },
                },
            });

            return this.toDomainApplication(application);
        } catch (error) {
            // The database allows one application per user per job, so two requests at the same time cannot both succeed
            if ((error as { code?: string }).code === UNIQUE_CONSTRAINT_FAILED) {
                throw new DuplicateApplicationError();
            }
            throw error;
        }
    }

    // Find an application by its ID, returns null if not found
    async getById(id: number): Promise<ApplicationWithJob | null> {
        const application = await this.prisma.application.findUnique({
            where: { applicationId: id },
            include: applicationRelationsInclude,
        });

        return application ? this.toDomainApplicationWithJob(application) : null;
    }

    // Find the application of a user for a job, returns null if they have not applied
    async getByUserAndJob(userId: number, jobId: number): Promise<Application | null> {
        const application = await this.prisma.application.findUnique({
            where: { userId_jobId: { userId, jobId } },
        });

        return application ? this.toDomainApplication(application) : null;
    }

    // List all applications of a job seeker, newest first
    async listByUserId(userId: number): Promise<ApplicationWithJob[]> {
        const applications = await this.prisma.application.findMany({
            where: { userId },
            include: applicationRelationsInclude,
            orderBy: { appliedAt: 'desc' },
        });

        return applications.map((application) => this.toDomainApplicationWithJob(application));
    }

    // Convert a Prisma Application record with its job and status history to a domain ApplicationDetails
    private toDomainApplicationDetails(
        record: PrismaApplicationWithJob & { statusHistory: { status: string; createdAt: Date }[] },
    ): ApplicationDetails {
        return {
            ...this.toDomainApplicationWithJob(record),
            statusHistory: record.statusHistory.map((entry) => ({
                status: entry.status as ApplicationStatus,
                changedAt: entry.createdAt,
            })),
        };
    }

    // List the applications of a job seeker with their job and status history in one query, newest first
    async listHistoryByUserId(userId: number, statuses?: ApplicationStatus[]): Promise<ApplicationDetails[]> {
        const applications = await this.prisma.application.findMany({
            where: { userId, ...(statuses ? { status: { in: statuses } } : {}) },
            include: {
                ...applicationRelationsInclude,
                statusHistory: { orderBy: { createdAt: 'asc' } },
            },
            orderBy: { appliedAt: 'desc' },
        });

        return applications.map((application) => this.toDomainApplicationDetails(application));
    }

    // Find the application of a user for a job with its job and status history, returns null if they have not applied
    async getHistoryByUserAndJob(userId: number, jobId: number): Promise<ApplicationDetails | null> {
        const application = await this.prisma.application.findUnique({
            where: { userId_jobId: { userId, jobId } },
            include: {
                ...applicationRelationsInclude,
                statusHistory: { orderBy: { createdAt: 'asc' } },
            },
        });

        return application ? this.toDomainApplicationDetails(application) : null;
    }

    // List all applications submitted to a job, newest first
    async listByJobId(jobId: number): Promise<Application[]> {
        const applications = await this.prisma.application.findMany({
            where: { jobId },
            orderBy: { appliedAt: 'desc' },
        });

        return applications.map((application) => this.toDomainApplication(application));
    }

    // Change the status of an application and add the change to its status history in one transaction
    async updateStatus(id: number, status: ApplicationStatus): Promise<Application> {
        const [application] = await this.prisma.$transaction([
            this.prisma.application.update({
                where: { applicationId: id },
                data: { status, updatedAt: new Date() },
            }),
            this.prisma.applicationStatusHistory.create({
                data: { applicationId: id, status },
            }),
        ]);

        return this.toDomainApplication(application);
    }

    // Get the status history of an application, oldest first
    async getStatusHistory(applicationId: number): Promise<ApplicationStatusChange[]> {
        const history = await this.prisma.applicationStatusHistory.findMany({
            where: { applicationId },
            orderBy: { createdAt: 'asc' },
        });

        return history.map((entry) => ({
            status: entry.status as ApplicationStatus,
            changedAt: entry.createdAt,
        }));
    }

    // Delete an application and its status history in one transaction
    async delete(id: number): Promise<void> {
        await this.prisma.$transaction([
            this.prisma.applicationStatusHistory.deleteMany({ where: { applicationId: id } }),
            this.prisma.application.delete({ where: { applicationId: id } }),
        ]);
    }

    // Find the job information needed to apply or review applications, returns null if the job does not exist
    async getJob(jobId: number): Promise<ApplicationJob | null> {
        const job = await this.prisma.job.findUnique({
            where: { jobId },
            select: { jobId: true, recruiterId: true, deadline: true },
        });

        return job ? { id: job.jobId, recruiterId: job.recruiterId, deadline: job.deadline } : null;
    }
}
