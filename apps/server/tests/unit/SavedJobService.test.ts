import assert from 'node:assert/strict';
import test from 'node:test';
import { SavedJobService } from '../../src/application/services/SavedJobService.js';
import type { ISavedJobRepository } from '../../src/application/interfaces/repositories/ISavedJobRepository.js';
import type { JobSummary } from '../../src/domain/entities/Job.js';
import type { PublicUser } from '../../src/domain/entities/PublicUser.js';
import type { IJobRepository } from '../../src/application/interfaces/repositories/IJobRepository.js';
import { UserRole } from '../../src/domain/entities/User.js';

class DummyNotificationService {
    notifications: Array<{ userId: number; type: string; jobId: string }> = [];

    async create(userId: number, input: { type: string; data?: Record<string, string> }): Promise<void> {
        this.notifications.push({
            userId,
            type: input.type,
            jobId: input.data?.jobId ?? '',
        });
    }
}

class FakeSavedJobRepository implements ISavedJobRepository {
    constructor(private readonly jobs: JobSummary[]) {}

    async getByUserId(): Promise<JobSummary[]> {
        return this.jobs;
    }

    async save(): Promise<boolean> {
        return true;
    }

    async remove(): Promise<boolean> {
        return true;
    }

    async exists(): Promise<boolean> {
        return false;
    }
}

const user: PublicUser = {
    id: 1,
    email: 'seeker@example.com',
    role: UserRole.JobSeeker,
    createdAt: new Date(),
    updatedAt: new Date(),
};

function job(jobId: number, deadline: Date): JobSummary {
    return {
        jobId,
        title: `Job ${jobId}`,
        category: 'Engineering',
        location: null,
        salary: 80000,
        employmentType: 'remote',
        deadline,
        createdAt: new Date(),
        company: { companyId: 1, name: 'Company' },
        skills: [],
    };
}

test('getSavedJobs reminds jobseekers about saved jobs at the configured deadline boundary', async () => {
    const previousReminderDays = process.env.SAVED_JOB_DEADLINE_REMINDER_DAYS;
    process.env.SAVED_JOB_DEADLINE_REMINDER_DAYS = '2';
    try {
        const now = Date.now();
        const notificationService = new DummyNotificationService();
        const service = new SavedJobService(
            new FakeSavedJobRepository([
                job(1, new Date(now + 2 * 24 * 60 * 60 * 1000)),
                job(2, new Date(now + 3 * 24 * 60 * 60 * 1000)),
            ]),
            { getById: async () => null } satisfies Pick<IJobRepository, 'getById'>,
            notificationService,
        );

        await service.getSavedJobs(user);

        assert.deepEqual(notificationService.notifications, [{ userId: user.id, type: 'deadline_reminder', jobId: '1' }]);
    } finally {
        if (previousReminderDays === undefined) delete process.env.SAVED_JOB_DEADLINE_REMINDER_DAYS;
        else process.env.SAVED_JOB_DEADLINE_REMINDER_DAYS = previousReminderDays;
    }
});
