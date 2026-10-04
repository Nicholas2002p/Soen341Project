import type {
    CreateApplicationData,
    IApplicationRepository,
} from '../../src/application/interfaces/repositories/IApplicationRepository.js';
import type {
    Application,
    ApplicationJob,
    ApplicationStatusChange,
    ApplicationWithJob,
} from '../../src/domain/entities/Application.js';
import { ApplicationStatus } from '../../src/domain/entities/Application.js';
import type { PublicUser } from '../../src/domain/entities/PublicUser.js';
import { UserRole } from '../../src/domain/entities/User.js';
import { DuplicateApplicationError } from '../../src/domain/errors/DuplicateApplicationError.js';

const createdAt = new Date('2026-01-01');

export const jobSeeker: PublicUser = { id: 1, email: 'seeker@example.com', role: UserRole.JobSeeker, createdAt, updatedAt: createdAt };
export const otherJobSeeker: PublicUser = { id: 2, email: 'other@example.com', role: UserRole.JobSeeker, createdAt, updatedAt: createdAt };
export const recruiter: PublicUser = { id: 10, email: 'recruiter@example.com', role: UserRole.Recruiter, createdAt, updatedAt: createdAt };
export const otherRecruiter: PublicUser = { id: 11, email: 'other-recruiter@example.com', role: UserRole.Recruiter, createdAt, updatedAt: createdAt };

// A job posted by `recruiter` with no deadline
export const openJob: ApplicationJob = { id: 100, recruiterId: recruiter.id, deadline: null };

// A job whose deadline has already passed
export const closedJob: ApplicationJob = { id: 101, recruiterId: recruiter.id, deadline: new Date('2020-01-01') };

// An existing application by `jobSeeker` to `openJob`
export const application: Application = {
    id: 1,
    userId: jobSeeker.id,
    jobId: openJob.id,
    resumeId: 1,
    status: ApplicationStatus.Applied,
    appliedAt: createdAt,
    updatedAt: createdAt,
};

// In-memory application repository used to isolate service tests from Prisma.
export class FakeApplicationRepository implements IApplicationRepository {
    applications = new Map<number, Application>();
    statusHistory = new Map<number, ApplicationStatusChange[]>();
    jobs = new Map<number, ApplicationJob>();
    private nextId = 1;

    constructor(jobs: ApplicationJob[] = [], applications: Application[] = []) {
        for (const job of jobs) {
            this.jobs.set(job.id, job);
        }
        for (const existing of applications) {
            this.applications.set(existing.id, existing);
            this.statusHistory.set(existing.id, [{ status: existing.status, changedAt: existing.appliedAt }]);
            this.nextId = Math.max(this.nextId, existing.id + 1);
        }
    }

    private withJob(stored: Application): ApplicationWithJob {
        return { ...stored, job: { id: stored.jobId, title: 'Junior Developer', companyName: 'TechCorp', location: 'Montreal, QC', employmentType: 'hybrid' } };
    }

    async create(data: CreateApplicationData): Promise<Application> {
        if (await this.getByUserAndJob(data.userId, data.jobId)) {
            throw new DuplicateApplicationError();
        }

        const now = new Date();
        const created: Application = { id: this.nextId++, ...data, appliedAt: now, updatedAt: now };
        this.applications.set(created.id, created);
        this.statusHistory.set(created.id, [{ status: data.status, changedAt: now }]);
        return created;
    }

    async getById(id: number): Promise<ApplicationWithJob | null> {
        const stored = this.applications.get(id);
        return stored ? this.withJob(stored) : null;
    }

    async getByUserAndJob(userId: number, jobId: number): Promise<Application | null> {
        return [...this.applications.values()].find((stored) => stored.userId === userId && stored.jobId === jobId) ?? null;
    }

    async listByUserId(userId: number): Promise<ApplicationWithJob[]> {
        return [...this.applications.values()].filter((stored) => stored.userId === userId).map((stored) => this.withJob(stored));
    }

    async listByJobId(jobId: number): Promise<Application[]> {
        return [...this.applications.values()].filter((stored) => stored.jobId === jobId);
    }

    async updateStatus(id: number, status: ApplicationStatus): Promise<Application> {
        const stored = this.applications.get(id);
        if (!stored) {
            throw new Error('Application not found');
        }

        const now = new Date();
        const updated = { ...stored, status, updatedAt: now };
        this.applications.set(id, updated);
        this.statusHistory.get(id)?.push({ status, changedAt: now });
        return updated;
    }

    async getStatusHistory(applicationId: number): Promise<ApplicationStatusChange[]> {
        return this.statusHistory.get(applicationId) ?? [];
    }

    async delete(id: number): Promise<void> {
        this.applications.delete(id);
        this.statusHistory.delete(id);
    }

    async getJob(jobId: number): Promise<ApplicationJob | null> {
        return this.jobs.get(jobId) ?? null;
    }
}
