import './ManageApplicants.scss';
import { useState, useEffect } from 'react';
import { useAuth } from '../../utils/Auth';
import { GetJobApplicationsApi, UpdateApplicationStatusApi, GetResumeAsRecruiterApi } from '../../utils/Api';

export default function ManageApplicants({ jobId, setIsManaging }) {
  const { token } = useAuth();
  const [index, setIndex] = useState(0);
  const [applications, setApplications] = useState([]);
  const [startDate, setStartDate] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');

  useEffect(() => {
    console.log(jobId)
    if (!jobId) return;
    const load = async () => {
      const data = await GetJobApplicationsApi(jobId, token);
      console.log(data);
      if (!data) return;
      setApplications(data);
      setIndex(0);
    };
    load();
  }, [jobId, token])

  const filtered = applications.filter((a) =>
    (statusFilter === 'All' || a.status === statusFilter) &&
    (!startDate || new Date(a.appliedAt) >= new Date(`${startDate}T00:00:00`))
  );

  const current = filtered[index];

  const changeStatus = async (applicationId, status) => {
    const updated = await UpdateApplicationStatusApi(applicationId, status, token);
    if (!updated) return;
    setApplications((prev) =>
      prev.map((a) => (a.id === applicationId ? { ...a, status } : a))
    );
  };

  const prevResume = () => {
    if (index === 0) return;
    setIndex(index - 1);
  }

  const nextResume = () => {
    if (index >= filtered.length - 1) return;
    setIndex(index + 1);
  }

  return (
    <section className="recruiter-manage-applicants">
      <button className="leave" onClick={() => { setIsManaging(false); }}> X </button>

      <section className='manage-applicants'>
        {current ? (
          <div>
            <button onClick={prevResume}> &lt; </button>
            <ApplicationResumes application={current} />
            <button onClick={nextResume}> &gt; </button>
          </div>
        ) : (
          <p> No applications yet </p>
        )}
      </section>

      <div className="application-side">
        <FilterMenu
          startDate={startDate}
          setStartDate={(v) => { setStartDate(v); setIndex(0); }}
          statusFilter={statusFilter}
          setStatusFilter={(v) => { setStatusFilter(v); setIndex(0); }}
          matchCount={filtered.length}
          onClear={() => { setStartDate(''); setStatusFilter('All'); setIndex(0); }}
        />

        
          <ApplicationMenu
            status={current?.status}
            disabled={!current}
            onChange={(status) => changeStatus(current.id, status)}
          />
        
      </div>
    </section>
  );
}

function ApplicationMenu({ status, onChange }) {
  const isFinal = !status || status === 'Offered' || status === 'Rejected';

  return (
    <section className='recruiter-application-menu'>
      <div className='application-menu'>
        <h2> Application menu </h2>
        <div className='application-menu-options'>
          <button disabled={isFinal || status === 'Offered'} onClick={() => onChange("Offered")}> <div className='status offered'></div> Accept </button>
          <button disabled={isFinal || status === 'Under_Review'} onClick={() => onChange("Under_Review")}> <div className='status under_review'></div> Under Review </button>
          <button disabled={isFinal || status === 'Interview'} onClick={() => onChange("Interview")}> <div className='status interview'></div> Interview </button>
          <button disabled={isFinal || status === 'Rejected'} onClick={() => onChange("Rejected")}> <div className='status rejected'></div> Reject </button>
        </div>
      </div>
    </section>
  )
}

function ApplicationResumes({ application }) {
  const { token } = useAuth();
  const [resume, setResume] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    let objectUrl = null;

    const load = async () => {
      setResume(null);
      setLoading(true);

      const r = await GetResumeAsRecruiterApi(token, application.id);

      if (cancelled) {
        if (r) URL.revokeObjectURL(r.url);
        return;
      }
      if (r) objectUrl = r.url;
      setResume(r);
      setLoading(false);
    };

    load();

    return () => {
      cancelled = true;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [token, application.id]);

  return (
    <section className="recruiter-application-resumes">
      <div className="applicant-info">
        <div className="applicant-email"> {application.applicant?.email} </div>
        <div className="applicant-status"> Status: {application.status} </div>
        <div className="applicant-applied"> Applied: {new Date(application.appliedAt).toLocaleString()} </div>
      </div>
        <div className="applicant-resume-preview">
          {loading && <p> Loading resume</p>}

          {!loading && !resume && <p> Resume unavailable. </p>}

          {!loading && resume && 
              <iframe src={resume.url} title="Resume" />
          }
        </div>

    </section>
  );
}

const STATUS_OPTIONS = [
  { value: 'All', label: 'All' },
  { value: 'Applied', label: 'Applied' },
  { value: 'Under_Review', label: 'Under review' },
  { value: 'Interview', label: 'Interview' },
  { value: 'Offered', label: 'Offered' },
  { value: 'Rejected', label: 'Rejected' },
];

function FilterMenu({ startDate, setStartDate, statusFilter, setStatusFilter, matchCount, onClear }) {
  return (
    <section className="recruiter-application-menu">
      <div className="filter-card">
        <div className="filter-header">
          <h2> Filters </h2>
          <button className="filter-clear" onClick={onClear}> Clear all </button>
        </div>

        <label className="filter-label" htmlFor="filter-date"> Applied from </label>
        <input
          id="filter-date"
          className="filter-date"
          type="date"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
        />

        <span className="filter-label"> Status </span>
        <div className="filter-chips">
          {STATUS_OPTIONS.map((s) => (
            <button
              key={s.value}
              className={`filter-chip ${statusFilter === s.value ? 'active' : ''}`}
              onClick={() => setStatusFilter(s.value)}
            >
              {s.label}
            </button>
          ))}
        </div>

        <p className="filter-count"> {matchCount} {matchCount === 1 ? 'applicant matches' : 'applicants match'} </p>
      </div>
    </section>
  );
}
