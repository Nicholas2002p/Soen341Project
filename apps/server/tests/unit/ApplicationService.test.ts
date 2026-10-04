import assert from 'node:assert/strict';
import test from 'node:test';
import { ApplicationService } from '../../src/application/services/ApplicationService.js';
import { ApplicationStatus } from '../../src/domain/entities/Application.js';
import { ApplicationNotAllowedError } from '../../src/domain/errors/ApplicationNotAllowedError.js';
import { ApplicationNotFoundError } from '../../src/domain/errors/ApplicationNotFoundError.js';
import { DuplicateApplicationError } from '../../src/domain/errors/DuplicateApplicationError.js';
import { JobClosedError } from '../../src/domain/errors/JobClosedError.js';
import { JobNotFoundError } from '../../src/domain/errors/JobNotFoundError.js';
import { ResumeNotFoundError } from '../../src/domain/errors/ResumeNotFoundError.js';
import {
    FakeApplicationRepository,
    application,
    closedJob,
    jobSeeker,
    openJob,
    otherJobSeeker,
    otherRecruiter,
    recruiter,
} from '../fakes/ApplicationFakes.js';
import { FakeResumeRepository, resume } from '../fakes/ResumeFakes.js';

// The shared resume fixture belongs to user 1, which is `jobSeeker`
const otherUsersResume = { ...resume, id: 2, userId: otherJobSeeker.id };

function createService(applications = new FakeApplicationRepository([openJob, closedJob])) {
    const service = new ApplicationService(applications, new FakeResumeRepository([resume, otherUsersResume]));
    return { service, applications };
}

test('apply creates an application with the initial status and a first history entry', async () => {
    const { service, applications } = createService();

    const result = await service.apply(jobSeeker, { jobId: openJob.id, resumeId: resume.id });

    assert.equal(result.userId, jobSeeker.id);
    assert.equal(result.jobId, openJob.id);
    assert.equal(result.status, ApplicationStatus.OnHold);
    assert.deepEqual((await applications.getStatusHistory(result.id)).map((entry) => entry.status), [ApplicationStatus.OnHold]);
});

test('apply rejects users who are not job seekers', async () => {
    const { service } = createService();

    await assert.rejects(service.apply(recruiter, { jobId: openJob.id, resumeId: resume.id }), ApplicationNotAllowedError);
});

test('apply rejects a job that does not exist', async () => {
    const { service } = createService();

    await assert.rejects(service.apply(jobSeeker, { jobId: 999, resumeId: resume.id }), JobNotFoundError);
});

test('apply rejects a job whose deadline has passed', async () => {
    const { service } = createService();

    await assert.rejects(service.apply(jobSeeker, { jobId: closedJob.id, resumeId: resume.id }), JobClosedError);
});

test('apply rejects a resume that belongs to another user', async () => {
    const { service, applications } = createService();

    await assert.rejects(service.apply(jobSeeker, { jobId: openJob.id, resumeId: otherUsersResume.id }), ResumeNotFoundError);
    assert.equal(applications.applications.size, 0); // Nothing was created
});

test('apply rejects a second application to the same job', async () => {
    const { service } = createService(new FakeApplicationRepository([openJob], [application]));

    await assert.rejects(service.apply(jobSeeker, { jobId: openJob.id, resumeId: resume.id }), DuplicateApplicationError);
});

test('listMine only returns the applications of the given user', async () => {
    const othersApplication = { ...application, id: 2, userId: otherJobSeeker.id };
    const { service } = createService(new FakeApplicationRepository([openJob], [application, othersApplication]));

    const result = await service.listMine(jobSeeker.id);

    assert.deepEqual(result.map((listed) => listed.id), [application.id]);
});

test('getById returns the application and its status history to the applicant', async () => {
    const { service } = createService(new FakeApplicationRepository([openJob], [application]));

    const result = await service.getById(jobSeeker, application.id);

    assert.equal(result.id, application.id);
    assert.equal(result.statusHistory.length, 1);
});

test('getById returns the application to the recruiter who posted the job', async () => {
    const { service } = createService(new FakeApplicationRepository([openJob], [application]));

    const result = await service.getById(recruiter, application.id);

    assert.equal(result.id, application.id);
});

test('getById hides the application from other users', async () => {
    const { service } = createService(new FakeApplicationRepository([openJob], [application]));

    // Another job seeker and a recruiter of a different job both get "not found"
    await assert.rejects(service.getById(otherJobSeeker, application.id), ApplicationNotFoundError);
    await assert.rejects(service.getById(otherRecruiter, application.id), ApplicationNotFoundError);
});

test('withdraw deletes the application of its applicant', async () => {
    const { service, applications } = createService(new FakeApplicationRepository([openJob], [application]));

    await service.withdraw(jobSeeker.id, application.id);

    assert.equal(applications.applications.size, 0);
    assert.equal(applications.statusHistory.size, 0);
});

test('withdraw hides applications that belong to someone else', async () => {
    const { service, applications } = createService(new FakeApplicationRepository([openJob], [application]));

    await assert.rejects(service.withdraw(otherJobSeeker.id, application.id), ApplicationNotFoundError);
    assert.equal(applications.applications.size, 1); // Nothing was deleted
});

test('listForJob returns the applications of a job to its recruiter', async () => {
    const { service } = createService(new FakeApplicationRepository([openJob], [application]));

    const result = await service.listForJob(recruiter, openJob.id);

    assert.deepEqual(result.map((listed) => listed.id), [application.id]);
});

test('listForJob refuses recruiters who did not post the job', async () => {
    const { service } = createService(new FakeApplicationRepository([openJob], [application]));

    await assert.rejects(service.listForJob(otherRecruiter, openJob.id), ApplicationNotAllowedError);
});

test('listForJob rejects a job that does not exist', async () => {
    const { service } = createService();

    await assert.rejects(service.listForJob(recruiter, 999), JobNotFoundError);
});
