import { useState , useEffect} from 'react';
import { useAuth } from "../../utils/Auth";
import './AddJobOpening.scss';
import {CreateJobApi, GetCompaniesApi} from '../../utils/Api';

/**
 * Add Job Opening
 * Page where it has a big + in the middle and when clicking on it,
 * opens the AddJobOpeningPage so you can't post a new job
 * 
 * @param {Function} setIsAdding 
 * @returns Add Job Opening component
 */
export function AddJobOpening({ setIsAdding, setCurrentJob }) {
  return (
    <section onClick={() => { setCurrentJob({}); setIsAdding(true); }} className="add-job-button">
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
export function AddJobOpeningPage({ setIsAdding, currentJob }) {
  const {token} = useAuth();
  const [title, setTitle] = useState("");
  const [company, setCompany] = useState("");
  const [location, setLocation] = useState("");
  const [description, setDescription] = useState("");
  const [salary, setSalary] = useState(0);
  const [deadline, setDeadline] = useState(null);
  const [category, setCategory] = useState("");
  const [listCompany, setListCompany] = useState([]);

  // employment type: on_site, hybrid, remote
  const [type, setType] = useState(""); 

  const [archived, setArchived] = useState(false);

  useEffect(() => {
    const getCompany = async () => {
      const data = await GetCompaniesApi();
      if (!data) return;
      setListCompany(data);
    };
    getCompany();
  }, []);

  const setPlaceholder = (input) => {
    if (!Object.keys(currentJob).length > 0) return;

    if (input === "company") {
      return currentJob.company.companyId;
    }

    if (input === "deadline") {
      const date = new Date(currentJob.deadline);
      date.setMinutes(date.getMinutes() - date.getTimezoneOffset())
      return date.toISOString().slice(0, 16); 
    }

    return currentJob[input];
  }

  return (
    <section className='add-job-opening-page'>
      <section className='add-job-opening-content'>
        <div className='add-job-page-header'>
          <h2> Job Posting </h2>
          <p onClick={() => { setIsAdding(false); }} className='leave'> X </p>
        </div>

        <label className='add-job-inputs' htmlFor="job-title">
          Title:
          <input className='' placeholder={setPlaceholder("title")} type="text" name="job-title" maxLength="50" 
            onChange={(e) => { setTitle(e.target.value); }} 
          />
        </label>

        <label className='add-job-inputs' htmlFor="job-company">
          Company:
          <select onChange={(e) => { setCompany(e.target.value); }} id="job-company" name="job-company" value={setPlaceholder("company")} >
            <option value="">--Select a company--</option>
            {listCompany.map((c) => (
              <option key={c.companyId} value={c.companyId}>
                {c.name}
              </option>
            ))}
          </select>
        </label>

        <label className='add-job-inputs' htmlFor="job-employ-type">
          Employment Type: 
          <select onChange={(e) => { setType(e.target.value); }} name="employ-type" id="employ-type" value={setPlaceholder("employmentType")}>
            <option value="">--Select the employment type--</option>
            <option value="on_site" >On Site</option>
            <option value="hybrid">Hybrid</option>
            <option value="remote">Remote</option>
          </select>
        </label>

        <label className='add-job-inputs' htmlFor="job-category">
          Category:
          <input className='' placeholder={setPlaceholder("category")} type="text" name="job-category" maxLength="50" 
            onChange={(e) => { setCategory(e.target.value); }} 
          />
        </label>

        <label className='add-job-inputs' htmlFor="job-location">
          Location:
          <input className='' placeholder={setPlaceholder("location")} type="text" name="job-location" maxLength="100" 
            onChange={(e) => { setLocation(e.target.value); }} 
          />
        </label>

        <label className='add-job-inputs' htmlFor="job-description">
          Description:
          <input className='' placeholder={setPlaceholder("description")} type="text" name="job-description" maxLength="250" 
            onChange={(e) => { setDescription(e.target.value); }} 
          />
        </label>

        <label className='add-job-inputs' htmlFor="job-salary">
          Salary per year:
          <input className='' value={setPlaceholder("salary")} type="number" name="job-salary" min="0" max="5000000"
            onChange={(e) => { setSalary(e.target.value); }} 
          />
        </label>

        <label className='add-job-inputs' htmlFor="job-deadline">
          Deadline: 
          <input className='' value={setPlaceholder("deadline")} type="datetime-local" name="job-deadline"  
            onChange={(e) => { setDeadline(e.target.value); }} 
          />
        </label>

        {Object.keys(currentJob).length > 0 && (
          <div className='archive'>
            Archive:
            <div>
              <input type="radio" id="archive-yes" name="archive" value="yes" checked={archived} onChange={() => { setArchived(true); }} />
              <label htmlFor="archive-yes"> Yes </label>
            </div>

            <div>
              <input type="radio" id="archive-no" name="archive" value="no" checked={!archived} onChange={() => { setArchived(false); }} />
              <label htmlFor="archive-no"> No </label>
            </div>
          </div>
        )}

        <button onClick={() => { postJob(title, company, location, description, salary, deadline, type, category, setIsAdding, token); }}> Done </button>
      </section>
      
    </section>
  );
}

// Post Job is a function that will call the api to post the job after clicking on the Post button
async function postJob(title, company, location, description, salary, deadline, type, category, setIsAdding, token) {
  // call api to post the job
  setIsAdding(true);
    const job = {
    companyId: company,
    title,
    category,
    location,
    description,
    salary,
    employmentType: type,
    deadline
  };
  const newJob = await CreateJobApi(job, token)
  console.log(newJob);
  setIsAdding(false);
}