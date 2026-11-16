import assert from 'node:assert/strict';
import test from 'node:test';
import { ApplicationService } from '../../src/application/services/ApplicationService.js';
import { ResumeService } from '../../src/application/services/ResumeService.js';
import { ApplicationNotFoundError } from '../../src/domain/errors/ApplicationErrors.js';
import { ResumeFileMissingError } from '../../src/domain/errors/ResumeFileMissingError.js';
import {
    FakeApplicationRepository,
    application,
    jobSeeker,
    openJob,
    otherJobSeeker,
    otherRecruiter,
    recruiter,
} from '../fakes/ApplicationFakes.js';
import { FakeFileStorage, FakeResumeRepository, resume } from '../fakes/ResumeFakes.js';

// `application` was submitted by `jobSeeker` to `openJob` (posted by `recruiter`) with `resume`
const fileContent = Buffer.from('%PDF-1.7 resume content');

function createService(files: Record<string, Buffer> = { [resume.storageKey]: fileContent }) {
    const resumes = new FakeResumeRepository([resume]);
    const resumeService = new ResumeService(resumes, new FakeFileStorage(files));
    return new ApplicationService(new FakeApplicationRepository([openJob], [application]), resumes, undefined, resumeService);
}

test('getResumeFile gives the recruiter of the job the resume submitted with the application', async () => {
    const service = createService();

    const file = await service.getResumeFile(recruiter, application.id);

    assert.deepEqual(file.content, fileContent);
    assert.equal(file.mimeType, 'application/pdf');
    assert.equal(file.resume.fileName, resume.fileName);
});

test('getResumeFile gives the applicant their own submitted resume', async () => {
    const service = createService();

    const file = await service.getResumeFile(jobSeeker, application.id);

    assert.deepEqual(file.content, fileContent);
});

test('getResumeFile hides the resume from recruiters who did not post the job', async () => {
    const service = createService();

    await assert.rejects(service.getResumeFile(otherRecruiter, application.id), ApplicationNotFoundError);
});

test('getResumeFile hides the resume from other job seekers', async () => {
    const service = createService();

    await assert.rejects(service.getResumeFile(otherJobSeeker, application.id), ApplicationNotFoundError);
});

test('getResumeFile rejects an application that does not exist', async () => {
    const service = createService();

    await assert.rejects(service.getResumeFile(recruiter, 999), ApplicationNotFoundError);
});

test('getResumeFile reports a missing file when the resume record exists but the file is gone', async () => {
    const service = createService({});

    await assert.rejects(service.getResumeFile(recruiter, application.id), ResumeFileMissingError);
});
