import { useState, useEffect } from 'react';
import { useAuth } from '../../utils/Auth';
import Nav from '../../components/Navigation/Nav';
import {GetAnalyticsApi} from '../../utils/Api';

/**
 * Job Application History
 * main page that displays the job application history
 * 
 * @param {Function} setView - changes the view inside of the nav 
 * @returns Job Application History Component
 */
export default function Analytics({ setView }) {
  const [analytics, setAnalytics] = useState([]);
  
  const { token } = useAuth();

  useEffect(() => {
    const SeeHistory = async () => {
      const data = await GetAnalyticsApi(token);
      if (!data) return;
      setAnalytics(data);
    };
    SeeHistory();
  }, [token]);
  
  return (
    <section className='analytics'>
      <Nav setView={setView} />
      
      <main className='main_analytics'>
         {analytics && (
        <>
          <div>Total: {analytics.total}</div>
          <div>Pending: {analytics.pending}</div>
          <div>Applied: {analytics.byStatus?.Applied}</div>
          <div>Under Review: {analytics.byStatus?.Under_Review}</div>
          <div>Interview: {analytics.byStatus?.Interview}</div>
          <div>Offered: {analytics.byStatus?.Offered}</div>
          <div>Rejected: {analytics.byStatus?.Rejected}</div>
          <div>Interview Rate: {analytics.interviewRate}</div>
          <div>Submitted Over Time: {analytics.submittedOverTime?.length} entries</div>
        </>)}
      </main>
    </section>
  );
}
