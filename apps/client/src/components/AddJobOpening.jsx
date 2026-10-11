import { useState } from 'react';

import './AddJobOpening.scss';

export function AddJobOpening({ setIsAdding }) {
  return (
    <section onClick={() => { setIsAdding(true); }} className="add-job-button">
      <p className='add-job'> + </p>
    </section>
  );
}

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
      <div>
        <h2> New Job Posting </h2>
        
      </div>

      <label htmlFor="job-title">
        Title:
        <input className='' type="text" name="job-title" maxLength="50" 
          onChange={(e) => { setTitle(e.target.value); }} 
        />
      </label>

      <label htmlFor="job-company">
        Company:
        <input className='' type="text" name="job-company"
          onChange={(e) => { setCompany(e.target.value); }} 
        />
      </label>

      <label htmlFor="job-location">
        Location:
        <input className='' type="text" name="job-location" maxLength="100" 
          onChange={(e) => { setLocation(e.target.value); }} 
        />
      </label>

      <label htmlFor="job-description">
        Description:
        <input className='' type="text" name="job-description" maxLength="250" 
          onChange={(e) => { setDescription(e.target.value); }} 
        />
      </label>

      <label htmlFor="job-salary">
        Salary:
        <input className='' type="number" name="job-salary"
          onChange={(e) => { setSalary(e.target.value); }} 
        />
      </label>

      <label htmlFor="job-deadline">
        Deadline: 
        <input className='' type="datetime-local" name="job-deadline"  
          onChange={(e) => { setDeadline(e.target.value); }} 
        />
      </label>

      <label htmlFor="job-employ-type">
        Employment Type: 
        <select onChange={(e) => { setType(e.target.value); }} name="employ-type" id="employ-type">
          <option value="">--Select the employment type--</option>
          <option value="on_site">On Site</option>
          <option value="hybrid">Hybrid</option>
          <option value="remote">Remote</option>
        </select>
      </label>

      <button onClick={() => { postJob(title, company, location, description, salary, deadline, type); }}> Post </button>
    </section>
  );
}

function postJob(title, company, location, description, salary, deadline, type) {
  // call api to post the job
}