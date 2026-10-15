import { useState } from 'react';
import { useAuth } from '../utils/Auth';
import { UploadResumeApi } from '../utils/Api';
import './ResumeUpload.scss';

/**
 * Resume Upload
 * this uploads the resume and displays it onto the profile 
 * 
 * @returns the resume upload component
 */
export default function ResumeUpload() {
  const { token } = useAuth();
  const [resume, setResume] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');

  return (
    <section className="resume-upload">
      <h2>Resume Upload</h2>

      <img src="random_cv.png" alt="" />
      <input
        type="file"
        accept=".pdf,.doc,.docx"
        onChange={(event) => setResume(event.target.files?.[0] ?? null)}
      />
      {errorMessage && <span className="error-text">{errorMessage}</span>}

      <button
        className='resume-upload-button'
        type="button"
        disabled={!resume}
        onClick={async () => {
          const uploaded = await UploadResumeApi(resume, setErrorMessage, token);
          if (uploaded) {
            setResume(null);
            setErrorMessage('Resume uploaded.');
          }
        }}
      >
        Upload Resume
      </button>
    </section>
  );
}