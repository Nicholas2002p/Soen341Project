import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { useAuth } from "../../utils/Auth";
import { AutoApplyApi, GetResumesApi } from "../../utils/Api";
import "./AutoApply.scss";

/**
 * Lets a job seeker pick one of their PDF resumes and let the AI apply to the open jobs that match it
 */
export default function AutoApply() {
  const { token, user } = useAuth();
  const navigate = useNavigate();
  const [resumes, setResumes] = useState([]);
  const [resumeId, setResumeId] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [result, setResult] = useState(null);

  const isJobSeeker = Boolean(token) && user?.role === "jobseeker";

  // Load the user's resumes. Only PDF files can be read by the AI.
  useEffect(() => {
    if (!isJobSeeker) {
      return;
    }

    const loadResumes = async () => {
      const allResumes = await GetResumesApi(setErrorMessage, token);
      const pdfResumes = allResumes.filter((resume) => resume.fileType === "pdf");
      setResumes(pdfResumes);

      if (pdfResumes.length > 0) {
        setResumeId(String(pdfResumes[0].id));
      }
    };

    loadResumes();
  }, [isJobSeeker, token]);

  if (!isJobSeeker) {
    return null;
  }

  const handleAutoApply = async () => {
    setLoading(true);
    setErrorMessage("");
    setResult(null);

    const { result: autoApplyResult, error } = await AutoApplyApi(resumeId, token);

    if (error) {
      setErrorMessage(error);
    } else {
      setResult(autoApplyResult);
    }

    setLoading(false);
  };

  return (
    <section className="auto-apply">
      <h2>Auto apply with AI</h2>
      <p>The AI compares your resume with the open jobs and applies to the ones that match it best (score of 70 or more, up to 10 jobs).</p>

      {resumes.length === 0 ? (
        <p>Upload a PDF resume on your profile to use auto apply.</p>
      ) : (
        <div className="auto-apply-controls">
          <label htmlFor="auto-apply-resume">Resume:</label>
          <select id="auto-apply-resume" value={resumeId} onChange={(e) => setResumeId(e.target.value)} disabled={loading}>
            {resumes.map((resume) => (
              <option key={resume.id} value={resume.id}>{resume.fileName}</option>
            ))}
          </select>
          <button onClick={handleAutoApply} disabled={loading || !resumeId}>
            {loading ? "Applying..." : "Auto apply"}
          </button>
        </div>
      )}

      {loading && <p>The AI is reviewing the open jobs, this can take up to 30 seconds.</p>}
      {errorMessage && <p className="error-text">{errorMessage}</p>}

      {result && (
        <div className="auto-apply-result">
          <p>
            Reviewed {result.reviewedJobCount} open jobs and applied to {result.appliedCount}.
          </p>
          {result.applied.length > 0 && (
            <ul>
              {result.applied.map((job) => (
                <li key={job.applicationId}>
                  <strong>{job.title}</strong> at {job.companyName} (score {job.score}): {job.reason}
                </li>
              ))}
            </ul>
          )}
          <button onClick={() => navigate("/history")}>See my applications</button>
        </div>
      )}
    </section>
  );
}