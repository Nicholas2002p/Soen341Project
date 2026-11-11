import assert from 'node:assert/strict';
import test from 'node:test';
import { ApplicationService } from '../../src/application/services/ApplicationService.js';
import type { Application } from '../../src/domain/entities/Application.js';
import { ApplicationStatus } from '../../src/domain/entities/Application.js';
import { ApplicationNotAllowedError } from '../../src/domain/errors/ApplicationErrors.js';
import { FakeApplicationRepository, application, jobSeeker, openJob, otherJobSeeker, recruiter } from '../fakes/ApplicationFakes.js';
import { FakeResumeRepository } from '../fakes/ResumeFakes.js';

// An application by `jobSeeker` with the given status, submitted on the given date
function applicationWith(id: number, status: ApplicationStatus, appliedAt: string): Application {
    return { ...application, id, jobId: openJob.id + id, status, appliedAt: new Date(appliedAt) };
}

function createService(applications: Application[]) {
    const repository = new FakeApplicationRepository([openJob], applications);
    const service = new ApplicationService(repository, new FakeResumeRepository());
    return { service, repository };
}

test('getAnalytics returns zeros and no weeks for a job seeker with no applications', async () => {
    const { service } = createService([]);

    const analytics = await service.getAnalytics(jobSeeker);

    assert.equal(analytics.total, 0);
    assert.equal(analytics.pending, 0);
    assert.equal(analytics.interviewRate, 0);
    assert.deepEqual(analytics.submittedOverTime, []);
    assert.deepEqual(analytics.byStatus, {
        [ApplicationStatus.Applied]: 0,
        [ApplicationStatus.UnderReview]: 0,
        [ApplicationStatus.Interview]: 0,
        [ApplicationStatus.Offered]: 0,
        [ApplicationStatus.Rejected]: 0,
    });
});

test('getAnalytics counts the applications in each status and the pending ones', async () => {
    const { service } = createService([
        applicationWith(1, ApplicationStatus.Applied, '2026-10-05'),
        applicationWith(2, ApplicationStatus.Applied, '2026-10-06'),
        applicationWith(3, ApplicationStatus.UnderReview, '2026-10-07'),
        applicationWith(4, ApplicationStatus.Interview, '2026-10-08'),
        applicationWith(5, ApplicationStatus.Rejected, '2026-10-09'),
    ]);

    const analytics = await service.getAnalytics(jobSeeker);

    assert.equal(analytics.total, 5);
    assert.equal(analytics.pending, 3); // Applied + Under_Review
    assert.equal(analytics.byStatus[ApplicationStatus.Applied], 2);
    assert.equal(analytics.byStatus[ApplicationStatus.UnderReview], 1);
    assert.equal(analytics.byStatus[ApplicationStatus.Interview], 1);
    assert.equal(analytics.byStatus[ApplicationStatus.Offered], 0);
    assert.equal(analytics.byStatus[ApplicationStatus.Rejected], 1);
});

test('getAnalytics only counts the applications of the logged in job seeker', async () => {
    const othersApplication = { ...applicationWith(2, ApplicationStatus.Applied, '2026-10-05'), userId: otherJobSeeker.id };
    const { service } = createService([applicationWith(1, ApplicationStatus.Applied, '2026-10-05'), othersApplication]);

    const analytics = await service.getAnalytics(jobSeeker);

    assert.equal(analytics.total, 1);
});

test('getAnalytics interview rate counts applications rejected after their interview', async () => {
    const { service, repository } = createService([
        applicationWith(1, ApplicationStatus.Rejected, '2026-10-05'),
        applicationWith(2, ApplicationStatus.Offered, '2026-10-05'),
        applicationWith(3, ApplicationStatus.Rejected, '2026-10-05'),
    ]);

    // Application 1 went through an interview before being rejected, application 3 was rejected right away
    repository.statusHistory.set(1, [
        { status: ApplicationStatus.Applied, changedAt: new Date('2026-10-05') },
        { status: ApplicationStatus.Interview, changedAt: new Date('2026-10-10') },
        { status: ApplicationStatus.Rejected, changedAt: new Date('2026-10-15') },
    ]);

    const analytics = await service.getAnalytics(jobSeeker);

    assert.equal(analytics.interviewRate, 0.67); // 2 of 3, rounded to two decimals
});

test('getAnalytics groups applications by week and includes the weeks with none', async () => {
    const { service } = createService([
        applicationWith(1, ApplicationStatus.Applied, '2026-10-05T09:00:00Z'), // Monday
        applicationWith(2, ApplicationStatus.Applied, '2026-10-11T23:00:00Z'), // Sunday of the same week
        applicationWith(3, ApplicationStatus.Applied, '2026-10-21T12:00:00Z'), // Two weeks later
    ]);

    const analytics = await service.getAnalytics(jobSeeker);

    assert.deepEqual(analytics.submittedOverTime, [
        { weekStart: '2026-10-05', count: 2 },
        { weekStart: '2026-10-12', count: 0 },
        { weekStart: '2026-10-19', count: 1 },
    ]);
});

test('getAnalytics rejects users who are not job seekers', async () => {
    const { service } = createService([]);

    await assert.rejects(service.getAnalytics(recruiter), ApplicationNotAllowedError);
});
