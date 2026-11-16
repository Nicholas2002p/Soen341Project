import './ManageApplicants.scss';
import { useState, useEffect } from 'react';
import { useAuth } from '../../utils/Auth';
import { GetJobApplicationsApi, UpdateApplicationStatusApi } from '../../utils/Api';

export default function ManageApplicants({ jobId, setIsManaging }) {
  const { token } = useAuth();
  const [index, setIndex] = useState(0);
  const [applications, setApplications] = useState([]);

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

  const current = applications[index];

  const changeStatus = async (applicationId, status) => {
    const updated = await UpdateApplicationStatusApi(applicationId, status, token);
    if (!updated) return;
    setApplications((prev) =>
      prev.map((a) => (a.id === applicationId ? { ...a, status } : a))
    );
  };

  useEffect(() => {
  if (current && current.status === 'Applied') {
    changeStatus(current.id, 'Under Review');
  }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [current?.id]);

  const prevResume = () => {
    if (index === 0) return;
    setIndex(index - 1);
  }

  const nextResume = () => {
    if (index === applications.length - 1) return;
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

      {current && (
        <ApplicationMenu
          status={current.status}
          onChange={(status) => changeStatus(current.id, status)}
        />
      )}
    </section>
  );
}

function ApplicationMenu({ status, onChange }) {
  return (
    <section className='recruiter-application-menu'>
      <div className='application-menu'>
        <h2> Application menu </h2>
        <div className='application-menu-options'>
          <button disabled={status === 'offered'} onClick={() => onChange("Offered")}> <div className='status offered'></div> Accept </button>
          <button disabled={status === 'interview'} onClick={() => onChange("Interview")}> <div className='status interview'></div> Interview </button>
          <button disabled={status === 'rejected'} onClick={() => onChange("Rejected")}> <div className='status rejected'></div> Reject </button>
        </div>
      </div>
    </section>
  )
}

function ApplicationResumes({ application }) {
  return (
    <section className='recruiter-application-resumes'>
      <p> {application.applicant?.email} </p>
      <p> {application.resume?.fileName} </p>
    </section>
  )
}

function isManaging_UnderReview() {
  // call api to update resume status to under review
}

function updateApplicationStatus(status) {
  // call api to update the status
}