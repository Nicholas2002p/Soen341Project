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
export default function HistoryJobApplication({history}) {
  const [arrow, setArrow] = useState(true);

  return (
    <section className='history-application'>
      <div className='history-application-header'>
        <p className='history-application-title'> {history.job.title} </p>

        <div className='status-arrow'>
          <div className={`status ${history.status.toLowerCase()}`}></div>
          <div className='status rejected'></div>
          <p onClick={() => { setArrow(!arrow) }} className='history-arrow'> { arrow ? <> &#x25BC; </> : <> &#x25B2; </> } </p>
        </div>
      </div>

      <div className={arrow ? "display-none" : "history-application-info"}>
        <p>Status: {history.status}</p>
        <p>Company: {history.job.companyName}</p>
        <p>Applied: {new Date(history.appliedAt).toLocaleDateString()}</p>
        <p>Resume: #{history.resumeId}</p>
      </div>
    </section>
  );
}
