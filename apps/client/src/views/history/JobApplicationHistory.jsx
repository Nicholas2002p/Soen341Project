import { useState, useEffect } from 'react';
import { useAuth } from '../../utils/Auth';
import { GetJobHistory } from '../../utils/Api';

import HistoryFilters from '../../components/History/HistoryFilters';
import HistoryJobApplication from '../../components/History/HistoryInfo';
import Analytics from '../../components/analytics/Insights';
import Nav from '../../components/Navigation/Nav';

import './JobApplicationHistory.scss';
/**
 * Job Application History
 * main page that displays the job application history
 * 
 * @returns Job Application History Component
 */
export default function JobApplicationHistory({ }) {
  const [history, setHistory] = useState([]);
  const [filterHistory, setFilterHistory] = useState([]);
  const { token } = useAuth();

  useEffect(() => {
    const SeeHistory = async () => {
      const data = await GetJobHistory(token);
      if (!data) return;
      setHistory(data);
      setFilterHistory(data);
    };
    SeeHistory();
  }, [token]);
  
  return (
    <section className='history-job-application'>
      <Nav />

      <Analytics />
      
      <main className='history'>
        <HistoryFilters history={history} setFilterHistory={setFilterHistory} />

        <section className='history-applications'>
          <h2> Job History </h2>
          { filterHistory.map((h) => <HistoryJobApplication history={h}/>) }
        </section>
      </main>
    </section>
  );
}
