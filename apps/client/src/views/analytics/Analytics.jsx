import { useState, useEffect } from 'react';
import { useAuth } from '../../utils/Auth';
import Nav from '../../components/Navigation/Nav';
import './JobApplicationHistory.scss';
import {GetAnalytics} from '../../utils/Api';

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
      const data = await GetAnalytics(token);
      if (!data) return;
      setAnalytics(data);
    };
    SeeHistory();
  }, [token]);
  
  return (
    <section className='analytics'>
      <Nav setView={setView} />
      
      <main className='main_analytics'>
        
      </main>
    </section>
  );
}
