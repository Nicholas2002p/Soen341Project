import { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router';
import { ApplyForJob, GetSpecificJobHistory } from '../../utils/Api';
import { useAuth } from '../../utils/Auth';

import Job from '../../components/Job/Job';
import Application from '../../components/JobApplication/Application';

import './JobApplication.scss';

export default function JobApplication({ job }) {
  const { jobId } = useParams();
  const [selectedResumeId, setSelectedResumeId] = useState(null);
  const [alreadyApplied, setAlreadyApplied] = useState(false);
  const { token } = useAuth();

  useEffect(() => {
    if (job.jobId == jobId) console.log("same")

    const SeeIfAlreadyApplied = async () => {
      const data = await GetSpecificJobHistory(jobId, token);
      if (!data) return;
      setAlreadyApplied(true);
    };
    SeeIfAlreadyApplied();
  }, [token, job])

  /**
   * on submition calls api to apply for job and sets boolean to true so they can not apply again if successful
   */
  const handleApply = async () => {
      const success = await ApplyForJob(jobId, selectedResumeId, token);

      if (success) {
        setAlreadyApplied(true);
      }
  };

  return (
    <section className='job-application'>
      <main className='main-job-application'>
        <Link className="exit-main-job-application" to="/job-search"> X </Link>

        <section className='resume-application'>
          <h2> Resume </h2>
          <Application handleApply={handleApply} selectedResumeId={selectedResumeId} setSelectedResumeId={setSelectedResumeId} alreadyApplied={alreadyApplied} id={jobId}/>
        </section>

        <section className='job-display'>
          <Job page={"application"} job={job} />
        </section>
      </main>
    </section>
  );
}


