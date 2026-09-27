import assert from 'node:assert/strict';
import test from 'node:test';
import { ResumeService } from '../../src/application/services/ResumeService.js';
import { InvalidResumeFileError } from '../../src/domain/errors/InvalidResumeFileError.js';
import { ResumeInUseError } from '../../src/domain/errors/ResumeInUseError.js';
import { ResumeNotFoundError } from '../../src/domain/errors/ResumeNotFoundError.js';
import { ResumeUploadError } from '../../src/domain/errors/ResumeUploadError.js';
import { ResumeFileMissingError } from '../../src/domain/errors/ResumeFileMissingError.js';
import {
    FakeFileStorage,
    FakeResumeRepository,
    docContent,
    docxContent,
    excelContent,
    pdfContent,
    resume,
    textContent,
    zipContent,
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

test('upload accepts a DOC file', async () => {
    const service = new ResumeService(new FakeResumeRepository(), new FakeFileStorage());

    const result = await service.upload(1, { originalName: 'resume.doc', content: docContent });

    assert.equal(result.fileType, 'doc');
});

test('upload rejects a plain zip file renamed to .docx', async () => {
    const storage = new FakeFileStorage();
    const service = new ResumeService(new FakeResumeRepository(), storage);

    // It has the ZIP signature but none of the entries every .docx contains
    await assert.rejects(
        service.upload(1, { originalName: 'resume.docx', content: zipContent }),
        InvalidResumeFileError,
    );
    assert.equal(storage.files.size, 0);
});

test('upload rejects an old Excel file renamed to .doc', async () => {
    const service = new ResumeService(new FakeResumeRepository(), new FakeFileStorage());

    // Same signature as .doc but no WordDocument stream
    await assert.rejects(
        service.upload(1, { originalName: 'resume.doc', content: excelContent }),
        InvalidResumeFileError,
    );
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

    // The database error is replaced by a clear message, the original is kept as the cause for logging
    await assert.rejects(
        service.upload(1, { originalName: 'resume.pdf', content: pdfContent }),
        (error: Error) => error instanceof ResumeUploadError && error.cause instanceof Error,
    );
    assert.equal(storage.files.size, 0); // The saved file was cleaned up
});

test('upload reports a clear error if the file cannot be stored', async () => {
    const repository = new FakeResumeRepository();
    const storage = new FakeFileStorage();
    storage.failOnSave = true;
    const service = new ResumeService(repository, storage);

    await assert.rejects(
        service.upload(1, { originalName: 'resume.pdf', content: pdfContent }),
        ResumeUploadError,
    );
    assert.equal(repository.resumes.size, 0); // No record was created
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

test('getFile reports a missing file when the record exists but the file is gone', async () => {
    // The record exists but the storage is empty
    const service = new ResumeService(new FakeResumeRepository([resume]), new FakeFileStorage());

    await assert.rejects(service.getFile(resume.userId, resume.id), ResumeFileMissingError);
});

test('getFile passes database errors on without hiding them', async () => {
    const repository = new FakeResumeRepository([resume]);
    repository.failOnGetById = true;
    const service = new ResumeService(repository, new FakeFileStorage());

    await assert.rejects(service.getFile(resume.userId, resume.id), /Database unavailable/);
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
