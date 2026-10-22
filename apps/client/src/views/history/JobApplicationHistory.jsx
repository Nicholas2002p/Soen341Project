import { useState } from 'react';

import HistoryFilters from '../../components/History/HistoryFilters';
import HistoryJobApplication from '../../components/History/HistoryInfo';
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

// =========================================== SAMPLE DATA ===========================================

const jobApplications = [
  {}, {}, {}, {}, {}, {}, {}, {}
]