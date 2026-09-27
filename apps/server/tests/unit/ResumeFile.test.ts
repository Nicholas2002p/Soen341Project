import assert from 'node:assert/strict';
import test from 'node:test';
import { detectResumeFileType, getResumeFileType } from '../../src/domain/validation/ResumeFile.js';
import { docContent, docxContent, excelContent, pdfContent, textContent, zipContent } from '../fakes/ResumeFakes.js';

test('detectResumeFileType accepts files whose extension and content match', () => {
    assert.equal(detectResumeFileType('cv.pdf', pdfContent), 'pdf');
    assert.equal(detectResumeFileType('cv.DOCX', docxContent), 'docx'); // Extension check is case-insensitive
    assert.equal(detectResumeFileType('cv.doc', docContent), 'doc');
});

test('detectResumeFileType rejects files whose content does not match the extension', () => {
    assert.equal(detectResumeFileType('cv.pdf', textContent), null);
    assert.equal(detectResumeFileType('cv.pdf', docxContent), null); // A .docx renamed to .pdf
    assert.equal(detectResumeFileType('cv.docx', zipContent), null); // A plain zip renamed to .docx
    assert.equal(detectResumeFileType('cv.doc', excelContent), null); // An old Excel file renamed to .doc
});

test('detectResumeFileType rejects extensions that are not allowed', () => {
    assert.equal(detectResumeFileType('cv.txt', textContent), null);
    assert.equal(detectResumeFileType('cv', pdfContent), null);
});

test('getResumeFileType returns null instead of guessing for an unknown extension', () => {
    assert.equal(getResumeFileType('abc.docx'), 'docx');
    assert.equal(getResumeFileType('abc.exe'), null);
    assert.equal(getResumeFileType('abc'), null);
});
