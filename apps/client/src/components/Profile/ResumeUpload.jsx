import { useState, useEffect } from 'react';

import { useAuth } from '../../utils/Auth';
import { UploadResumeApi, GetResumesApi, DownloadResumeApi, DeleteResumeApi } from '../../utils/Api';

import './ResumeUpload.scss';

/**
 * Resume Upload
 * lets the user upload a resume and shows the list of uploaded resumes
 * (download and delete for each one)
 *
 * @returns the resume upload component
 */
export default function ResumeUpload() {
  const { token } = useAuth();
  const [file, setFile] = useState(null);
  const [resumes, setResumes] = useState([]);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [inputKey, setInputKey] = useState(0);

  // Load the user's resumes when the component is shown
  useEffect(() => {
    const loadResumes = async () => {
      setResumes(await GetResumesApi(setErrorMessage, token));
    };
    loadResumes();
  }, [token]);

  const handleUpload = async () => {
    setErrorMessage('');
    setSuccessMessage('');

    const uploaded = await UploadResumeApi(file, setErrorMessage, token);
    if (uploaded) {
      setResumes((current) => [uploaded, ...current]);
      setSuccessMessage('Resume uploaded.');
      setFile(null);
      setInputKey((key) => key + 1); // clears the file input
    }
  };

  const handleDelete = async (resumeId) => {
    setErrorMessage('');
    setSuccessMessage('');

    const deleted = await DeleteResumeApi(resumeId, setErrorMessage, token);
    if (deleted) {
      setResumes((current) => current.filter((resume) => resume.id !== resumeId));
      setSuccessMessage('Resume deleted.');
    }
  };

  return (
    <section className="resume-upload">
      <h2>Resume Upload</h2>

      <input
        key={inputKey}
        className="resume-upload-input"
        type="file"
        accept=".pdf,.doc,.docx"
        onChange={(e) => setFile(e.target.files?.[0] ?? null)}
      />

      <button
        className="resume-upload-button"
        type="button"
        disabled={!file}
        onClick={handleUpload}
      >
        Upload Resume
      </button>

      {errorMessage && <p className="resume-error">{errorMessage}</p>}
      {successMessage && <p className="resume-success">{successMessage}</p>}

      <h3>My Resumes</h3>
      {resumes.length === 0 ? (
        <p className="resume-empty">No resume uploaded yet.</p>
      ) : (
        <ul className="resume-list">
          {resumes.map((resume) => (
            <li key={resume.id} className="resume-item">
              <span className="resume-name">{resume.fileName}</span>
              <span className="resume-date">{new Date(resume.createdAt).toLocaleDateString()}</span>
              <button type="button" onClick={() => DownloadResumeApi(resume, setErrorMessage, token)}>
                Download
              </button>
              <button type="button" onClick={() => handleDelete(resume.id)}>
                Delete
              </button>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}