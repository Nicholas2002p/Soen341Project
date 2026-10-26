import { useState, useEffect } from 'react';
import { useAuth } from '../../utils/Auth';
import HistoryFilters from '../../components/History/HistoryFilters';
import HistoryJobApplication from '../../components/History/HistoryInfo';
import Nav from '../../components/Navigation/Nav';
import './JobApplicationHistory.scss';
import {GetJobHistory} from '../../utils/Api';

/**
 * Job Application History
 * main page that displays the job application history
 * 
 * @param {Function} setView - changes the view inside of the nav 
 * @returns Job Application History Component
 */
export default function JobApplicationHistory({ setView }) {
  const [errorMessage, setErrorMessage] = useState("");
  const [history, setHistory] = useState([]);
  const [filterHistory, setFilterHistory] = useState([]);
  const { token } = useAuth();

  useEffect(() => {
    const SeeHistory = async () => {
      const data = await GetJobHistory(token, setErrorMessage);
      if (!data) return;
      setHistory(data);
      setFilterHistory(data);
    };
    SeeHistory();
  }, [token, errorMessage]);
  
  return (
    <section className='history-job-application'>
      <Nav setView={setView} />
      
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
