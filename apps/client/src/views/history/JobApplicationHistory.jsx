import { useState } from 'react';

import HistoryFilters from '../../components/History/HistoryFilters';
import HistoryJobApplication from '../../components/History/HistoryInfo';
import Nav from '../../components/Navigation/Nav';
import './JobApplicationHistory.scss';

/**
 * Job Application History
 * main page that displays the job application history
 * 
 * @param {Function} setView - changes the view inside of the nav 
 * @returns Job Application History Component
 */
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

// =========================================== SAMPLE DATA ===========================================

const jobApplications = [
  {}, {}, {}, {}, {}, {}, {}, {}
]