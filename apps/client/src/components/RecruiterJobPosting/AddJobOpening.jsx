import { useState } from 'react';

import './AddJobOpening.scss';

/**
 * Add Job Opening
 * Page where it has a big + in the middle and when clicking on it,
 * opens the AddJobOpeningPage so you can't post a new job
 * 
 * @param {Function} setIsAdding 
 * @returns Add Job Opening component
 */
export function AddJobOpening({ setIsAdding }) {
  return (
    <section onClick={() => { setIsAdding(true); }} className="add-job-button">
      <p className='add-job'> + </p>
    </section>
  );
}

/**
 * Add Job Opening Page
 * the page prompts you to enter the information needed to make a job posting
 * 
 * @param {Function} setIsAdding 
 * @returns Add Job Opening Page
 */
export function AddJobOpeningPage({ setIsAdding }) {
  const [title, setTitle] = useState("");
  const [company, setCompany] = useState("");
  const [location, setLocation] = useState("");
  const [description, setDescription] = useState("");
  const [salary, setSalary] = useState(0);
  const [deadline, setDeadline] = useState(null);

  // employment type: on_site, hybrid, remote
  const [type, setType] = useState(""); 

  return (
    <section className='add-job-opening-page'>
      <section className='add-job-opening-content'>
        <div className='add-job-page-header'>
          <h2> New Job Posting </h2>
          <p onClick={() => { setIsAdding(false); }} className='leave'> X </p>
        </div>

        <label className='add-job-inputs' htmlFor="job-title">
          Title:
          <input className='' type="text" name="job-title" maxLength="50" 
            onChange={(e) => { setTitle(e.target.value); }} 
          />
        </label>

        <label className='add-job-inputs' htmlFor="job-company">
          Company:
          <input className='' type="text" name="job-company"
            onChange={(e) => { setCompany(e.target.value); }} 
          />
        </label>

        <label className='add-job-inputs' htmlFor="job-employ-type">
          Employment Type: 
          <select onChange={(e) => { setType(e.target.value); }} name="employ-type" id="employ-type">
            <option value="">--Select the employment type--</option>
            <option value="on_site">On Site</option>
            <option value="hybrid">Hybrid</option>
            <option value="remote">Remote</option>
          </select>
        </label>

        <label className='add-job-inputs' htmlFor="job-location">
          Location:
          <input className='' type="text" name="job-location" maxLength="100" 
            onChange={(e) => { setLocation(e.target.value); }} 
          />
        </label>

        <label className='add-job-inputs' htmlFor="job-description">
          Description:
          <input className='' type="text" name="job-description" maxLength="250" 
            onChange={(e) => { setDescription(e.target.value); }} 
          />
        </label>

        <label className='add-job-inputs' htmlFor="job-salary">
          Salary per year:
          <input className='' type="number" name="job-salary" min="0"
            onChange={(e) => { setSalary(e.target.value); }} 
          />
        </label>

        <label className='add-job-inputs' htmlFor="job-deadline">
          Deadline: 
          <input className='' type="datetime-local" name="job-deadline"  
            onChange={(e) => { setDeadline(e.target.value); }} 
          />
        </label>

        <button onClick={() => { postJob(title, company, location, description, salary, deadline, type, setIsAdding); }}> Post </button>
      </section>
      
    </section>
  );
}

// Post Job is a function that will call the api to post the job after clicking on the Post button
function postJob(title, company, location, description, salary, deadline, type, setIsAdding) {
  // call api to post the job

  setIsAdding(false);
}