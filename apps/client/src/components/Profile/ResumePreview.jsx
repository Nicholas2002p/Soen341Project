import { useState, useEffect } from 'react';

import { useAuth } from '../../utils/Auth';
import { GetResumeFileUrlApi, DownloadResumeApi } from '../../utils/Api';

import './ResumePreview.scss';

/**
 * Resume Preview
 * shows the content of a resume in the page 
 * PDFs are displayed directly; Word files can only be downloaded
 *
 * @param {object} props.resume - the resume to show ({ id, fileName, fileType })
 * @returns the resume preview component
 */
export default function ResumePreview({ resume }) {
  const { token } = useAuth();
  const [fileUrl, setFileUrl] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');
  const isPdf = resume.fileType === 'pdf';

  // Load the file when the preview is shown, and free the temporary URL when it's closed
  useEffect(() => {
    if (!isPdf) return;

    let cancelled = false;
    let url = null;

    const loadFile = async () => {
      url = await GetResumeFileUrlApi(resume.id, setErrorMessage, token);
      if (cancelled) {
        if (url) URL.revokeObjectURL(url);
        return;
      }
      setFileUrl(url);
    };
    loadFile();

    return () => {
      cancelled = true;
      if (url) URL.revokeObjectURL(url);
    };
  }, [resume.id, isPdf, token]);

  if (!isPdf) {
    return (
      <div className="resume-preview resume-preview-message">
        <p>Preview is only available for PDF files.</p>
        <button type="button" onClick={() => DownloadResumeApi(resume, setErrorMessage, token)}>
          Download {resume.fileName}
        </button>
      </div>
    );
  }

  if (errorMessage) {
    return <p className="resume-preview resume-preview-message resume-preview-error">{errorMessage}</p>;
  }

  if (!fileUrl) {
    return <p className="resume-preview resume-preview-message">Loading resume...</p>;
  }

  return (
    <iframe
      className="resume-preview resume-preview-frame"
      src={fileUrl}
      title={`Preview of ${resume.fileName}`}
    />
  );
}