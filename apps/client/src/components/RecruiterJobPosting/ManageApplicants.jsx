import './ManageApplicants.scss';
import { useState, useEffect } from 'react';
import { useAuth } from '../../utils/Auth';
import { GetJobApplicationsApi, UpdateApplicationStatusApi } from '../../utils/Api';

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
        />

        {current && (
          <ApplicationMenu
            status={current.status}
            onChange={(status) => changeStatus(current.id, status)}
          />
        )}
      </div>
    </section>
  );
}

function ApplicationMenu({ status, onChange }) {
  const isFinal = status === 'Offered' || status === 'Rejected';

  return (
    <section className='recruiter-application-menu'>
      <div className='application-menu'>
        <h2> Application menu </h2>
        <div className='application-menu-options'>
          <button disabled={isFinal || status === 'Offered'} onClick={() => onChange("Offered")}> <div className='status offered'></div> Accept </button>
          <button disabled={isFinal || status === 'Under_Review'} onClick={() => onChange("Under_Review")}> <div className='status Under Review'></div> Under Review </button>
          <button disabled={isFinal || status === 'Interview'} onClick={() => onChange("Interview")}> <div className='status interview'></div> Interview </button>
          <button disabled={isFinal || status === 'Rejected'} onClick={() => onChange("Rejected")}> <div className='status rejected'></div> Reject </button>
        </div>
      </div>
    </section>
  )
}

function ApplicationResumes({ application }) {
  return (
    <section className='recruiter-application-resumes'>
      <div className='applicant-email'> {application.applicant?.email} </div>
      <div className='applicant-resume'> {application.resume?.fileName} </div>
      <div className='applicant-status'> Status: {application.status} </div>
      <div className='applicant-applied'> Applied: {new Date(application.appliedAt).toLocaleString()} </div>
    </section>
  )
}

function FilterMenu({ startDate, setStartDate, statusFilter, setStatusFilter }) {
  return (
    <section className='recruiter-application-menu'>
      <div className='application-menu'>
        <h2> Filters </h2>
        <div className='application-menu-options'>
          <label>
            From:
            <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
          </label>
          <label>
            Status:
            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
              <option value="All">All</option>
              <option value="Applied">Applied</option>
              <option value="Under_Review">Under Review</option>
              <option value="Interview">Interview</option>
              <option value="Offered">Offered</option>
              <option value="Rejected">Rejected</option>
            </select>
          </label>
        </div>
      </div>
    </section>
  );
}
