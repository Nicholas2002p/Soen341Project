import { useState } from 'react';
import './ResumeUpload.scss';

/**
 * Resume Upload
 * this uploads the resume and displays it onto the profile 
 * 
 * @returns the resume upload component
 */
export default function ResumeUpload({}) {
  const [resume, setResume] = useState('');

  return (
    <section className="resume-upload">
      <h2> RESUME UPLOAD </h2>

      <img src="random_cv.png" alt="" />

      <button className='resume-upload-button' type="submit" onClick={() => { UploadResume(resume) }}>
        Upload Resume
      </button>
    </section>
  );
}

function UploadResume(resume) {
  // call api to update the resume
}