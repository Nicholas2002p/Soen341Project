import { useState, useEffect } from "react";

import Nav from "../../components/Navigation/Nav";
import Folder from "../../components/RecruiterJobPosting/Folder";
import { AddJobOpeningPage } from "../../components/RecruiterJobPosting/AddJobOpening";
import './RecruiterJobPosting.scss';
import { GetJobsApi } from "../../utils/Api";

/**
 * Recruiter Job Posting
 * main page to see the recruiter job posting
 * 
 * @param {Function} setView 
 * @returns Recruiter Job Posting Component
 */
export default function RecruiterJobPosting({ setView }) {
  const [jobs, setJobs] = useState({});
  const [isAdding, setIsAdding] = useState(false);
  
  useEffect(() => {
    const getOptions = async () => {
      console.log("here");
      const data = await GetJobsApi();
      if (!data) return;
      console.log('data ' + data);
      setJobs(data);
    };
    getOptions();
  }, []);

  console.log('stuff ' + jobs);

  return (
    <section>
      <Nav setView={setView} /> 

      <main className="recruiter-job-posting">
        <h2> Job Posting </h2>
        <Folder setIsAdding={setIsAdding} jobs={jobs} />
        { isAdding && <AddJobOpeningPage setIsAdding={setIsAdding} /> }
      </main>
    </section>
  );
}
