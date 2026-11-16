import { useState, useEffect} from "react";
import { useAuth } from "../../utils/Auth";
import Nav from "../../components/Navigation/Nav";
import Folder from "../../components/RecruiterJobPosting/Folder";
import { AddJobOpeningPage } from "../../components/RecruiterJobPosting/AddJobOpening";
import {GetMyJobsApi} from '../../utils/Api';
import './RecruiterJobPosting.scss';

/**
 * Recruiter Job Posting
 * main page to see the recruiter job posting
 * 
 * @param {Function} setView 
 * @returns Recruiter Job Posting Component
 */
export default function RecruiterJobPosting({ setView }) {
  const [isAdding, setIsAdding] = useState(false);
  const [jobs, setJobs] = useState([]);
  const { token} = useAuth();
  const [currentJob, setCurrentJob] = useState({});

   useEffect(() => {
      const getMyJobs = async () => {
        const data = await GetMyJobsApi(token);
        if (!data) return;
        console.log(data);
        setJobs(data);
      };
      getMyJobs();
    }, [token]);

  const handleJobDeleted = (jobId) => {
    setJobs((prev) => prev.filter((j) => j.jobId !== jobId));
  };

  const handleJobSaved = (savedJob, isEdit) => {
    setJobs((prev) =>
      isEdit
        ? prev.map((j) => (j.jobId === savedJob.jobId ? { ...j, ...savedJob } : j))
        : [...prev, savedJob]
    );
  };
  return (
    <section>
      <Nav setView={setView} /> 

      <main className="recruiter-job-posting">
        <h2> Job Posting </h2>
        <Folder setIsAdding={setIsAdding} jobs={jobs} setCurrentJob={setCurrentJob} onDelete={handleJobDeleted} />
        { isAdding && <AddJobOpeningPage setIsAdding={setIsAdding} currentJob={currentJob} handleJobSaved ={handleJobSaved}/> }
      </main>
    </section>
  );
}
