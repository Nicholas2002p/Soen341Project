import { useState, useEffect } from 'react';
import { useAuth } from '../../utils/Auth';
import { GetJobHistory } from '../../utils/Api';

import './SaveJob.scss';

export default function SaveJob({ savedJobs }) {
  const { token } = useAuth();
  const [history, setHistory] = useState([]);

  useEffect(() => {
    const SeeHistory = async () => {
      const data = await GetJobHistory(token);
      if (!data) return;
      setHistory(data);
    };
    SeeHistory();
  }, [token]);

  return (
    <section className='saved-jobs'>
      <h2> SAVED JOBS </h2>

      <ul className="saved-jobs-list">
        { savedJobs.length == 0 ? 
          <li> There are no saved jobs </li> : savedJobs.map((job) => <SavedJob job={job} applied={history.some((application) => application.jobId === job.jobId)} /> 
        )}
      </ul>

    </section>
  );
}

function SavedJob({ job, applied }) {
  const date = new Date(job.deadline);

  return (
    <li className='saved-job'> 
      <p className='saved-job-deadline'> Deadline {date.toLocaleDateString()}: </p> 
      <div className='saved-job-info'>
        <p className='saved-job-title'> {job.title} </p>
        <p className='saved-job-detail'> {job.company.name}, {job.location} </p> 
      </div>
      <div className='saved-job-application'>
        {applied ? <p className="applied-job"> Applied </p> : <p> Not Applied </p> }
      </div>
    </li>
  );
}