import { useState } from 'react';

export default function ResumeUpload({}) {
  const [resume, setResume] = useState('');

  return (
    <section className="resume-upload">
      <h2> RESUME UPLOAD </h2>

      

      <button type="submit" onClick={() => { UploadResume(resume) }}>
        Upload Resume
      </button>
    </section>
  );
}

function UploadResume(resume) {
  // call api to update the resume
}