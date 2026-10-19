import Job from '../../components/RecruiterJobPosting/Job';
import Application from '../../components/JobApplication/Application';

import './JobApplication.scss';

export default function JobApplication({ setView }) {
  return (
    <section className='job-application'>
      <main className='main-job-application'>
        {/* set the view to the search bar */}
        <p className="exit-main-job-application"onClick={() => {setView();}}> X </p>

        <section className='resume-application'>
          <h2> Resume </h2>
          <Application setView={setView} />
        </section>

        <section className='job-display'>
          <Job page={"application"} />
        </section>
      </main>
    </section>
  );
}
