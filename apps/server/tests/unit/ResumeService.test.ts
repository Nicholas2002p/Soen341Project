import assert from 'node:assert/strict';
import test from 'node:test';
import { ResumeService } from '../../src/application/services/ResumeService.js';
import { InvalidResumeFileError } from '../../src/domain/errors/InvalidResumeFileError.js';
import { ResumeInUseError } from '../../src/domain/errors/ResumeInUseError.js';
import { ResumeNotFoundError } from '../../src/domain/errors/ResumeNotFoundError.js';
import {
    FakeFileStorage,
    FakeResumeRepository,
    docxContent,
    pdfContent,
    resume,
    textContent,
} from '../fakes/ResumeFakes.js';

test('upload stores a valid PDF and returns it without the storage key', async () => {
    // Create a ResumeService with empty fakes
    const repository = new FakeResumeRepository();
    const storage = new FakeFileStorage();
    const service = new ResumeService(repository, storage);

    const result = await service.upload(1, { originalName: 'My Resume.pdf', content: pdfContent });

    assert.equal(result.fileName, 'My Resume.pdf');
    assert.equal(result.fileType, 'pdf');
    assert.equal('storageKey' in result, false); // The storage key must stay private
    assert.equal(storage.files.size, 1); // The file was saved
    assert.equal(repository.resumes.size, 1); // The record was created
});

test('upload accepts a DOCX file', async () => {
    const service = new ResumeService(new FakeResumeRepository(), new FakeFileStorage());

    const result = await service.upload(1, { originalName: 'resume.docx', content: docxContent });

    assert.equal(result.fileType, 'docx');
});

test('upload rejects a file type that is not allowed', async () => {
    const storage = new FakeFileStorage();
    const service = new ResumeService(new FakeResumeRepository(), storage);

    await assert.rejects(
        service.upload(1, { originalName: 'resume.txt', content: textContent }),
        InvalidResumeFileError,
    );
    assert.equal(storage.files.size, 0); // Nothing was saved
});

test('upload rejects a text file renamed to .pdf', async () => {
    const storage = new FakeFileStorage();
    const service = new ResumeService(new FakeResumeRepository(), storage);

    // The extension says PDF but the content does not start with %PDF
    await assert.rejects(
        service.upload(1, { originalName: 'resume.pdf', content: textContent }),
        InvalidResumeFileError,
    );
    assert.equal(storage.files.size, 0);
});

test('upload removes the stored file if the database record cannot be created', async () => {
    const repository = new FakeResumeRepository();
    repository.failOnCreate = true;
    const storage = new FakeFileStorage();
    const service = new ResumeService(repository, storage);

    await assert.rejects(service.upload(1, { originalName: 'resume.pdf', content: pdfContent }));
    assert.equal(storage.files.size, 0); // The saved file was cleaned up
});

test('upload strips folder names from the original file name', async () => {
    const service = new ResumeService(new FakeResumeRepository(), new FakeFileStorage());

    const result = await service.upload(1, { originalName: '../../secret/resume.pdf', content: pdfContent });

    assert.equal(result.fileName, 'resume.pdf');
});

test('list only returns the resumes of the given user', async () => {
    const otherUsersResume = { ...resume, id: 2, userId: 2 };
    const service = new ResumeService(new FakeResumeRepository([resume, otherUsersResume]), new FakeFileStorage());

    const result = await service.list(resume.userId);

    assert.equal(result.length, 1);
    assert.equal(result[0]?.id, resume.id);
});

test('getFile returns the content and mime type of an owned resume', async () => {
    const storage = new FakeFileStorage({ [resume.storageKey]: pdfContent });
    const service = new ResumeService(new FakeResumeRepository([resume]), storage);

    const result = await service.getFile(resume.userId, resume.id);

    assert.equal(result.mimeType, 'application/pdf');
    assert.deepEqual(result.content, pdfContent);
});

test('getFile hides resumes that belong to another user', async () => {
    const storage = new FakeFileStorage({ [resume.storageKey]: pdfContent });
    const service = new ResumeService(new FakeResumeRepository([resume]), storage);

    // User 2 asks for user 1's resume and gets "not found" instead of "forbidden"
    await assert.rejects(service.getFile(2, resume.id), ResumeNotFoundError);
});

test('delete removes the record and the stored file', async () => {
    const repository = new FakeResumeRepository([resume]);
    const storage = new FakeFileStorage({ [resume.storageKey]: pdfContent });
    const service = new ResumeService(repository, storage);

    await service.delete(resume.userId, resume.id);

    assert.equal(repository.resumes.size, 0);
    assert.equal(storage.files.size, 0);
});

test('delete refuses to remove a resume used in an application', async () => {
    const repository = new FakeResumeRepository([resume]);
    repository.resumesUsedInApplications.add(resume.id);
    const storage = new FakeFileStorage({ [resume.storageKey]: pdfContent });
    const service = new ResumeService(repository, storage);

    await assert.rejects(service.delete(resume.userId, resume.id), ResumeInUseError);
    assert.equal(repository.resumes.size, 1); // Nothing was deleted
    assert.equal(storage.files.size, 1);
});

test('delete hides resumes that belong to another user', async () => {
    const repository = new FakeResumeRepository([resume]);
    const service = new ResumeService(repository, new FakeFileStorage());

    await assert.rejects(service.delete(2, resume.id), ResumeNotFoundError);
    assert.equal(repository.resumes.size, 1);
});
