import "./JobSearch.scss";
const ITEMS_PER_PAGE = 10;
import { useState } from 'react';
import { Stack, Pagination } from '@mui/material';
/**
 * Job Search
 * 
 * @returns the job search component
 */
export default function JobSearch({ jobs }) {
  const [page, setPage] = useState(1);
  const handleChange = (e, value) => {
    setPage(value);
  };
  const startIndex = (page - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const currentJobs = jobs.slice(startIndex, endIndex);
  const totalPages = Math.ceil(jobs.length / ITEMS_PER_PAGE);

  return (
    <section className="job-search">
      <h2> Job Search </h2>

      <JobBoard jobs={currentJobs} /> 
      <Stack className="stack">
        <Pagination 
          count={totalPages} 
          page={page} 
          onChange={handleChange} 
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
function JobBoard({ jobs }) {
  const displayJobs = jobs.map((job) => {
    const recruiterName = job.recruiter?.profile
      ? `${job.recruiter.profile.firstName} ${job.recruiter.profile.lastName}`
      : "";
    const deadlineDate = new Date(job.deadline).toLocaleDateString();

    return (
      <a href={`/jobs/${job.jobId}`} key={job.jobId} className="job">
        <div className="pin"></div>
        <p className="job-title">{job.title}</p>
        <p className="job-company">{job.company?.name}</p>
        <p className="job-recruiter">Posted by {recruiterName}</p>
        <div className="job-meta">
          <div className="job-location">{job.location}</div>
          <span className="job-salary">${job.salary.toLocaleString()} </span>
          <span className="job-type">{job.employmentType}</span>
          <div className="job-deadline">Deadline: {deadlineDate}</div>
        </div>
        <p className="job-description">{job.description}</p>
        <Requirements requirements={job.skills} />
      </a>
    );
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
    <li key={req.skillId}> {req.skill} </li>
  );
    
  return (
    <ul className="requirements">
      { displayReq }
    </ul>
  );
}
