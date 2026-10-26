import { useState, useEffect } from 'react';
import './App.css';
import JobApplicationHistory from './views/history/JobApplicationHistory';
import JobApplication from './views/application/JobApplication';
import Home from './views/home/Home';
import Profile from './views/profile/Profile';
import Registration from './views/authentication/Registration';
import Login from './views/authentication/Login';
import JobSearch from './views/job_search/JobSearch'
import RecruiterJobPosting from './views/recruiter_job_posting/RecruiterJobPosting';

import { AuthContext } from './utils/Auth';
import { GetJobsApi } from "./utils/Api";

function Main() {
  const [view, setView] = useState("home");
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [selectedJob, setSelectedJob] = useState(null);
  const [jobs, setJobs] = useState([]);

  useEffect(() => {
    const getOptions = async () => {
      const data = await GetJobsApi();
      if (!data) return;
      setJobs(data);
    };
    getOptions();
  }, []);

  return (
    <AuthContext.Provider value={{ token, setToken, user, setUser }}>
      <div id="app">
        {view === "home" && <Home setView={setView} setSelectedJob={setSelectedJob}/> }
        {view === "profile" && <Profile setView={setView} />}
        {view === "registration" && <Registration setView={setView} />} 
        {view === "sign-in" && <Login setView={setView} />} 
        {view === "history" && <JobApplicationHistory setView={setView}/>}
        {view === "job-search" && <JobSearch setView={setView} setSelectedJob={setSelectedJob} />} 
        {view === "recruiter-job-posting" && <RecruiterJobPosting setView={setView} jobs={jobs} /> }
        {view === "job-application" && <JobApplication setView={setView} job={selectedJob}/> }
      </div>
    </AuthContext.Provider>
  );
};

export default Main;


