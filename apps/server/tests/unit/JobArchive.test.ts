import assert from 'node:assert/strict';
import test from 'node:test';
import { JobService } from '../../src/application/services/JobService.js';
import type { IJobRepository } from '../../src/application/interfaces/repositories/IJobRepository.js';
import type { JobDetails, JobSummary } from '../../src/domain/entities/Job.js';
import { EmploymentType } from '../../src/domain/entities/EmploymentType.js';
import type { PublicUser } from '../../src/domain/entities/PublicUser.js';
import { UserRole } from '../../src/domain/entities/User.js';

const createdAt = new Date('2026-01-01');

const recruiter: PublicUser = { id: 10, email: 'recruiter@example.com', role: UserRole.Recruiter, createdAt, updatedAt: createdAt };
const otherRecruiter: PublicUser = { id: 11, email: 'other@example.com', role: UserRole.Recruiter, createdAt, updatedAt: createdAt };
const jobSeeker: PublicUser = { id: 1, email: 'seeker@example.com', role: UserRole.JobSeeker, createdAt, updatedAt: createdAt };

function job(jobId: number, recruiterId: number, archive: boolean): JobDetails {
    return {
        jobId,
        recruiterId,
        title: `Job ${jobId}`,
        category: 'Engineering',
        location: null,
        description: null,
        salary: 80000,
        employmentType: EmploymentType.Remote,
        deadline: new Date('2030-01-01'),
        createdAt,
        updatedAt: null,
        archive,
        company: { companyId: 1, name: 'Company', description: null },
        skills: [],
    };
}

function toSummary(details: JobDetails): JobSummary {
    const { jobId, title, category, location, salary, employmentType, deadline, createdAt, archive, company, skills } = details;
    return { jobId, title, category, location, salary, employmentType, deadline, createdAt, archive, company: { companyId: company.companyId, name: company.name }, skills };
}

// In-memory job repository, only the methods used by the archive feature do real work
class FakeJobRepository implements IJobRepository {
    jobs = new Map<number, JobDetails>();

    constructor(jobs: JobDetails[]) {
        for (const existing of jobs) {
            this.jobs.set(existing.jobId, existing);
        }
    }

    async getById(jobId: number): Promise<JobDetails | null> {
        return this.jobs.get(jobId) ?? null;
    }

    async getArchivedByRecruiterId(recruiterId: number): Promise<JobSummary[]> {
        return [...this.jobs.values()].filter((stored) => stored.recruiterId === recruiterId && stored.archive).map(toSummary);
    }

    async setArchive(jobId: number, archive: boolean): Promise<JobDetails | null> {
        const stored = this.jobs.get(jobId);
        if (!stored) {
            return null;
        }

        const updated = { ...stored, archive };
        this.jobs.set(jobId, updated);
        return updated;
    }

    async search(): Promise<JobSummary[]> { return []; }
    async getAvailable(): Promise<JobSummary[]> { return []; }
    async getExpired(): Promise<JobSummary[]> { return []; }
    async getByRecruiterId(): Promise<JobSummary[]> { return []; }
    async create(): Promise<JobDetails> { throw new Error('Not used'); }
    async update(): Promise<JobDetails | null> { return null; }
    async delete(): Promise<boolean> { return false; }
}

function createService() {
    const repository = new FakeJobRepository([job(1, recruiter.id, false), job(2, recruiter.id, true), job(3, otherRecruiter.id, true)]);
    return { service: new JobService(repository), repository };
}

test('getArchived only returns the archived jobs of the logged in recruiter', async () => {
    const { service } = createService();

    const jobs = await service.getArchived(recruiter);

    assert.deepEqual(jobs.map((archived) => archived.jobId), [2]);
});

test('getArchived rejects users who are not recruiters', async () => {
    const { service } = createService();

    await assert.rejects(service.getArchived(jobSeeker), /Only recruiters/);
});

test('setArchive archives and unarchives a job of the recruiter', async () => {
    const { service, repository } = createService();

    const archived = await service.setArchive(recruiter, 1, true);
    assert.equal(archived?.archive, true);
    assert.equal(repository.jobs.get(1)?.archive, true);

    const unarchived = await service.setArchive(recruiter, 1, false);
    assert.equal(unarchived?.archive, false);
    assert.equal(repository.jobs.get(1)?.archive, false);
});

test('setArchive returns null when the job does not exist', async () => {
    const { service } = createService();

    assert.equal(await service.setArchive(recruiter, 999, true), null);
});

test('setArchive rejects a job posted by another recruiter', async () => {
    const { service, repository } = createService();

    await assert.rejects(service.setArchive(otherRecruiter, 1, true), /only archive your own/);
    assert.equal(repository.jobs.get(1)?.archive, false); // Nothing changed
});

test('setArchive rejects users who are not recruiters', async () => {
    const { service } = createService();

    await assert.rejects(service.setArchive(jobSeeker, 1, true), /Only recruiters/);
});
