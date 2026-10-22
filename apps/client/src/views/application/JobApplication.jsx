import Job from '../../components/Job/Job';
import Application from '../../components/JobApplication/Application';

import './JobApplication.scss';

export default function JobApplication({ setView, job }) {
  return (
    <section className='job-application'>
      <main className='main-job-application'>
        {/* set the view to the search bar */}
        <p className="exit-main-job-application"onClick={() => {setView('job-search');}}> X </p>

        <section className='resume-application'>
          <h2> Resume </h2>
          <Application setView={setView} />
        </section>

        <section className='job-display'>
          <Job page={"application"} job={job} />
        </section>
      </main>
    </section>
  );
}
