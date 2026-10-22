import { useState } from 'react';
 
import './HistoryInfo.scss';
import './HistoryFilters.scss';

/**
 * History Job Application
 * represents a single box that displays the details of the job application
 * 
 * @param {Object} application - the details of the job application
 * feel free to change the name of the param  
 * @returns History Job Application component
 */
export default function HistoryJobApplication({}) {
  const [arrow, setArrow] = useState(true);

  return (
    <section className='history-application'>
      <div className='history-application-header'>
        <p className='history-application-title'> Job Title </p>

        <div className='status-arrow'>
          {/* change status to job-history.status => className={`status ${history.status}`}*/}
          <div className='status rejected'></div>
          <p onClick={() => { setArrow(!arrow) }} className='history-arrow'> { arrow ? <> &#x25BC; </> : <> &#x25B2; </> } </p>
        </div>
      </div>

      <div className={arrow ? "display-none" : "history-application-info"}>
        <p> Add the status again </p>
        <p> Resume for now </p>
        <p> At which company </p>
      </div>
    </section>
  );
}
