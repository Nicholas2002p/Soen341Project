import JobPosting from "../job_search/JobPosting";
import Nav from '../../components/Navigation/Nav';
import {useState, useEffect} from 'react';
import './Home.scss';
import { GetJobsApi } from '../../utils/Api';

/**
 * Home
 * Displays the navigation and the job posting preview
 * 
 * &#x25BC; reference from https://stackoverflow.com/questions/2701192/what-characters-can-be-used-for-up-down-triangle-arrow-without-stem-for-displa 
 * @returns the home page
 */
export default function Home({ setView, setSelectedJob  }) {
  const [jobs, setJobs] = useState([]);
  
  useEffect(() => {
      const getOptions = async () => {
        const data = await GetJobsApi();
        if (!data) return;
        console.log(data);
        setJobs(data);
      };
      getOptions();
  }, []);

  return (
    <section className="homepage">
      <Nav setView={setView} />      

      <main className="home">
        <GetStarted />
        <JobPosting jobs={jobs} setView={setView} setSelectedJob={setSelectedJob} />
      </main>
    </section>
  );
}

/**
 * this component is omitted for this sprint at the moment
 * 
 * @returns 
 */
function GetStarted() {
  return (
    <section className="get-started">
      <section className="get-started-text">
        <h2 className="welcome"> Welcome to Career Connect! </h2>
        <h2 className="get-started-welcome"> let's get you started </h2>
        <button className="get-started-button"> Get Started </button>
      </section>

      <button className="arrow-down"> &#x25BC; </button>
    </section>
  );
}
