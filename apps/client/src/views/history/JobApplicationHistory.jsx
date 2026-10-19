import { useState } from 'react';
import Nav from '../../components/Navigation/Nav';
import './JobApplicationHistory.scss';

export default function JobApplicationHistory({ setView }) {
  return (
    <section className='history-job-application'>
      <Nav setView={setView} />
      
      <main className='history'>
        <HistoryFilters />

        <section className='history-applications'>
          <h2> Job History </h2>
          { jobApplications.map(() => <HistoryJobApplication />) }
        </section>
      </main>
    </section>
  );
}

function HistoryFilters({}) {
  return (
    <fieldset className='history-filters'>
      <legend> Application Filters </legend>
      
      <label htmlFor="">
        <input type="checkbox" value="applied" id="applied" name="applied" checked />
        Applied
      </label>

      <label htmlFor="">
        <input type="checkbox" value="offered" id="offered" name="offered" checked />
        Accepted
      </label>

      <label htmlFor="">
        <input type="checkbox" value="interview" id="interview" name="interview" checked />
        Interview
      </label>

      <label htmlFor="">
        <input type="checkbox" value="under_review" id="under_review" name="under_review" checked />
        Pending
      </label>

      <label htmlFor="">
        <input type="checkbox" value="rejected" id="rejected" name="rejected" checked />
        Rejected        
      </label>
    </fieldset>
  );
}

function HistoryJobApplication({}) {
  const [arrow, setArrow] = useState(true);

  return (
    <section className='history-application'>
      <div className='history-application-header'>
        <p className='history-application-title'> Job Title </p>

        <div className='status-arrow'>
          <div className='status'></div>
          <p onClick={() => { setArrow(!arrow) }} className='history-arrow'> { arrow ? <> &#x25BC; </> : <> &#x25B2; </> } </p>
        </div>
      </div>

      <div className={arrow ? "display-none" : "history-application-info"}>
        <p> Resume for now </p>
      </div>
    </section>
  );
}


// =========================================== SAMPLE DATA ===========================================

const jobApplications = [
  {}, {}, {}, {}, {}, {}, {}, {}
]