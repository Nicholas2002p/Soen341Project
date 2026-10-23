import Job from '../../components/Job/Job';
import Application from '../../components/JobApplication/Application';
import { ApplyForJob } from '../../utils/Api';
import { useState } from 'react';
import './JobApplication.scss';
import { useAuth } from '../../utils/Auth';

export default function JobApplication({ setView, job }) {
  const [selectedResumeId, setSelectedResumeId] = useState(null);
  const { token } = useAuth();

  const handleApply = async () => {
      const success = await ApplyForJob(job.jobId, selectedResumeId, token);

      if (success) {
        console.log("It worked!")
      }
  };

  return (
    <section className='job-application'>
      <main className='main-job-application'>
        {/* set the view to the search bar */}
        <p className="exit-main-job-application"onClick={() => {setView('job-search');}}> X </p>

        <section className='resume-application'>
          <h2> Resume </h2>
          <Application handleApply={handleApply} selectedResumeId={selectedResumeId} setSelectedResumeId={setSelectedResumeId}/>
        </section>

        <section className='job-display'>
          <Job page={"application"} job={job} />
        </section>
      </main>
    </section>
  );
}


