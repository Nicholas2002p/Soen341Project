import "./JobSearch.scss";
const ITEMS_PER_PAGE = 10;
import { useState } from 'react';
import { Stack, Pagination } from '@mui/material';
import { useAuth } from './../../utils/Auth';
import {  GetJobApi } from '../../utils/Api';

/**
 * Job Search
 * 
 * @returns the job search component
 */
export default function JobList({ jobs, setView, setSelectedJob }) {
  const { token, user } = useAuth();
  const [page, setPage] = useState(1);
  const startIndex = (page - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const currentJobs = jobs.slice(startIndex, endIndex);
  const totalPages = Math.ceil(jobs.length / ITEMS_PER_PAGE);

  /**
   * handles the onclick befor going to job application screen and gets the job data 
   * @param {*} job 
   * @returns 
   */
  const handleSelectJob = async (job) => {
    if (token && user?.role != "recruiter"){
    const jobData = await GetJobApi(job.jobId);
    setSelectedJob(jobData);
    setView("job-application");
    }
  };

  return (
    <section className="job-search">
      <JobBoard jobs={currentJobs} onSelectJob={handleSelectJob}/> 
      <Stack className="stack">
        <Pagination 
          count={totalPages} 
          page={page} 
          onChange={(value) => {setPage(value)}} 
          color="primary" 
          variant="outlined" 
          shape="rounded"
        />
      </Stack> 
    </section>
  );
}

/**
 * Job Board
 * contains an array of many job postings where it shows: 
 * the title, the recruiter, the description and its requirements
 * 
 * @param {Object} jobs - what the job entails
 * @returns the job board component
 */
function JobBoard({ jobs,onSelectJob }) {
  const displayJobs = jobs.map((job) => {
    return makeJob(job, onSelectJob);

  });
  return (
    <div className="job-board">{displayJobs}</div>
  );
}

/**
 * Requirements
 * lists every requirement to display
 * 
 * @param {Array} requirements - list of requirements that the job is looking for
 * @returns the requirements component
 */
function Requirements({ requirements }) {
  const displayReq =  requirements.map( (req) =>
    <li key={req}> {req} </li>
  );
    
  return (
    <ul className="requirements">
      { displayReq }
    </ul>
  );
}

/**
 * helper function for JobBoard
 * sets the data 
 * @param {object} job
 * @returns html
 */
function makeJob(job, onSelectJob) {
    const deadlineDate = new Date(job.deadline).toLocaleDateString();
    return (
        <a href={`/jobs/${job.jobId}`} key={job.jobId} className="job"
        onClick={(e) => { e.preventDefault(); onSelectJob(job); }}>
          <div className="pin"></div>
          <p className="job-title">{job.title}</p>
          <p className="job-company">{job.company?.name}</p>
          <div>
            <div className="job-location">{job.location}</div>
            <span className="job-salary">${job.salary} </span>
            <span className="job-type">{job.employmentType}</span>
            <div className="job-type">Category: {job.category}</div>
            <div className="job-deadline">Deadline: {deadlineDate}</div>
          </div>
          <p className="job-description">{job.description}</p>
          <Requirements requirements={job.skills} />
        </a>
    );
}
